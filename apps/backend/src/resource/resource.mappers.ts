import { z } from "zod";
import {
  ResourceTypeSchema,
  ResourceCategorySchema,
} from "@mindseed/api-types";
import { ResourceCategory, ResourceType } from "./entities/resource.entity";
import { createBiMap } from "src/common/helpers/mapper";

type ApiResourceType = z.output<typeof ResourceTypeSchema>;
type ApiResourceCategory = z.output<typeof ResourceCategorySchema>;

export const typeMap = createBiMap<ResourceType, ApiResourceType>([
  [ResourceType.ARTICLE, "article"],
  [ResourceType.VIDEO, "video"],
  [ResourceType.AUDIO, "audio"],
]);

export const categoryMap = createBiMap<ResourceCategory, ApiResourceCategory>([
  [ResourceCategory.DEPRESSION, "depression"],
  [ResourceCategory.ANXIETY, "anxiety"],
  [ResourceCategory.STRESS, "stress"],
  [ResourceCategory.OTHER, "other"],
]);
