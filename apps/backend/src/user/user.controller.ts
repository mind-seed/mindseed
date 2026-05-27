import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
} from "@nestjs/common";
import {
  DeleteCurrentUserResponseDtoSchema,
  GetCurrentUserResponseDtoSchema,
  UpdateCurrentUserRequestDtoSchema,
  UpdateCurrentUserResponseDtoSchema,
  type DeleteCurrentUserSuccessResponseDto,
  type UpdateCurrentUserRequestDto,
  type GetCurrentUserSuccessResponseDto,
  type UpdateCurrentUserSuccessResponseDto,
} from "@mindseed/api-types";
import {
  Authenticated,
  CurrentUser,
  UserOnly,
} from "src/auth/decorators/auth.decorators";
import { ZodEncodeResponse } from "src/common/interceptors/zod-encode-response.decorator";
import { User, UserRole } from "./entities/user.entity";
import { UserRoleSchema } from "@mindseed/api-types";
import { z } from "zod";
import { createBiMap } from "src/common/helpers/mapper";
import { UserService } from "./user.service";
import { ZodBody } from "src/common/pipes/zod-validation.decorator";

const roleMap = createBiMap<UserRole, z.output<typeof UserRoleSchema>>([
  [UserRole.USER, "user"],
  [UserRole.ADMIN, "admin"],
]);

@Controller("/users")
export class UserController {
  constructor(private readonly userService: UserService) {}

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

  @Patch("/current/profile")
  @HttpCode(HttpStatus.OK)
  @UserOnly()
  @ZodEncodeResponse(UpdateCurrentUserResponseDtoSchema)
  async updateCurrent(
    @CurrentUser() user: User,
    @ZodBody(UpdateCurrentUserRequestDtoSchema)
    body: UpdateCurrentUserRequestDto,
  ): Promise<UpdateCurrentUserSuccessResponseDto> {
    await this.userService.updateProfile(user.id, {
      nickname: body.nickname,
      characterIndex: body.characterIndex,
    });

    return {
      success: true,
      data: null,
    };
  }

  @Delete("/current")
  @HttpCode(HttpStatus.OK)
  @UserOnly()
  @ZodEncodeResponse(DeleteCurrentUserResponseDtoSchema)
  async deleteCurrent(
    @CurrentUser() user: User,
  ): Promise<DeleteCurrentUserSuccessResponseDto> {
    await this.userService.softDelete(user.id);

    return {
      success: true,
      data: null,
    };
  }
}
