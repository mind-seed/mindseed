import { Module } from "@nestjs/common";
import { AuthGuard } from "./guards/auth.guard";
import { JwtModule } from "@nestjs/jwt";
import { ConfigType } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { EmailRateLimitService } from "./email-rate-limit/email-rate-limit.service";
import { EmailRateLimitStore } from "./email-rate-limit/email-rate-limit.store";
import { VerificationCodeService } from "./verification-code/verification-code.service";
import { VerificationCodeStore } from "./verification-code/verification-code.store";
import { SignUpTokenService } from "./sign-up-token/sign-up-token.service";
import { AccessTokenService } from "./access-token/access-token.service";
import { RefreshTokenService } from "./refresh-token/refresh-token.service";
import { RefreshToken } from "./refresh-token/refresh-token.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RedisModule } from "src/redis/redis.module";
import { UserModule } from "src/user/user.module";
import { MailModule } from "src/mail/mail.module";
import { jwtConfig } from "src/config";

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]),
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
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailRateLimitService,
    EmailRateLimitStore,
    VerificationCodeService,
    VerificationCodeStore,
    SignUpTokenService,
    AccessTokenService,
    RefreshTokenService,
    AuthGuard,
  ],
  exports: [AuthGuard],
})
export class AuthModule {}
