import z from "zod";

export const MissionTitleSchema = z.string().min(1).max(30);
export const MissionDescriptionSchema = z.string().min(1).max(100);
export const MissionPointsSchema = z.int().min(1);
export const MissionMinLevelSchema = z.int().min(1).max(30);

export const MissionCategorySchema = z.enum([
  "anxiety",
  "depression",
  "stress",
]);

export const MissionDtoSchema = z.object({
  id: z.int(),
  title: MissionTitleSchema,
  description: MissionDescriptionSchema,
  points: MissionPointsSchema,
  minLevel: MissionMinLevelSchema,
  category: MissionCategorySchema,
});

export const MissionAssignmentStatusSchema = z.enum([
  "uncompleted",
  "completed",
]);

export const SimplifiedMissionSchema = z.object({
  title: MissionTitleSchema,
  description: MissionDescriptionSchema,
  points: MissionPointsSchema,
});

export const MissionAssignmentDtoSchema = z.object({
  id: z.int(),
  status: MissionAssignmentStatusSchema,
  mission: SimplifiedMissionSchema,
});
