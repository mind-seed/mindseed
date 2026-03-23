import z from "zod";
import { dateTimeCodec } from "./date-time-codec";
import { UserProfileDtoSchema } from "./user-profile-dto";

export const UserDtoSchema = z.object({
  id: z.int(),
  email: z.email(),
  role: z.enum(["USER", "ADMIN"]),
  createdAt: dateTimeCodec,
  profile: UserProfileDtoSchema,
});

export type UserDto = z.output<typeof UserDtoSchema>;
