const REFRESH_TOKEN_KEY = "refreshToken";

let accessToken: string | null = null;

export function setTokens(at: string, rt: string): void {
  accessToken = at;
  localStorage.setItem(REFRESH_TOKEN_KEY, rt);
}

export function clearTokens(): void {
  accessToken = null;
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}
