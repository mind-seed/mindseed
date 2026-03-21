import z from "zod";

export const UserProfileDtoSchema = z.object({
  nickname: z.string(),
  age: z.int(),
});

export type UserProfileDto = z.output<typeof UserProfileDtoSchema>;
