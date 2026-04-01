import z from "zod";

export const AuthorNicknameSchema = z.string().min(2).max(10);

export const AuthorDtoSchema = z.object({
  nickname: AuthorNicknameSchema,
});
