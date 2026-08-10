import z from "zod";
import { dateSerializerCodec } from "./codecs";

export const ResourceTitleSchema = z.string().min(1);

export const ResourceTypeSchema = z.enum(["article", "video", "audio"]);

export const ResourceCategorySchema = z.enum([
  "depression",
  "anxiety",
  "stress",
  "other",
]);

export const ResourceDtoSchema = z.object({
  id: z.int(),
  title: ResourceTitleSchema,
  type: ResourceTypeSchema,
  category: ResourceCategorySchema,
  url: z.url(),
  createdAt: dateSerializerCodec,
  updatedAt: dateSerializerCodec,
});
