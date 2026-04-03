import { z } from "zod";
import {
  ResourceTypeSchema,
  ResourceCategorySchema,
} from "@mindseed/api-types";
import { ResourceCategory, ResourceType } from "./entities/resource.entity";

type ApiResourceType = z.output<typeof ResourceTypeSchema>;
type ApiResourceCategory = z.output<typeof ResourceCategorySchema>;

export const apiToEntityType: Record<ApiResourceType, ResourceType> = {
  article: ResourceType.ARTICLE,
  video: ResourceType.VIDEO,
  audio: ResourceType.AUDIO,
};

export const entityToApiType: Record<ResourceType, ApiResourceType> = {
  [ResourceType.ARTICLE]: "article",
  [ResourceType.VIDEO]: "video",
  [ResourceType.AUDIO]: "audio",
};

export const apiToEntityCategory: Record<
  ApiResourceCategory,
  ResourceCategory
> = {
  dummy1: ResourceCategory.DUMMY1,
  dummy2: ResourceCategory.DUMMY2,
  dummy3: ResourceCategory.DUMMY3,
};

export const entityToApiCategory: Record<
  ResourceCategory,
  ApiResourceCategory
> = {
  [ResourceCategory.DUMMY1]: "dummy1",
  [ResourceCategory.DUMMY2]: "dummy2",
  [ResourceCategory.DUMMY3]: "dummy3",
};
