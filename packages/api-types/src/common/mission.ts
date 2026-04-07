import z from "zod";

export const MissionStateSchema = z.enum(["uncompleted", "completed"]);

export const MissionDtoSchema = z.object({
  id: z.int(),
  title: z.string(),
  description: z.string(),
  points: z.int(),
  state: MissionStateSchema,
});
