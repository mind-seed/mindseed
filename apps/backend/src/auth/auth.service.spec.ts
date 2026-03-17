import { Test, TestingModule } from "@nestjs/testing";
import { JwtModule } from "@nestjs/jwt";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import PGMem, { DataType } from "pg-mem";
import IORedisMock from "ioredis-mock";
import {
  AuthService,
  EmailAlreadyExistsError,
  EmailRateLimitedError,
  InvalidCredentialsError,
  InvalidRefreshTokenError,
  InvalidSignUpTokenError,
  InvalidVerificationCodeError,
  VerificationCooldownError,
} from "./auth.service";
import { VerificationCodeService } from "./verification-code/verification-code.service";
import { VerificationCodeStore } from "./verification-code/verification-code.store";
import { hashVerificationCode } from "./verification-code/hash-verification-code.helper";
import { UserService } from "../user/user.service";
import { MailService } from "../mail/mail.service";
import { FakeMailService } from "../mail/mail.service.fake";
import { EmailRateLimitService } from "./email-rate-limit/email-rate-limit.service";
import { EmailRateLimitStore } from "./email-rate-limit/email-rate-limit.store";
import { REDIS_CLIENT } from "../redis/redis.module";
import { User, UserRole } from "../user/user.entity";
import { UserProfile } from "../user/user-profile.entity";
import { SignUpTokenService } from "./sign-up-token/sign-up-token.service";
import { AccessTokenService } from "./access-token/access-token.service";
import { RefreshTokenService } from "./refresh-token/refresh-token.service";
import { RefreshToken } from "./refresh-token/refresh-token.entity";
import { EntityClassOrSchema } from "@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type";
import { bcryptHash } from "./bcrypt.helper";

// dependent 한 order
const entities: EntityClassOrSchema[] = [RefreshToken, UserProfile, User];

async function createTestUser(email: string, password: string): Promise<User> {
  const testUserProfile = new UserProfile();
  testUserProfile.nickname = "John Doe";
  testUserProfile.age = 20;

  const testUser = new User();
  testUser.email = email;
  testUser.password = await bcryptHash(password);
  testUser.role = UserRole.USER;
  testUser.profile = testUserProfile;

  return testUser;
}

async function initializePgMem() {
  const db = PGMem.newDb();

  db.public.registerFunction({
    name: "version",
    returns: DataType.text,
    implementation: () => "PostgreSQL 16.0",
  });

  db.public.registerFunction({
    name: "current_database",
    implementation: () => "test-database",
  });

  const dataSource = (await db.adapters.createTypeormDataSource({
    type: "postgres",
    entities,
    synchronize: true,
  })) as DataSource;

  await dataSource.initialize();

  return { db, dataSource };
}

