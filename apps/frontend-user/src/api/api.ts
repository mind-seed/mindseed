import {
  CompleteSignupRequestDtoSchema,
  CompleteSignupResponseDtoSchema,
  EmailPasswordResetRequestDtoSchema,
  EmailPasswordResetResponseDtoSchema,
  LoginRequestDtoSchema,
  LoginResponseDtoSchema,
  LogoutResponseDtoSchema,
  RefreshTokensResponseDtoSchema,
  ResetPasswordRequestDtoSchema,
  ResetPasswordResponseDtoSchema,
  SendMailRequestDtoSchema,
  SendMailResponseDtoSchema,
  VerifyMailRequestDtoSchema,
  VerifyMailResponseDtoSchema,
} from "@mindseed/api-types";
import type {
  CompleteSignupRequestDto,
  EmailPasswordResetRequestDto,
  LoginRequestDto,
  ResetPasswordRequestDto,
  SendMailRequestDto,
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

export async function sendSignUpMail(
  input: SendMailRequestDto,
  options?: Options,
): Promise<void> {
  await post(
    "/auth/email/sign-up",
    SendMailRequestDtoSchema.parse(input),
    SendMailResponseDtoSchema,
    options,
  );
}

export async function sendPasswordResetMail(
  input: EmailPasswordResetRequestDto,
  options?: Options,
): Promise<void> {
  await post(
    "/auth/email/password-reset",
    EmailPasswordResetRequestDtoSchema.parse(input),
    EmailPasswordResetResponseDtoSchema,
    options,
  );
}

export async function getEmailToken(
  input: VerifyMailRequestDto,
  options?: Options,
) {
  return post(
    "/auth/email/token",
    VerifyMailRequestDtoSchema.parse(input),
    VerifyMailResponseDtoSchema,
    options,
  );
}

export async function signUp(
  token: string,
  input: CompleteSignupRequestDto,
  options?: Options,
) {
  return post(
    "/auth/sign-up",
    CompleteSignupRequestDtoSchema.parse(input),
    CompleteSignupResponseDtoSchema,
    { ...options, token },
  );
}

export async function resetPassword(
  token: string,
  input: ResetPasswordRequestDto,
  options?: Options,
): Promise<void> {
  await post(
    "/auth/reset-password",
    ResetPasswordRequestDtoSchema.parse(input),
    ResetPasswordResponseDtoSchema,
    { ...options, token },
  );
}

export async function login(input: LoginRequestDto, options?: Options) {
  return post(
    "/auth/login",
    LoginRequestDtoSchema.parse(input),
    LoginResponseDtoSchema,
    options,
  );
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
