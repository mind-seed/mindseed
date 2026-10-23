import z from "zod";

export const VerificationCodeSchema = z.string().regex(/^[0-9]{6}$/);
