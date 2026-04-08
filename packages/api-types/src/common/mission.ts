import z from "zod";

export const MissionAssignmentStateSchema = z.enum([
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
  state: MissionAssignmentStateSchema,
  mission: SimplifiedMissionSchema,
});
