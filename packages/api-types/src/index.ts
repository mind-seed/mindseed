import * as z from "zod";

export const TestRequestDtoSchema = z.object({
  name: z.string().min(3).max(10),
});

export type TestRequestDto = z.infer<typeof TestRequestDtoSchema>;

export type TestResponseDto = {
  greeting: string;
};
