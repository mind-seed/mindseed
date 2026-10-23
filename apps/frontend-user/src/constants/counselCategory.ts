import z from "zod";
import { CounselCategorySchema } from "@mindseed/api-types";

type CounselCategory = z.infer<typeof CounselCategorySchema>;

const COUNSEL_CATEGORY_LABELS: Record<CounselCategory, string> = {
  depression: "우울",
  anxiety: "불안",
  stress: "스트레스",
  other: "기타",
};

export const COUNSEL_CATEGORIES: ReadonlyArray<{
  value: CounselCategory;
  label: string;
}> = (Object.keys(COUNSEL_CATEGORY_LABELS) as CounselCategory[]).map(
  (value) => ({ value, label: COUNSEL_CATEGORY_LABELS[value] }),
);

export function getCounselCategoryLabel(category: CounselCategory): string {
  return COUNSEL_CATEGORY_LABELS[category];
}
