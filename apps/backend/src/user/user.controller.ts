import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import {
  GetCurrentUserResponseDtoSchema,
  type GetCurrentUserSuccessResponseDto,
} from "@mindseed/api-types";
import {
  Authenticated,
  CurrentUser,
} from "src/auth/decorators/auth.decorators";
import { ZodEncodeResponse } from "src/common/interceptors/zod-encode-response.decorator";
import { User, UserRole } from "./entities/user.entity";
import { UserRoleSchema } from "@mindseed/api-types";
import { z } from "zod";
import { createBiMap } from "src/common/helpers/mapper";

const roleMap = createBiMap<UserRole, z.output<typeof UserRoleSchema>>([
  [UserRole.USER, "user"],
  [UserRole.ADMIN, "admin"],
]);

@Controller("/users")
export class UserController {
  @Get("/current")
  @HttpCode(HttpStatus.OK)
  @Authenticated()
  @ZodEncodeResponse(GetCurrentUserResponseDtoSchema)
  getCurrent(@CurrentUser() user: User): GetCurrentUserSuccessResponseDto {
    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        role: roleMap.encode(user.role),
        createdAt: user.createdAt,
        profile: user.profile && {
          nickname: user.profile.nickname,
          age: user.profile.age,
          points: user.profile.points,
          level: user.profile.level,
          characterIndex: user.profile.characterIndex,
        },
      },
    };
  }
}
