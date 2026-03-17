import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

export type AccessTokenPayload = {
  sub: number;
}

/**
 * user id에 대한 access token 발급 및 검증
 */
@Injectable()
export class AccessTokenService {
  constructor(private readonly jwtService: JwtService) {}

  sign(userId: number): string {
    const payload: AccessTokenPayload = { sub: userId };
    return this.jwtService.sign(payload);
  }

  extractUserId(token: string): number | null {
    try {
      const payload = this.jwtService.verify<AccessTokenPayload>(token);
      return payload.sub;
    } catch {
      // assumption: 여기서 caught된 error는 jwt verification failure에 의한 것
      return null;
    }
  }
}
