import z from "zod";

export const MissionAssignmentStatusSchema = z.enum([
  "uncompleted",
  "completed",
]);

export const SimplifiedMissionSchema = z.object({
  title: z.string(),
  description: z.string(),
  points: z.int(),
});

export const MissionAssignmentDtoSchema = z.object({
  id: z.int(),
  status: MissionAssignmentStatusSchema,
  mission: SimplifiedMissionSchema,
});
