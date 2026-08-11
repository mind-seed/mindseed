import type { z } from "zod";
import {
  ActiveCommentDtoSchema,
  AttachmentDtoSchema,
  AuthorDeletedCommentDtoSchema,
  AuthorNicknameSchema,
  CompleteSignupRequestDtoSchema,
  CreateDiagnosisRequestDtoSchema,
  DeletedCommentDtoSchema,
  EmailPasswordResetRequestDtoSchema,
  LoginRequestDtoSchema,
  MissionAssignmentDtoSchema,
  PostCategorySchema,
  PostContentSchema,
  PostDtoSchema,
  PostWithCommentsSchema,
  ResetPasswordRequestDtoSchema,
  ResourceDtoSchema,
  SendMailRequestDtoSchema,
  SimplifiedMissionSchema,
  UpdateCurrentUserRequestDtoSchema,
  UserDtoSchema,
  UserProfileDtoSchema,
  VerifyMailRequestDtoSchema,
} from "@mindseed/api-types";

export { AuthorNicknameSchema };
export {
  ActiveCommentDtoSchema,
  AuthorDeletedCommentDtoSchema,
  DeletedCommentDtoSchema,
};
export {
  AttachmentDtoSchema,
  PostCategorySchema,
  PostContentSchema,
  PostDtoSchema,
  PostWithCommentsSchema,
};
export { ResourceDtoSchema };
export {
  CompleteSignupRequestDtoSchema,
  EmailPasswordResetRequestDtoSchema,
  LoginRequestDtoSchema,
  ResetPasswordRequestDtoSchema,
  SendMailRequestDtoSchema,
  VerifyMailRequestDtoSchema,
};
export { UpdateCurrentUserRequestDtoSchema };
export { PasswordSchema } from "@mindseed/api-types";

export type PictureDto = z.infer<typeof AttachmentDtoSchema>;
export type CommunityPostFixture = z.input<typeof PostWithCommentsSchema>;
export type CommunityPost = z.infer<typeof PostWithCommentsSchema>;
type ActiveCommentDto = z.infer<typeof ActiveCommentDtoSchema>;
type DeletedCommentDto = z.infer<typeof DeletedCommentDtoSchema>;
type AuthorDeletedCommentDto = z.infer<typeof AuthorDeletedCommentDtoSchema>;
export type CommentDto =
  | ActiveCommentDto
  | DeletedCommentDto
  | AuthorDeletedCommentDto;
export type PostDto = z.infer<typeof PostDtoSchema>;
export type PostCategory = z.output<typeof PostCategorySchema>;
export type PostContent = z.output<typeof PostContentSchema>;
export type ResourceDto = z.infer<typeof ResourceDtoSchema>;
export type MissionAssignmentDto = z.infer<typeof MissionAssignmentDtoSchema>;
export type SimplifiedMission = z.infer<typeof SimplifiedMissionSchema>;
export type UserDto = z.infer<typeof UserDtoSchema>;
export type UserProfileDto = z.infer<typeof UserProfileDtoSchema>;
export type CreateDiagnosisRequestDto = z.infer<
  typeof CreateDiagnosisRequestDtoSchema
>;
