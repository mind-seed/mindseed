import { registerAs } from "@nestjs/config";

export const databaseConfig = registerAs("database", () => ({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT ?? "5432"),
  username: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
}));

export const redisConfig = registerAs("redis", () => ({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT ?? "6379"),
  password: process.env.REDIS_PASSWORD,
}));

export const jwtConfig = registerAs("jwt", () => ({
  secret: process.env.JWT_SECRET,
}));

export const s3Config = registerAs("s3", () => ({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  endpoint: process.env.AWS_S3_ENDPOINT,
  bucket: process.env.AWS_S3_BUCKET,
}));

export const mailConfig = registerAs("mail", () => ({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT ?? "587"),
  user: process.env.MAIL_USER,
  password: process.env.MAIL_PASSWORD,
  from: process.env.MAIL_FROM,
  driver: process.env.MAIL_DRIVER,
}));
