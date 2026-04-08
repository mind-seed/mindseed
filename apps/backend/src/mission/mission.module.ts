import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Mission } from "./entities/mission.entity";
import { MissionAssignment } from "./entities/mission-assignment.entity";
import { UserProfile } from "src/user/entities/user-profile.entity";
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

@Module({
  imports: [
    TypeOrmModule.forFeature([Mission, MissionAssignment, UserProfile]),
    AuthModule,
    UserModule,
  ],
  controllers: [MissionAssignmentController],
  providers: [
    { provide: MAX_LEVEL_TOKEN, useValue: MAX_LEVEL },
    { provide: POINTS_FOR_NEXT_LEVEL_TOKEN, useValue: pointsForNextLevel },
    LevelCalculatorService,
    MissionParticipationService,
  ],
})
export class MissionModule {}
