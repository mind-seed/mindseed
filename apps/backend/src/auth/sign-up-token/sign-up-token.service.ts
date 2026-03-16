import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

interface SignUpTokenPayload {
  email: string;
}

/**
 * sign up token JWT 발급/검증을 위한 wrapper class
 */
@Injectable()
export class SignUpTokenService {
  constructor(private readonly jwtService: JwtService) {}

  sign(email: string): string {
    const payload: SignUpTokenPayload = { email };
    return this.jwtService.sign(payload);
  }

  decode(token: string): SignUpTokenPayload {
    return this.jwtService.decode<SignUpTokenPayload>(token);
  }

  verify(token: string): SignUpTokenPayload {
    return this.jwtService.verify<SignUpTokenPayload>(token);
  }
}
