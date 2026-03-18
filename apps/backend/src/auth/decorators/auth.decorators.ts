import { applyDecorators, SetMetadata, UseGuards } from "@nestjs/common";
import { UserRole } from "src/user/user.entity";
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
    UseGuards(Authenticated, RoleGuard),
  );

export const AdminOnly = () => Role(UserRole.ADMIN);

export const UserOnly = () => Role(UserRole.USER);
