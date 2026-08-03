import type { z } from "zod";
import { LoginRequestDtoSchema } from "../../../../packages/api-types/src/auth/login";
import { ResetPasswordRequestDtoSchema } from "../../../../packages/api-types/src/auth/reset-password";
import { SendMailRequestDtoSchema } from "../../../../packages/api-types/src/auth/send-sign-up-mail";
import { EmailPasswordResetRequestDtoSchema } from "../../../../packages/api-types/src/auth/send-password-reset-mail";
import { CompleteSignupRequestDtoSchema } from "../../../../packages/api-types/src/auth/sign-up";
import { VerifyMailRequestDtoSchema } from "../../../../packages/api-types/src/auth/get-email-token";
import { AuthorNicknameSchema } from "../../../../packages/api-types/src/common/author";
import {
  ActiveCommentDtoSchema,
  AuthorDeletedCommentDtoSchema,
  DeletedCommentDtoSchema,
} from "../../../../packages/api-types/src/common/comment";
import {
  AttachmentDtoSchema,
  PostCategorySchema,
  PostContentSchema,
  PostDtoSchema,
  PostWithCommentsSchema,
} from "../../../../packages/api-types/src/common/post";
import { ResourceDtoSchema } from "../../../../packages/api-types/src/common/resource";
import {
  MissionAssignmentDtoSchema,
  SimplifiedMissionSchema,
} from "../../../../packages/api-types/src/common/mission";
import {
  UserDtoSchema,
  UserProfileDtoSchema,
} from "../../../../packages/api-types/src/common/user";
import { CreateDiagnosisRequestDtoSchema } from "../../../../packages/api-types/src/diagnoses/create-diagnosis";
import { UpdateCurrentUserRequestDtoSchema } from "../../../../packages/api-types/src/users/update-current-profile";

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
export { PasswordSchema } from "../../../../packages/api-types/src/common/user";

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
