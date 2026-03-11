import { registerAs } from "@nestjs/config";

export const databaseConfig = registerAs("database", () => ({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT ?? "5432"),
  username: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
}));
