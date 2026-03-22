import {
  applyDecorators,
  createParamDecorator,
  ExecutionContext,
  SetMetadata,
  UseGuards,
} from "@nestjs/common";
import { Request } from "express";
import { User, UserRole } from "src/user/user.entity";
import { RoleGuard, ROLE_KEY } from "../guards/role.guard";
import {
  AuthGuard,
  AuthGuardMode,
  UseAuthGuardMode,
} from "../guards/auth.guard";

export const Authenticated = () =>
  applyDecorators(
    UseAuthGuardMode(AuthGuardMode.AUTHENTICATED),
    UseGuards(AuthGuard),
  );

export const UnAuthenticated = () =>
  applyDecorators(
    UseAuthGuardMode(AuthGuardMode.UNAUTHENTICATED),
    UseGuards(AuthGuard),
  );

export const Role = (role: UserRole) =>
  applyDecorators(
    SetMetadata(ROLE_KEY, role),
    UseAuthGuardMode(AuthGuardMode.AUTHENTICATED),
    UseGuards(AuthGuard, RoleGuard),
  );

export const AdminOnly = () => Role(UserRole.ADMIN);

export const UserOnly = () => Role(UserRole.USER);

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    const req = ctx.switchToHttp().getRequest<Request>();
    if (!req.user) {
      throw new Error("CurrentUser decorator requires @Authenticated()");
    }
    return req.user;
  },
);
