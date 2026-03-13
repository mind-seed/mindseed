import { Test, TestingModule } from "@nestjs/testing";
import { JwtModule } from "@nestjs/jwt";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import PGMem, { DataType } from "pg-mem";
import IORedisMock from "ioredis-mock";
import { AuthService, AuthServiceError } from "./auth.service";
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
import { RefreshTokenStore } from "./refresh-token/refresh-token.store";
import { AccessTokenService } from "./access-token/access-token.service";
import { RefreshTokenService } from "./refresh-token/refresh-token.service";

function createTestUserWithEmail(email: string): User {
  const testUserProfile = new UserProfile();
  testUserProfile.nickname = "John Doe";
  testUserProfile.age = 20;

  const testUser = new User();
  testUser.email = email;
  testUser.password = "password";
  testUser.role = UserRole.USER;
  testUser.profile = testUserProfile;

  return testUser;
}

async function createInMemoryDataSource() {
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
    entities: [User, UserProfile],
    synchronize: true,
  })) as DataSource;

  await dataSource.initialize();

  return dataSource;
}

describe("AuthService", () => {
  let module: TestingModule;

  let authService: AuthService;

  let accessTokenService: AccessTokenService;
  let refreshTokenStore: RefreshTokenStore;
  let signUpTokenService: SignUpTokenService;
  let verificationCodeStore: VerificationCodeStore;
  let emailRateLimitService: EmailRateLimitService;
  let mailService: FakeMailService;
  let userRepository: Repository<User>;
  let redis: InstanceType<typeof IORedisMock>;
  let dataSource: DataSource;

  beforeAll(async () => {
    dataSource = await createInMemoryDataSource();
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
        RefreshTokenStore,
        SignUpTokenService,
        VerificationCodeStore,
        EmailRateLimitStore,
        { provide: MailService, useValue: mailService },
        {
          provide: getRepositoryToken(User),
          useValue: dataSource.getRepository(User),
        },
        {
          provide: getRepositoryToken(UserProfile),
          useValue: dataSource.getRepository(UserProfile),
        },
        { provide: REDIS_CLIENT, useValue: redis },
      ],
    }).compile();

    authService = module.get(AuthService);

    accessTokenService = module.get(AccessTokenService);
    refreshTokenStore = module.get(RefreshTokenStore);
    verificationCodeStore = module.get(VerificationCodeStore);
    emailRateLimitService = module.get(EmailRateLimitService);
    signUpTokenService = module.get(SignUpTokenService);
    userRepository = dataSource.getRepository(User);
  });

  beforeEach(async () => {
    await dataSource.getRepository(UserProfile).clear();
    await dataSource.getRepository(User).clear();
    await redis.flushall();
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
      await userRepository.save(createTestUserWithEmail(email));

      // When
      const result = authService.sendVerificationMail(email);

      // Then: throws handled error, 이메일 전송 안됨, 인증 코드 저장 안됨
      await expect(result).rejects.toThrow(AuthServiceError);
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
      await expect(result).rejects.toThrow(AuthServiceError);
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
      await expect(result).rejects.toThrow(AuthServiceError);
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
      // Given: 검증을 시도하는 인증 코드가 존재하는 경우
      const email = "test@example.com";
      const code = "123456";
      await verificationCodeStore.save(email, hashVerificationCode(code), 30);

      // When: 저장된 인증 코드로 검증 시도
      const token = await authService.verifyMail(email, code);

      // Then: 올바른 JWT 반환, 인증 코드 삭제됨
      expect(signUpTokenService.decode(token).email).toBe(email);
      expect(await verificationCodeStore.find(email)).toBeNull();
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
    it("success: 유저 저장, JWT 반환", async () => {
      // Given: 올바른 회원가입 토큰
      const email = "test@example.com";
      const password = "password";
      const signUpToken = signUpTokenService.sign(email);

      // When: 회원가입 시도
      const result = await authService.completeSignup(signUpToken, password);

      // Then: 유저 저장, 올바른 JWT 반환
      const user = await userRepository.findOneBy({ email });
      expect(user).not.toBeNull();

      const { accessToken, refreshToken } = result;
      expect(accessTokenService.verify(accessToken).sub).toBe(user!.id);
      expect(await refreshTokenStore.find(user!.id)).toBe(refreshToken);
    });

    it("올바르지 않은 회원가입 토큰 처리", async () => {
      // Given: 올바르지 않은 회원가입 토큰인 경우
      const email = "test@example.com";
      const password = "password";
      const invalidSignUpToken = "invaild-random-token";

      // When: 회원가입 시도
      const result = authService.completeSignup(invalidSignUpToken, password);

      // Then: throws handled error, 유저 저장하지 않음
      await expect(result).rejects.toThrow(AuthServiceError);
      const user = await userRepository.findOneBy({ email });
      expect(user).toBeNull();
    });

    it("이메일 중복 처리", async () => {
      // Given: 올바른 회원가입 토큰, 중복된 이메일로 사용자가 존재하는 경우
      const email = "test@example.com";
      const password = "password";
      const existingUser = createTestUserWithEmail(email);
      await userRepository.save<User>(existingUser);
      const signUpToken = signUpTokenService.sign(email);

      // When: 회원가입 시도
      const result = authService.completeSignup(signUpToken, password);

      // Then: throws handled error
      await expect(result).rejects.toThrow(AuthServiceError);
    });
  });
});
