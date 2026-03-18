import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import { AuthService } from "../auth.service";
import { Reflector } from "@nestjs/core";

export enum AuthGuardMode {
  AUTHENTICATED,
  UNAUTHENTICATED,
}

export const AUTH_GUARD_MODE_KEY = "authGuardMode";
export const UseAuthGuardMode = (mode: AuthGuardMode) =>
  SetMetadata<string, AuthGuardMode>(AUTH_GUARD_MODE_KEY, mode);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const mode = this.reflector.getAllAndOverride<AuthGuardMode>(
      AUTH_GUARD_MODE_KEY,
      [context.getHandler(), context.getClass()],
    );

    const req = context.switchToHttp().getRequest<Request>();
    const token = req.headers.authorization?.split(" ")[1];

    if (token) {
      req.user = await this.authService.getUserFromAccessToken(token);
    }

    const userExists = !!req.user;
    const expectedUserExistence = mode === AuthGuardMode.AUTHENTICATED;

    if (userExists !== expectedUserExistence) {
      throw new UnauthorizedException();
    }

    return true;
  }
}
