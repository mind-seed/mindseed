import { z } from "zod";
import { UserRoleSchema } from "@mindseed/api-types";
import { UserRole } from "./entities/user.entity";

export const entityToApiRole: Record<
  UserRole,
  z.output<typeof UserRoleSchema>
> = {
  [UserRole.USER]: "user",
  [UserRole.ADMIN]: "admin",
};
