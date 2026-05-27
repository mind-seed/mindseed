import { Test, TestingModule } from "@nestjs/testing";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import PGMem from "pg-mem";
import { initializePgMem } from "src/test/pg-mem.helper";
import IORedisMock from "ioredis-mock";
import { AuthService } from "./auth.service";
import {
  EmailAlreadyExistsError,
  EmailRateLimitedError,
  InvalidCredentialsError,
  InvalidPasswordResetTokenError,
  InvalidRefreshTokenError,
  InvalidSignUpTokenError,
  InvalidVerificationCodeError,
  VerificationCooldownError,
} from "./auth.errors";
import { VerificationCodeService } from "./verification-code/verification-code.service";
import { VerificationCodeStore } from "./verification-code/verification-code.store";
import { hashVerificationCode } from "./verification-code/hash-verification-code.helper";
import { UserService } from "../user/user.service";
import { MailService } from "../mail/mail.service";
import { FakeMailService } from "../mail/mail.service.fake";
import { EmailRateLimitService } from "./email-rate-limit/email-rate-limit.service";
import { EmailRateLimitStore } from "./email-rate-limit/email-rate-limit.store";
import { REDIS_CLIENT } from "../redis/redis.module";
import { User, UserRole } from "../user/entities/user.entity";
import { UserProfile } from "../user/entities/user-profile.entity";
import { EmailTokenService } from "./email-token/email-token.service";
import {
  AccessTokenPayload,
  AccessTokenService,
} from "./access-token/access-token.service";
import { RefreshTokenService } from "./refresh-token/refresh-token.service";
import { RefreshToken } from "./refresh-token/refresh-token.entity";
import { bcryptHash } from "./bcrypt.helper";
import { EmailUsageType } from "./email-usage.types";

// dependent 한 order
const entities = [RefreshToken, UserProfile, User];

