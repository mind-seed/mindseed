import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "src/auth/auth.module";
import { DiagnosisEntry } from "./entities/diagnosis-entry.entity";
import { DiagnosisService } from "./diagnosis.service";
import { DiagnosisController } from "./diagnosis.controller";
import { UserModule } from "src/user/user.module";

@Module({
  imports: [TypeOrmModule.forFeature([DiagnosisEntry]), AuthModule, UserModule],
  controllers: [DiagnosisController],
  providers: [DiagnosisService],
})
export class DiagnosisModule {}
