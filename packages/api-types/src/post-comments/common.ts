import z from "zod";

export const CommentContentSchema = z.string().min(1).max(200);

export const CommentNotFoundErrorCode = "COMMENT_NOT_FOUND";
export const NotCommentAuthorErrorCode = "NOT_COMMENT_AUTHOR";
