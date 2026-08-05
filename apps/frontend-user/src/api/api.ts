import {
  BeginAttachmentUploadResponseDtoSchema,
  CompleteSignupResponseDtoSchema,
  ConfirmAttachmentUploadResponseDtoSchema,
  CreateCommentResponseDtoSchema,
  CreateCommentReportResponseDtoSchema,
  CreatePostResponseDtoSchema,
  CreatePostReportResponseDtoSchema,
  DeleteCommentResponseDtoSchema,
  DeletePostResponseDtoSchema,
  EmailPasswordResetResponseDtoSchema,
  GetPostResponseDtoSchema,
  ListPostsResponseDtoSchema,
  LoginResponseDtoSchema,
  LogoutResponseDtoSchema,
  RefreshTokensResponseDtoSchema,
  ResetPasswordResponseDtoSchema,
  SendMailResponseDtoSchema,
  SetPostLikeResponseDtoSchema,
  UpdateCommentResponseDtoSchema,
  UpdatePostResponseDtoSchema,
  VerifyMailResponseDtoSchema,
} from "@mindseed/api-types";
import type {
  CompleteSignupRequestDto,
  ConfirmAttachmentUploadRequestDto,
  CreateCommentRequestDto,
  CreateCommentReportRequestDto,
  CreatePostRequestDto,
  CreatePostReportRequestDto,
  EmailPasswordResetRequestDto,
  ListPostsQueryDto,
  LoginRequestDto,
  ResetPasswordRequestDto,
  SendMailRequestDto,
  SetPostLikeRequestDto,
  UpdateCommentRequestDto,
  UpdatePostRequestDto,
  VerifyMailRequestDto,
} from "@mindseed/api-types";
import type { ZodType } from "zod";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!BASE_URL) throw new Error("VITE_API_BASE_URL is not set");

export class ApiError extends Error {
  readonly statusCode: number;
  readonly errorCode: string | undefined;

  constructor(code: string | undefined, statusCode: number) {
    super(code ?? `HTTP ${statusCode}`);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.errorCode = code;
  }
}

type Options = { signal?: AbortSignal };

async function post<TData>(
  path: string,
  body: unknown,
  schema: ZodType<
    | { success: true; data: TData }
    | { success: false; statusCode: number; errorCode?: string }
  >,
  options?: Options & { token?: string },
): Promise<TData> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (options?.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: options?.signal,
  });

  const json: unknown = await response.json();
  const parsed = schema.parse(json);

  if (!parsed.success) {
    throw new ApiError(parsed.errorCode, parsed.statusCode);
  }

  return parsed.data;
}

async function get<TData>(
  path: string,
  schema: ZodType<
    | { success: true; data: TData }
    | { success: false; statusCode: number; errorCode?: string }
  >,
  options?: Options & { token?: string },
): Promise<TData> {
  const headers: Record<string, string> = {};
  if (options?.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
    headers,
    signal: options?.signal,
  });

  const json: unknown = await response.json();
  const parsed = schema.parse(json);

  if (!parsed.success) {
    throw new ApiError(parsed.errorCode, parsed.statusCode);
  }

  return parsed.data;
}

async function put<TData>(
  path: string,
  body: unknown,
  schema: ZodType<
    | { success: true; data: TData }
    | { success: false; statusCode: number; errorCode?: string }
  >,
  options?: Options & { token?: string },
): Promise<TData> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (options?.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
    signal: options?.signal,
  });

  const json: unknown = await response.json();
  const parsed = schema.parse(json);

  if (!parsed.success) {
    throw new ApiError(parsed.errorCode, parsed.statusCode);
  }

  return parsed.data;
}

async function patch<TData>(
  path: string,
  body: unknown,
  schema: ZodType<
    | { success: true; data: TData }
    | { success: false; statusCode: number; errorCode?: string }
  >,
  options?: Options & { token?: string },
): Promise<TData> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (options?.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(body),
    signal: options?.signal,
  });

  const json: unknown = await response.json();
  const parsed = schema.parse(json);

  if (!parsed.success) {
    throw new ApiError(parsed.errorCode, parsed.statusCode);
  }

  return parsed.data;
}

async function del<TData>(
  path: string,
  schema: ZodType<
    | { success: true; data: TData }
    | { success: false; statusCode: number; errorCode?: string }
  >,
  options?: Options & { token?: string },
): Promise<TData> {
  const headers: Record<string, string> = {};
  if (options?.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method: "DELETE",
    headers,
    signal: options?.signal,
  });

  const json: unknown = await response.json();
  const parsed = schema.parse(json);

  if (!parsed.success) {
    throw new ApiError(parsed.errorCode, parsed.statusCode);
  }

  return parsed.data;
}

export async function sendSignUpMail(
  input: SendMailRequestDto,
  options?: Options,
): Promise<void> {
  await post("/auth/email/sign-up", input, SendMailResponseDtoSchema, options);
}

