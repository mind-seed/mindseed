import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Report } from "./entities/report.entity";
import { ReportController } from "./report.controller";
import { ReportService } from "./report.service";
import { AuthModule } from "src/auth/auth.module";
import { UserModule } from "src/user/user.module";
import { PostModule } from "src/post/post.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Report]),
    AuthModule,
    UserModule,
    PostModule,
  ],
  controllers: [ReportController],
  providers: [ReportService],
})
export class ReportModule {}
