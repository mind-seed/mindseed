import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CounselEntry } from "./entities/counsel-entry.entity";
import { CounselQueryService } from "./counsel-query.service";

@Module({
  imports: [TypeOrmModule.forFeature([CounselEntry])],
  providers: [CounselQueryService],
})
export class CounselModule {}
