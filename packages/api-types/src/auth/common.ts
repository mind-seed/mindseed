import * as z from "zod";

export const VerificationCodeSchema = z.string().regex(/^[0-9]{6}$/);

// 알파벳 소문자, 알파벳 대문자, 숫자, 특수문자로만 이루어짐 및 각 1자 이상
export const PasswordSchema = z
  .string()
  .min(8)
  .max(20)
  .regex(/[a-z]/)
  .regex(/[A-Z]/)
  .regex(/[0-9]/)
  .regex(/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/)
  .regex(/^[a-zA-Z0-9!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]+$/);

export const NicknameSchema = z
  .string()
  .min(2)
  .max(8)
  .regex(/^[가-힣A-z0-9\s]+$/);

export const AgeSchema = z.int().min(0);
