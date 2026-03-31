import z from "zod";

export const CommentContentSchema = z.string().min(1).max(200);
