import z from "zod";
import { ResourceCategorySchema } from "@mindseed/api-types";

type ResourceCategory = z.infer<typeof ResourceCategorySchema>;

export const RESOURCE_CATEGORY_LABELS: Record<ResourceCategory, string> = {
  depression: "우울",
  anxiety: "불안",
  stress: "스트레스",
  other: "기타",
};

export const RESOURCE_CATEGORIES: ReadonlyArray<{
  value: ResourceCategory;
  label: string;
}> = (Object.keys(RESOURCE_CATEGORY_LABELS) as ResourceCategory[]).map(
  (value) => ({ value, label: RESOURCE_CATEGORY_LABELS[value] }),
);

export function getResourceCategoryLabel(category: ResourceCategory): string {
  return RESOURCE_CATEGORY_LABELS[category];
}
