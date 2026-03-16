import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

interface AccessTokenPayload {
  sub: number;
}

/**
 * access token JWT 발급/검증을 위한 wrapper class
 */
@Injectable()
export class AccessTokenService {
  constructor(private readonly jwtService: JwtService) {}

  sign(userId: number): string {
    const payload: AccessTokenPayload = { sub: userId };
    return this.jwtService.sign(payload);
  }

  verify(token: string): AccessTokenPayload {
    return this.jwtService.verify<AccessTokenPayload>(token);
  }
}