export async function sendPasswordResetMail(
  input: EmailPasswordResetRequestDto,
  options?: Options,
): Promise<void> {
  await post(
    "/auth/email/password-reset",
    input,
    EmailPasswordResetResponseDtoSchema,
    options,
  );
}

export async function getEmailToken(
  input: VerifyMailRequestDto,
  options?: Options,
) {
  return post("/auth/email/token", input, VerifyMailResponseDtoSchema, options);
}

export async function signUp(
  token: string,
  input: CompleteSignupRequestDto,
  options?: Options,
) {
  return post("/auth/sign-up", input, CompleteSignupResponseDtoSchema, {
    ...options,
    token,
  });
}

export async function resetPassword(
  token: string,
  input: ResetPasswordRequestDto,
  options?: Options,
): Promise<void> {
  await post("/auth/reset-password", input, ResetPasswordResponseDtoSchema, {
    ...options,
    token,
  });
}

export async function login(input: LoginRequestDto, options?: Options) {
  return post("/auth/login", input, LoginResponseDtoSchema, options);
}

export async function refreshTokens(token: string, options?: Options) {
  return post(
    "/auth/refresh-tokens",
    undefined,
    RefreshTokensResponseDtoSchema,
    { ...options, token },
  );
}

export async function logout(token: string, options?: Options): Promise<void> {
  await post("/auth/logout", undefined, LogoutResponseDtoSchema, {
    ...options,
    token,
  });
}

export async function getPosts(
  token: string,
  query: ListPostsQueryDto,
  options?: Options,
) {
  const params = new URLSearchParams();
  if (query.cursor) params.set("cursor", query.cursor);
  params.set("limit", String(query.limit));
  params.set("orderBy", query.orderBy);
  params.set("orderDirection", query.orderDirection);
  if (query.category) params.set("category", query.category);
  return get(`/posts?${params}`, ListPostsResponseDtoSchema, {
    ...options,
    token,
  });
}

export async function getPost(
  token: string,
  postId: number,
  options?: Options,
) {
  return get(`/posts/${postId}`, GetPostResponseDtoSchema, {
    ...options,
    token,
  });
}

export async function createPost(
  token: string,
  input: CreatePostRequestDto,
  options?: Options,
) {
  return post("/posts", input, CreatePostResponseDtoSchema, {
    ...options,
    token,
  });
}

export async function updatePost(
  token: string,
  postId: number,
  input: UpdatePostRequestDto,
  options?: Options,
): Promise<void> {
  await put(`/posts/${postId}`, input, UpdatePostResponseDtoSchema, {
    ...options,
    token,
  });
}

export async function setPostLike(
  token: string,
  postId: number,
  input: SetPostLikeRequestDto,
  options?: Options,
): Promise<void> {
  await put(`/posts/${postId}/like`, input, SetPostLikeResponseDtoSchema, {
    ...options,
    token,
  });
}

export async function deletePost(
  token: string,
  postId: number,
  options?: Options,
): Promise<void> {
  await del(`/posts/${postId}`, DeletePostResponseDtoSchema, {
    ...options,
    token,
  });
}

export async function createComment(
  token: string,
  postId: number,
  input: CreateCommentRequestDto,
  options?: Options,
) {
  return post(
    `/posts/${postId}/comments`,
    input,
    CreateCommentResponseDtoSchema,
    { ...options, token },
  );
}

export async function updateComment(
  token: string,
  postId: number,
  commentId: number,
  input: UpdateCommentRequestDto,
  options?: Options,
): Promise<void> {
  await patch(
    `/posts/${postId}/comments/${commentId}`,
    input,
    UpdateCommentResponseDtoSchema,
    { ...options, token },
  );
}

export async function deleteComment(
  token: string,
  postId: number,
  commentId: number,
  options?: Options,
): Promise<void> {
  await del(
    `/posts/${postId}/comments/${commentId}`,
    DeleteCommentResponseDtoSchema,
    { ...options, token },
  );
}

export async function beginAttachmentUpload(token: string, options?: Options) {
  return post(
    "/attachments/begin",
    undefined,
    BeginAttachmentUploadResponseDtoSchema,
    { ...options, token },
  );
}

export async function confirmAttachmentUpload(
  token: string,
  input: ConfirmAttachmentUploadRequestDto,
  options?: Options,
): Promise<void> {
  await post(
    "/attachments/confirm",
    input,
    ConfirmAttachmentUploadResponseDtoSchema,
    { ...options, token },
  );
}

export async function createPostReport(
  token: string,
  input: CreatePostReportRequestDto,
  options?: Options,
): Promise<void> {
  await post("/reports/post", input, CreatePostReportResponseDtoSchema, {
    ...options,
    token,
  });
}

export async function createCommentReport(
  token: string,
  input: CreateCommentReportRequestDto,
  options?: Options,
): Promise<void> {
  await post("/reports/comment", input, CreateCommentReportResponseDtoSchema, {
    ...options,
    token,
  });
}
