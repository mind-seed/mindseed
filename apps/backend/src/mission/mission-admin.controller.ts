import type {
  AdminCreateMissionRequestDto,
  AdminCreateMissionSuccessResponseDto,
  AdminDeleteMissionSuccessResponseDto,
  AdminListMissionsQueryDto,
  AdminListMissionsSuccessResponseDto,
  AdminUpdateMissionRequestDto,
  AdminUpdateMissionSuccessResponseDto,
} from "@mindseed/api-types";
import {
  AdminCreateMissionRequestDtoSchema,
  AdminCreateMissionResponseDtoSchema,
  AdminDeleteMissionResponseDtoSchema,
  AdminListMissionsQueryDtoSchema,
  AdminListMissionsResponseDtoSchema,
  AdminUpdateMissionRequestDtoSchema,
  AdminUpdateMissionResponseDtoSchema,
  idParamSchema,
} from "@mindseed/api-types";
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
} from "@nestjs/common";
import { AdminOnly } from "src/auth/decorators/auth.decorators";
import { ZodEncodeResponse } from "src/common/interceptors/zod-encode-response.decorator";
import {
  ZodBody,
  ZodParam,
  ZodQuery,
} from "src/common/pipes/zod-validation.decorator";
import { MissionManagementService } from "./mission-management.service";
import { TestCategory } from "./entities/mission.entity";
import { MissionCategorySchema } from "@mindseed/api-types";
import { z } from "zod";
import { createBiMap } from "src/common/helpers/mapper";

const categoryMap = createBiMap<
  TestCategory,
  z.output<typeof MissionCategorySchema>
>([
  [TestCategory.ANXIETY, "anxiety"],
  [TestCategory.DEPRESSION, "depression"],
  [TestCategory.STRESS, "stress"],
]);

@Controller("/admin/missions")
export class MissionAdminController {
  constructor(
    private readonly missionManagementService: MissionManagementService,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @AdminOnly()
  @ZodEncodeResponse(AdminListMissionsResponseDtoSchema)
  async listMissions(
    @ZodQuery(AdminListMissionsQueryDtoSchema)
    query: AdminListMissionsQueryDto,
  ): Promise<AdminListMissionsSuccessResponseDto> {
    const { items, hasNext } = await this.missionManagementService.listMissions(
      {
        offset: query.offset,
        limit: query.limit,
        orderBy: query.orderBy,
        orderDirection: query.orderDirection,
      },
    );

    return {
      success: true,
      data: {
        items: items.map((m) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          points: m.points,
          minLevel: m.minLevel,
          category: categoryMap.encode(m.category),
        })),
        hasNext,
      },
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @AdminOnly()
  @ZodEncodeResponse(AdminCreateMissionResponseDtoSchema)
  async createMission(
    @ZodBody(AdminCreateMissionRequestDtoSchema)
    body: AdminCreateMissionRequestDto,
  ): Promise<AdminCreateMissionSuccessResponseDto> {
    const mission = await this.missionManagementService.createMission({
      title: body.title,
      description: body.description,
      points: body.points,
      minLevel: body.minLevel,
      category: categoryMap.decode(body.category),
    });

    return {
      success: true,
      data: {
        id: mission.id,
      },
    };
  }

  @Put(":id")
  @HttpCode(HttpStatus.OK)
  @AdminOnly()
  @ZodEncodeResponse(AdminUpdateMissionResponseDtoSchema)
  async updateMission(
    @ZodParam("id", idParamSchema) id: number,
    @ZodBody(AdminUpdateMissionRequestDtoSchema)
    body: AdminUpdateMissionRequestDto,
  ): Promise<AdminUpdateMissionSuccessResponseDto> {
    await this.missionManagementService.updateMission({
      id,
      title: body.title,
      description: body.description,
      points: body.points,
      minLevel: body.minLevel,
      category: categoryMap.decode(body.category),
    });
    return { success: true, data: null };
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @AdminOnly()
  @ZodEncodeResponse(AdminDeleteMissionResponseDtoSchema)
  async deleteMission(
    @ZodParam("id", idParamSchema) id: number,
  ): Promise<AdminDeleteMissionSuccessResponseDto> {
    await this.missionManagementService.deleteMission(id);
    return { success: true, data: null };
  }
}
