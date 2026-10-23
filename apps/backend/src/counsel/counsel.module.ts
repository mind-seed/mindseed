import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CounselEntry } from "./entities/counsel-entry.entity";
import { CounselQueryService } from "./counsel-query.service";
import { CounselMutationService } from "./counsel-mutation.service";
import { CounselController } from "./counsel.controller";
import { CounselAdminController } from "./counsel-admin.controller";
import { AuthModule } from "src/auth/auth.module";
import { UserModule } from "src/user/user.module";

@Module({
  imports: [TypeOrmModule.forFeature([CounselEntry]), AuthModule, UserModule],
  controllers: [CounselController, CounselAdminController],
  providers: [CounselQueryService, CounselMutationService],
})
export class CounselModule {}
