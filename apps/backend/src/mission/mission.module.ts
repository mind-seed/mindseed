import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Mission } from "./entities/mission.entity";
import { MissionAssignment } from "./entities/mission-assignment.entity";
import { UserProfile } from "src/user/entities/user-profile.entity";
import { DiagnosisEntry } from "src/diagnosis/entities/diagnosis-entry.entity";
import { MissionParticipationService } from "./mission-participation.service";
import { AuthModule } from "src/auth/auth.module";
import { UserModule } from "src/user/user.module";
import {
  MAX_LEVEL,
  pointsForNextLevel,
} from "./level-points/level-points.constants";
import {
  LevelCalculatorService,
  MAX_LEVEL_TOKEN,
  POINTS_FOR_NEXT_LEVEL_TOKEN,
} from "./level-points/level-points-calculator.service";
import { MissionAssignmentController } from "./mission-assignment.controller";
import { MissionAdminController } from "./mission-admin.controller";
import { MissionManagementService } from "./mission-management.service";
import { MissionGenerationService } from "./mission-generation/mission-generation.service";
import { MISSION_PICKER_TOKEN } from "./mission-generation/mission-picker/mission-picker.common";
import { cooldownFilterMissionPicker } from "./mission-generation/mission-picker/cooldown-filter-mission-picker";
import { MissionGenerationJob } from "./mission-generation/mission-generation.job";
import { MissionGenerationCron } from "./mission-generation/mission-generation.cron";
import { User } from "src/user/entities/user.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DiagnosisEntry,
      Mission,
      MissionAssignment,
      UserProfile,
      User,
    ]),
    AuthModule,
    UserModule,
  ],
  controllers: [MissionAssignmentController, MissionAdminController],
  providers: [
    { provide: MAX_LEVEL_TOKEN, useValue: MAX_LEVEL },
    { provide: POINTS_FOR_NEXT_LEVEL_TOKEN, useValue: pointsForNextLevel },
    { provide: MISSION_PICKER_TOKEN, useValue: cooldownFilterMissionPicker },
    LevelCalculatorService,
    MissionParticipationService,
    MissionManagementService,
    MissionGenerationService,
    MissionGenerationJob,
    MissionGenerationCron,
  ],
})
export class MissionModule {}
