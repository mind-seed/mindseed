import z from "zod";
import { dateSerializerCodec } from "./codecs";
import { UserProfileDtoSchema } from "./user-profile-dto";

export const UserDtoSchema = z.object({
  id: z.int(),
  email: z.email(),
  role: z.enum(["USER", "ADMIN"]),
  createdAt: dateSerializerCodec,
  profile: z.nullable(UserProfileDtoSchema),
});

export type UserDto = z.output<typeof UserDtoSchema>;
