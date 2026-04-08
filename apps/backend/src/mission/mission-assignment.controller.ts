import {
  CompleteMissionAssignmentResponseDtoSchema,
  CompleteMissionAssignmentSuccessResponseDto,
  idParamSchema,
  ListTodayMissionAssignmentsResponseDtoSchema,
  ListTodayMissionAssignmentsSuccessResponseDto,
  MissionAssignmentStatusSchema,
} from "@mindseed/api-types";
import { Controller, Get, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { CurrentUser, UserOnly } from "src/auth/decorators/auth.decorators";
import { ZodEncodeResponse } from "src/common/interceptors/zod-encode-response.decorator";
import { User } from "src/user/entities/user.entity";
import { MissionParticipationService } from "./mission-participation.service";
import { ZodParam } from "src/common/pipes/zod-validation.decorator";
import { MissionAssignmentStatus } from "./entities/mission-assignment.entity";
import z from "zod";

const entityToApiStatus: Record<
  MissionAssignmentStatus,
  z.output<typeof MissionAssignmentStatusSchema>
> = {
  [MissionAssignmentStatus.COMPLETED]: "completed",
  [MissionAssignmentStatus.UNCOMPLETED]: "uncompleted",
};

@Controller("/mission-assignments")
export class MissionAssignmentController {
  constructor(
    private readonly missionParticipationService: MissionParticipationService,
  ) {}

  @Get("today")
  @HttpCode(HttpStatus.OK)
  @UserOnly()
  @ZodEncodeResponse(ListTodayMissionAssignmentsResponseDtoSchema)
  async listToday(
    @CurrentUser() user: User,
  ): Promise<ListTodayMissionAssignmentsSuccessResponseDto> {
    const currentDate = new Date();
    const assignments =
      await this.missionParticipationService.listMissionAssignmentsForDate(
        user.id,
        currentDate,
      );

    return {
      success: true,
      data: {
        assignments: assignments.map((assignment) => ({
          id: assignment.id,
          mission: {
            title: assignment.mission.title,
            description: assignment.mission.description,
            points: assignment.mission.points,
          },
          status: entityToApiStatus[assignment.status],
        })),
      },
    };
  }

  @Post(":id/complete")
  @HttpCode(HttpStatus.OK)
  @UserOnly()
  @ZodEncodeResponse(CompleteMissionAssignmentResponseDtoSchema)
  async complete(
    @CurrentUser() user: User,
    @ZodParam("id", idParamSchema) id: number,
  ): Promise<CompleteMissionAssignmentSuccessResponseDto> {
    const currentDate = new Date();

    const { level, points } =
      await this.missionParticipationService.completeMissionAssignment(
        user.id,
        id,
        currentDate,
      );

    return {
      success: true,
      data: {
        level,
        points,
      },
    };
  }
}
