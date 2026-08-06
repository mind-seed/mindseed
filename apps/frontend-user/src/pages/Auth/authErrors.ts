import { ApiError } from "../../api/api";
import { AuthErrorCode } from "@mindseed/api-types";

export function getEmailTokenErrorMessage(error: Error | null): string {
  if (error === null) return "";
  if (
    error instanceof ApiError &&
    error.errorCode === AuthErrorCode.INVALID_VERIFICATION_CODE
  ) {
    return "인증 코드가 올바르지 않습니다.";
  }
  return "인증 중 오류가 발생했습니다. 다시 시도해주세요.";
}
