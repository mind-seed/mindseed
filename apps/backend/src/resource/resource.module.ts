import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Resource } from "./entities/resource.entity";
import { ResourceQueryService } from "./resource-query.service";
import { ResourceMutationService } from "./resource-mutation.service";
import { ResourceAdminController } from "./resource-admin.controller";
import { AuthModule } from "src/auth/auth.module";
import { UserModule } from "src/user/user.module";
import { ResourceController } from "./resource.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Resource]), AuthModule, UserModule],
  controllers: [ResourceController, ResourceAdminController],
  providers: [ResourceQueryService, ResourceMutationService],
})
export class ResourceModule {}
