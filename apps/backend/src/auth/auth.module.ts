import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigType } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { EmailRateLimitService } from "./email-rate-limit/email-rate-limit.service";
import { EmailRateLimitStore } from "./email-rate-limit/email-rate-limit.store";
import { VerificationCodeService } from "./verification-code/verification-code.service";
import { VerificationCodeStore } from "./verification-code/verification-code.store";
import { SignUpTokenService } from "./sign-up-token/sign-up-token.service";
import { AccessTokenService } from "./access-token/access-token.service";
import { RefreshTokenService } from "./refresh-token/refresh-token.service";
import { RefreshTokenStore } from "./refresh-token/refresh-token.store";
import { RedisModule } from "src/redis/redis.module";
import { UserModule } from "src/user/user.module";
import { MailModule } from "src/mail/mail.module";
import { jwtConfig } from "src/config";

@Module({
  imports: [
    RedisModule,
    UserModule,
    MailModule,
    JwtModule.registerAsync({
      inject: [jwtConfig.KEY],
      useFactory: (config: ConfigType<typeof jwtConfig>) => ({
        secret: config.secret,
      }),
    }),
  ],
  providers: [
    AuthService,
    EmailRateLimitService,
    EmailRateLimitStore,
    VerificationCodeService,
    VerificationCodeStore,
    SignUpTokenService,
    AccessTokenService,
    RefreshTokenService,
    RefreshTokenStore,
  ],
})
export class AuthModule {}
