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
import { User } from "./user.entity";

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
        role: user.role,
        createdAt: user.createdAt,
        profile: { nickname: user.profile.nickname, age: user.profile.age },
      },
    };
  }
}