describe("AuthService", () => {
  let module: TestingModule;

  let authService: AuthService;

  let jwtService: JwtService;
  let emailTokenService: EmailTokenService;
  let verificationCodeStore: VerificationCodeStore;
  let emailRateLimitService: EmailRateLimitService;
  let mailService: FakeMailService;
  let userRepository: Repository<User>;
  let refreshTokenRepository: Repository<RefreshToken>;
  let refreshTokenService: RefreshTokenService;
  let redis: InstanceType<typeof IORedisMock>;
  let dataSource: DataSource;
  let dbBackup: PGMem.IBackup;

  async function saveTestUser(
    email: string,
    password: string,
    overrides?: Partial<User>,
  ): Promise<User> {
    return userRepository.save(
      userRepository.create({
        email,
        password: await bcryptHash(password),
        role: UserRole.USER,
        profile: userRepository.manager.create(UserProfile, {
          nickname: "John Doe",
          age: 20,
        }),
        ...overrides,
      }),
    );
  }

  beforeAll(async () => {
    const { dataSource: ds, backup } = await initializePgMem(entities);
    dataSource = ds;
    dbBackup = backup;

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
        EmailTokenService,
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

    authService = module.get(AuthService);

    jwtService = module.get(JwtService);
    verificationCodeStore = module.get(VerificationCodeStore);
    emailRateLimitService = module.get(EmailRateLimitService);
    emailTokenService = module.get(EmailTokenService);
    refreshTokenRepository = dataSource.getRepository(RefreshToken);
    userRepository = dataSource.getRepository(User);
    refreshTokenService = module.get(RefreshTokenService);
  });

  beforeEach(async () => {
    await redis.flushall();
    dbBackup.restore();

    mailService.sent = [];
    mailService.shouldFail = false;
  });

  afterAll(async () => {
    await dataSource.destroy();
    await module.close();
  });

  describe("sendSignUpVerificationMail", () => {
    it("success: 이메일 전송, 인증 코드 저장", async () => {
      // Given: 새로운 이메일인 경우
      const email = "test@example.com";

      // When
      await expect(
        authService.sendSignUpVerificationMail(email),
      ).resolves.not.toThrow();

      // Then: 이메일 전송, 인증 코드 저장
      expect(mailService.lastSentTo(email)).not.toBeNull();
      expect(await verificationCodeStore.find(email)).not.toBeNull();
    });

    it("이메일 중복 처리", async () => {
      // Given: 이미 가입된 이메일인 경우
      const email = "test@example.com";
      await saveTestUser(email, "password");

      // When
      const result = authService.sendSignUpVerificationMail(email);

      // Then: throws handled error, 이메일 전송 안됨, 인증 코드 저장 안됨
      await expect(result).rejects.toThrow(EmailAlreadyExistsError);
      expect(mailService.lastSentTo(email)).toBeNull();
      expect(await verificationCodeStore.find(email)).toBeNull();
    });

    it("이메일 cooldown 처리", async () => {
      // Given: cooldown 중인 이메일이 존재하는 경우
      const email = "test@example.com";
      const existingHashedCode = hashVerificationCode("123456");
      await verificationCodeStore.save(
        email,
        existingHashedCode,
        EmailUsageType.SIGN_UP,
        30,
      );

      // When
      const result = authService.sendSignUpVerificationMail(email);

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
      const result = authService.sendSignUpVerificationMail(email);

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
      const result = authService.sendSignUpVerificationMail(email);

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
      const result = authService.sendSignUpVerificationMail(email);

      // Then: 이메일 전송 안됨
      await expect(result).rejects.toThrow();
      expect(mailService.lastSentTo(email)).toBeNull();
    });
  });

  describe("sendPasswordResetVerificationMail", () => {
    it("success: 이메일 전송, 인증 코드 저장", async () => {
      // Given: 가입된 이메일인 경우
      const email = "test@example.com";
      await saveTestUser(email, "password");

      // When
      await expect(
        authService.sendPasswordResetVerificationMail(email),
      ).resolves.not.toThrow();

      // Then: 이메일 전송, 인증 코드 저장
      expect(mailService.lastSentTo(email)).not.toBeNull();
      expect(await verificationCodeStore.find(email)).not.toBeNull();
    });

    it("존재하지 않는 이메일 처리 (이메일 열거 방지)", async () => {
      // Given: 가입되지 않은 이메일인 경우
      const email = "test@example.com";

      // When
      const result = authService.sendPasswordResetVerificationMail(email);

      // Then: 성공 응답, 이메일 전송 안됨, 인증 코드 저장 안됨
      await expect(result).resolves.not.toThrow();
      expect(mailService.lastSentTo(email)).toBeNull();
      expect(await verificationCodeStore.find(email)).toBeNull();
    });
  });

  describe("verifyMail", () => {
    it("success: JWT 반환, 인증 코드 삭제", async () => {
      // Given: 검증을 시도하는 인증 코드 및 이메일이 존재하는 경우
      const email = "test@example.com";
      const code = "123456";
      await verificationCodeStore.save(
        email,
        hashVerificationCode(code),
        EmailUsageType.SIGN_UP,
        30,
      );

      // When: 저장된 인증 코드로 검증 시도
      const token = await authService.verifyMail(email, code);

      // Then: 올바른 JWT 반환, 인증 코드 삭제됨
      expect(emailTokenService.decode(token).email).toBe(email);
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
        EmailUsageType.SIGN_UP,
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
        EmailUsageType.SIGN_UP,
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
      await verificationCodeStore.save(
        email,
        hashVerificationCode(code),
        EmailUsageType.SIGN_UP,
        30,
      );
      jest.spyOn(emailTokenService, "sign").mockImplementationOnce(() => {
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
      await verificationCodeStore.save(
        email,
        hashVerificationCode(code),
        EmailUsageType.SIGN_UP,
        30,
      );
      jest.spyOn(verificationCodeStore, "remove").mockImplementationOnce(() => {
        throw new Error("Redis failure");
      });

      // When: 저장된 인증 코드로 검증 시도
      const result = authService.verifyMail(email, code);

      // Then: 검증 실패
      await expect(result).rejects.toThrow();
    });
  });

  describe("signUp", () => {
    it("success: 유저 및 토큰 저장, 토큰 반환", async () => {
      // Given: 올바른 회원가입 토큰
      const email = "test@example.com";
      const password = "password";
      const nickname = "John Doe";
      const age = 20;
      const signUpToken = emailTokenService.sign(email, EmailUsageType.SIGN_UP);

      // When: 회원가입 시도
      const result = await authService.signUp(
        signUpToken,
        password,
        nickname,
        age,
      );

      // Then: 유저 및 토큰 저장, 올바른 토큰 반환
      const user = await userRepository.findOneBy({ email });
      expect(user).not.toBeNull();

      const { accessToken, refreshToken } = result;
      expect(jwtService.verify<AccessTokenPayload>(accessToken).sub).toBe(
        user!.id,
      );
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
      const result = authService.signUp(
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
      const signUpToken = emailTokenService.sign(email, EmailUsageType.SIGN_UP);

      await saveTestUser(email, "password");

      // When: 회원가입 시도
      const result = authService.signUp(signUpToken, password, nickname, age);

      // Then: throws handled error
      await expect(result).rejects.toThrow(EmailAlreadyExistsError);
    });

    it("올바르지 않은 토큰 타입 처리", async () => {
      // Given: 다른 타입의 email token 경우
      const email = "test@example.com";
      const password = "password";
      const nickname = "John Doe";
      const age = 20;
      const wrongToken = emailTokenService.sign(
        email,
        EmailUsageType.PASSWORD_RESET,
      );

      // When: 회원가입 시도
      const result = authService.signUp(wrongToken, password, nickname, age);

      // Then: throws handled error, 유저 저장하지 않음
      await expect(result).rejects.toThrow(InvalidSignUpTokenError);
      expect(await userRepository.findOneBy({ email })).toBeNull();
    });
  });

  describe("login", () => {
    it("success: 토큰 저장 및 반환", async () => {
      // Given: 올바른 이메일 및 비밀번호
      const email = "test@example.com";
      const password = "password";
      const user = await saveTestUser(email, password);

      // When: 로그인 시도
      const result = await authService.login(email, password);

      // Then: 토큰 저장 및 반환
      expect(
        jwtService.verify<AccessTokenPayload>(result.accessToken).sub,
      ).toBe(user.id);
      const storedToken = await refreshTokenRepository.findOneBy({
        user: { id: user.id },
      });
      expect(storedToken?.token).toBe(result.refreshToken);
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
      const user = await saveTestUser(email, password);
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
      expect(
        jwtService.verify<AccessTokenPayload>(result.accessToken).sub,
      ).toBe(user.id);
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

  describe("resetPassword", () => {
    it("success: 비밀번호 변경, 기존 세션 만료", async () => {
      // Given: 올바른 이메일 토큰, 유저 존재, 기존 refresh token 발급됨
      const email = "test@example.com";
      const user = await saveTestUser(email, "OldPassword1@");
      await refreshTokenService.issue(user.id);
      const token = emailTokenService.sign(
        email,
        EmailUsageType.PASSWORD_RESET,
      );

      // When
      await expect(
        authService.resetPassword(token, "NewPassword1@"),
      ).resolves.not.toThrow();

      // Then: 비밀번호가 변경됨, refresh token 삭제됨
      const updated = await userRepository.findOneBy({ email });
      expect(updated!.password).not.toBe(user.password);
      expect(
        await refreshTokenRepository.findOneBy({ user: { id: user.id } }),
      ).toBeNull();
    });

    it("올바르지 않은 토큰 처리", async () => {
      // Given: 올바르지 않은 토큰인 경우
      const result = authService.resetPassword(
        "invalid-token",
        "NewPassword1@",
      );

      // Then: throws handled error
      await expect(result).rejects.toThrow(InvalidPasswordResetTokenError);
    });

    it("올바르지 않은 토큰 타입 처리", async () => {
      // Given: 다른 타입의 토큰인 경우
      const email = "test@example.com";
      const wrongToken = emailTokenService.sign(email, EmailUsageType.SIGN_UP);

      // When
      const result = authService.resetPassword(wrongToken, "NewPassword1@");

      // Then: throws handled error
      await expect(result).rejects.toThrow(InvalidPasswordResetTokenError);
    });

    it("존재하지 않는 유저 처리", async () => {
      // Given: 유효한 토큰이지만 해당 유저가 존재하지 않는 경우
      const email = "deleted@example.com";
      const token = emailTokenService.sign(
        email,
        EmailUsageType.PASSWORD_RESET,
      );

      // When
      const result = authService.resetPassword(token, "NewPassword1@");

      // Then: throws handled error
      await expect(result).rejects.toThrow(InvalidPasswordResetTokenError);
    });
  });
});
