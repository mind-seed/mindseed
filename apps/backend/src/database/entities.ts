import { Attachment } from "src/attachment/entities/attachment.entity";
import { RefreshToken } from "src/auth/refresh-token/refresh-token.entity";
import { PostComment } from "src/comment/entities/post-comment.entity";
import { CounselEntry } from "src/counsel/entities/counsel-entry.entity";
import { DiagnosisEntry } from "src/diagnosis/entities/diagnosis-entry.entity";
import { MissionAssignment } from "src/mission/entities/mission-assignment.entity";
import { Mission } from "src/mission/entities/mission.entity";
import { PostLike } from "src/post/entities/post-like.entity";
import { Post } from "src/post/entities/post.entity";
import { Report } from "src/report/entities/report.entity";
import { Resource } from "src/resource/entities/resource.entity";
import { S3Queue } from "src/s3-storage/entities/s3-queue";
import { UserProfile } from "src/user/entities/user-profile.entity";
import { User } from "src/user/entities/user.entity";

export const entities = [
  Attachment,
  CounselEntry,
  DiagnosisEntry,
  Mission,
  MissionAssignment,
  Post,
  PostComment,
  PostLike,
  RefreshToken,
  Resource,
  S3Queue,
  User,
  UserProfile,
  Report,
];