describe("AuthService", () => {
  let module: TestingModule;

  let authService: AuthService;

  let accessTokenService: AccessTokenService;
  let signUpTokenService: SignUpTokenService;
  let verificationCodeStore: VerificationCodeStore;
  let emailRateLimitService: EmailRateLimitService;
  let mailService: FakeMailService;
  let userRepository: Repository<User>;
  let refreshTokenRepository: Repository<RefreshToken>;
  let refreshTokenService: RefreshTokenService;
  let redis: InstanceType<typeof IORedisMock>;
  let dataSource: DataSource;
  let dbBackUp: PGMem.IBackup;

  beforeAll(async () => {
    const pgMemResult = await initializePgMem();
    dataSource = pgMemResult.dataSource;
    const db = pgMemResult.db;

    redis = new IORedisMock();
    mailService = new FakeMailService();

    module = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: "test-secret",
          signOptions: { expiresIn: "1h" },
        }),
      ],
      providers: [
        AuthService,

        UserService,
        EmailRateLimitService,
        VerificationCodeService,

        AccessTokenService,
        RefreshTokenService,
        SignUpTokenService,
        VerificationCodeStore,
        EmailRateLimitStore,
        { provide: MailService, useValue: mailService },
        { provide: DataSource, useValue: dataSource },
        ...entities.map((entity) => ({
          provide: getRepositoryToken(entity),
          useValue: dataSource.getRepository(entity),
        })),
        { provide: REDIS_CLIENT, useValue: redis },
      ],
    }).compile();

    dbBackUp = db.backup();

    authService = module.get(AuthService);

    accessTokenService = module.get(AccessTokenService);
    verificationCodeStore = module.get(VerificationCodeStore);
    emailRateLimitService = module.get(EmailRateLimitService);
    signUpTokenService = module.get(SignUpTokenService);
    refreshTokenRepository = dataSource.getRepository(RefreshToken);
    userRepository = dataSource.getRepository(User);
    refreshTokenService = module.get(RefreshTokenService);
  });

  beforeEach(async () => {
    await redis.flushall();
    dbBackUp.restore();

    mailService.sent = [];
    mailService.shouldFail = false;
  });

  afterAll(async () => {
    await dataSource.destroy();
    await module.close();
  });

  describe("sendVerificationMail", () => {
    it("success: 이메일 전송, 인증 코드 저장", async () => {
      // Given: 새로운 이메일인 경우
      const email = "test@example.com";

      // When
      await expect(
        authService.sendVerificationMail(email),
      ).resolves.not.toThrow();

      // Then: 이메일 전송, 인증 코드 저장
      expect(mailService.lastSentTo(email)).not.toBeNull();
      expect(await verificationCodeStore.find(email)).not.toBeNull();
    });

    it("이메일 중복 처리", async () => {
      // Given: 이미 가입된 이메일인 경우
      const email = "test@example.com";
      await userRepository.save(await createTestUser(email, "password"));

      // When
      const result = authService.sendVerificationMail(email);

      // Then: throws handled error, 이메일 전송 안됨, 인증 코드 저장 안됨
      await expect(result).rejects.toThrow(EmailAlreadyExistsError);
      expect(mailService.lastSentTo(email)).toBeNull();
      expect(await verificationCodeStore.find(email)).toBeNull();
    });

    it("이메일 cooldown 처리", async () => {
      // Given: cooldown 중인 이메일이 존재하는 경우
      const email = "test@example.com";
      const existingHashedCode = hashVerificationCode("123456");
      await verificationCodeStore.save(email, existingHashedCode, 30);

      // When
      const result = authService.sendVerificationMail(email);

      // Then: throws handled error, 이메일 전송 안됨, 인증 코드 저장 안됨 (기존 코드 유지됨)
      await expect(result).rejects.toThrow(VerificationCooldownError);
      expect(mailService.lastSentTo(email)).toBeNull();
      expect(await verificationCodeStore.find(email)).not.toBeNull();
    });

    it("이메일 rate limit 처리", async () => {
      // Given: 이메일이 rate limit중인 경우
      const email = "test@example.com";
      for (let i = 0; i < 5; i++) {
        await emailRateLimitService.increment(email);
      }

      // When
      const result = authService.sendVerificationMail(email);

      // Then: throws handled error, 이메일 전송 안됨, 인증 코드 저장 안됨
      await expect(result).rejects.toThrow(EmailRateLimitedError);
      expect(mailService.lastSentTo(email)).toBeNull();
      expect(await verificationCodeStore.find(email)).toBeNull();
    });

    it("이메일 전송 실패 처리", async () => {
      // Given: 이메일 전송이 실패하는 경우
      const email = "test@example.com";
      mailService.shouldFail = true;

      // When
      const result = authService.sendVerificationMail(email);

      // Then: 이메일 전송 안됨, 인증 코드 저장 안됨
      await expect(result).rejects.toThrow();
      expect(mailService.lastSentTo(email)).toBeNull();
      expect(await verificationCodeStore.find(email)).toBeNull();
    });

    it("인증 코드 저장 실패 처리", async () => {
      // Given: Redis 저장이 실패하는 경우
      const email = "test@example.com";
      jest.spyOn(verificationCodeStore, "save").mockImplementationOnce(() => {
        throw new Error("Redis failure");
      });

      // When
      const result = authService.sendVerificationMail(email);

      // Then: 이메일 전송 안됨
      await expect(result).rejects.toThrow();
      expect(mailService.lastSentTo(email)).toBeNull();
    });
  });

  describe("verifyMail", () => {
    it("success: JWT 반환, 인증 코드 삭제", async () => {
      // Given: 검증을 시도하는 인증 코드 및 이메일이 존재하는 경우
      const email = "test@example.com";
      const code = "123456";
      await verificationCodeStore.save(email, hashVerificationCode(code), 30);

      // When: 저장된 인증 코드로 검증 시도
      const token = await authService.verifyMail(email, code);

      // Then: 올바른 JWT 반환, 인증 코드 삭제됨
      expect(signUpTokenService.decode(token).email).toBe(email);
      expect(await verificationCodeStore.find(email)).toBeNull();
    });

    it("올바르지 않은 이메일 처리", async () => {
      // Given: 검증을 시도하는 인증 코드는 존재하지만, 이메일은 존재하지 않는 경우
      const email = "test@example.com";
      const storedEmail = "another@example.com";
      const code = "123456";
      await verificationCodeStore.save(
        storedEmail,
        hashVerificationCode(code),
        30,
      );

      // When: 저장된 인증 코드로 검증 시도
      const result = authService.verifyMail(email, code);

      // Then: throws handled error, 인증 코드 삭제 안됨
      await expect(result).rejects.toThrow(InvalidVerificationCodeError);
      expect(await verificationCodeStore.find(storedEmail)).not.toBeNull();
    });

    it("올바르지 않은 인증 코드 처리", async () => {
      // Given: 검증을 시도하는 인증 코드는 존재하지 않지만, 이메일은 존재하는 경우
      const email = "test@example.com";
      const code = "123456";
      await verificationCodeStore.save(
        email,
        hashVerificationCode("654321"),
        30,
      );

      // When: 저장된 인증 코드로 검증 시도
      const result = authService.verifyMail(email, code);

      // Then: throws handled error, 인증 코드 삭제 안됨
      await expect(result).rejects.toThrow(InvalidVerificationCodeError);
      expect(await verificationCodeStore.find(email)).not.toBeNull();
    });

    it("JWT 생성 실패 처리", async () => {
      // Given: JWT signing이 실패하는 경우
      const email = "test@example.com";
      const code = "123456";
      await verificationCodeStore.save(email, hashVerificationCode(code), 30);
      jest.spyOn(signUpTokenService, "sign").mockImplementationOnce(() => {
        throw new Error("JWT failure");
      });

      // When: 저장된 인증 코드로 검증 시도
      const result = authService.verifyMail(email, code);

      // Then: 검증 실패, 인증 코드 삭제 안됨
      await expect(result).rejects.toThrow();
      expect(await verificationCodeStore.find(email)).not.toBeNull();
    });

    it("인증 코드 삭제 실패 처리", async () => {
      // Given: Redis 삭제가 실패하는 경우
      const email = "test@example.com";
      const code = "123456";
      await verificationCodeStore.save(email, hashVerificationCode(code), 30);
      jest.spyOn(verificationCodeStore, "remove").mockImplementationOnce(() => {
        throw new Error("Redis failure");
      });

      // When: 저장된 인증 코드로 검증 시도
      const result = authService.verifyMail(email, code);

      // Then: 검증 실패
      await expect(result).rejects.toThrow();
    });
  });

  describe("completeSignup", () => {
    it("success: 유저 및 토큰 저장, 토큰 반환", async () => {
      // Given: 올바른 회원가입 토큰
      const email = "test@example.com";
      const password = "password";
      const nickname = "John Doe";
      const age = 20;
      const signUpToken = signUpTokenService.sign(email);

      // When: 회원가입 시도
      const result = await authService.completeSignup(
        signUpToken,
        password,
        nickname,
        age,
      );

      // Then: 유저 및 토큰 저장, 올바른 토큰 반환
      const user = await userRepository.findOneBy({ email });
      expect(user).not.toBeNull();

      const { accessToken, refreshToken } = result;
      expect(accessTokenService.verify(accessToken).sub).toBe(user!.id);
      expect(
        (
          await refreshTokenRepository.findOneBy({
            user: { id: user!.id },
          })
        )?.token,
      ).toBe(refreshToken);
    });

    it("올바르지 않은 회원가입 토큰 처리", async () => {
      // Given: 올바르지 않은 회원가입 토큰인 경우
      const email = "test@example.com";
      const password = "password";
      const nickname = "John Doe";
      const age = 20;
      const invalidSignUpToken = "invaild-random-token";

      // When: 회원가입 시도
      const result = authService.completeSignup(
        invalidSignUpToken,
        password,
        nickname,
        age,
      );

      // Then: throws handled error, 유저 저장하지 않음
      await expect(result).rejects.toThrow(InvalidSignUpTokenError);
      const user = await userRepository.findOneBy({ email });
      expect(user).toBeNull();
    });

    it("이메일 중복 처리", async () => {
      // Given: 올바른 회원가입 토큰, 중복된 이메일로 사용자가 존재하는 경우
      const email = "test@example.com";
      const password = "password";
      const nickname = "John Doe";
      const age = 20;
      const signUpToken = signUpTokenService.sign(email);

      const existingUser = await createTestUser(email, "password");
      await userRepository.save<User>(existingUser);

      // When: 회원가입 시도
      const result = authService.completeSignup(
        signUpToken,
        password,
        nickname,
        age,
      );

      // Then: throws handled error
      await expect(result).rejects.toThrow(EmailAlreadyExistsError);
    });
  });

  describe("login", () => {
    it("success: 토큰 저장, 유저 및 토큰 반환", async () => {
      // Given: 올바른 이메일 및 비밀번호
      const email = "test@example.com";
      const password = "password";
      const user = await createTestUser(email, password);
      await userRepository.save(user);

      // When: 로그인 시도
      const result = await authService.login(email, password);

      // Then: 토큰 저장, 유저 및 토큰 반환
      expect(result.user.email).toBe(email);
      expect(accessTokenService.verify(result.tokens.accessToken).sub).toBe(
        result.user.id,
      );
      const storedToken = await refreshTokenRepository.findOneBy({
        user: { id: result.user.id },
      });
      expect(storedToken?.token).toBe(result.tokens.refreshToken);
    });

    it("존재하지 않는 유저 처리", async () => {
      // Given: 존재하지 않는 이메일인 경우
      const email = "test@example.com";
      const password = "password";

      // When: 로그인 시도
      const result = authService.login(email, password);

      // Then: throws handled error, 토큰 저장하지 않음
      expect(result).rejects.toThrow(InvalidCredentialsError);
    });

    it("올바르지 않은 비밀번호 처리", async () => {
      // Given: 올바르지 않은 비밀번호인 경우
      const email = "test@example.com";
      const expectedPassword = "password";
      const incorrectPassword = "invalid";
      const user = await createTestUser(email, expectedPassword);
      await userRepository.save(user);

      // When: 로그인 시도
      const result = authService.login(email, incorrectPassword);

      // Then: throws handled error, 토큰 저장하지 않음
      expect(result).rejects.toThrow(InvalidCredentialsError);
    });
  });

  describe("refreshTokens", () => {
    it("success: 토큰 재발급 및 저장", async () => {
      // Given: 존재하는 유저에 대한 올바른 refresh token
      const email = "test@example.com";
      const password = "password";
      const user = await userRepository.save(
        await createTestUser(email, password),
      );
      const oldToken = await refreshTokenService.issue(user.id);

      // When: refresh 시도
      const result = await authService.refreshTokens(oldToken);

      // Then: 기존 refresh token 삭제, 새로운 token 저장 및 반환
      expect(
        await refreshTokenRepository.findOneBy({ token: oldToken }),
      ).toBeNull();
      expect(
        (
          await refreshTokenRepository.findOne({
            where: { token: result.refreshToken },
            relations: {
              user: true,
            },
          })
        )?.user.id,
      ).toBe(user.id);
      expect(accessTokenService.verify(result.accessToken).sub).toBe(user.id);
    });

    it("존재하지 않는 refresh token 처리", async () => {
      // Given: 존재하지 않는 refresh token일 경우
      const nonExistentToken = "non-existent-token";

      // When: refresh 시도
      const result = authService.refreshTokens(nonExistentToken);

      // Then: throws handled error, 토큰 저장하지 않음
      await expect(result).rejects.toThrow(InvalidRefreshTokenError);
      expect(await refreshTokenRepository.find()).toHaveLength(0);
    });
  });
});
