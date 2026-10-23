import { z } from "zod";
import { CounselCategorySchema } from "@mindseed/api-types";
import { CounselCategory } from "./entities/counsel-entry.entity";
import { createBiMap } from "src/common/helpers/mapper";

type ApiCounselCategory = z.output<typeof CounselCategorySchema>;

export const categoryMap = createBiMap<CounselCategory, ApiCounselCategory>([
  [CounselCategory.ANXIETY, "anxiety"],
  [CounselCategory.DEPRESSION, "depression"],
  [CounselCategory.STRESS, "stress"],
  [CounselCategory.OTHER, "other"],
]);
