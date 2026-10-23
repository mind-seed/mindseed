import { Module } from "@nestjs/common";
import { ConfigType } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from "node:path";
import { databaseConfig } from "src/config";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { entities } from "./entities";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [databaseConfig.KEY],
      useFactory: (db: ConfigType<typeof databaseConfig>) => ({
        type: "postgres",
        host: db.host,
        port: db.port,
        username: db.username,
        password: db.password,
        database: db.database,
        entities,
        migrations: [join(__dirname, "migrations", "*.{ts,js}")],
        migrationsRun: true,
        synchronize: process.env.NODE_ENV !== "production",
        namingStrategy: new SnakeNamingStrategy(),
      }),
    }),
  ],
})
export class DatabaseModule {}
