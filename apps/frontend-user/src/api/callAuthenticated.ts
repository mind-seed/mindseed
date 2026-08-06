import type { NavigateFunction } from "react-router";
import { ApiError, refreshTokens } from "./api";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "./tokens";

let refreshInFlight: Promise<string> | null = null;

async function doRefresh(): Promise<string> {
  const rt = getRefreshToken();
  if (rt === null) throw new Error("No refresh token");
  const tokens = await refreshTokens(rt);
  setTokens(tokens.accessToken, tokens.refreshToken);
  return tokens.accessToken;
}

function ensureRefresh(): Promise<string> {
  if (refreshInFlight === null) {
    refreshInFlight = doRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

export async function callAuthenticated<T>(
  fn: (token: string) => Promise<T>,
  navigate: NavigateFunction,
): Promise<T> {
  const token = getAccessToken();
  if (token === null) {
    throw new Error("Invariant: callAuthenticated called without access token");
  }

  try {
    return await fn(token);
  } catch (e) {
    if (!(e instanceof ApiError) || e.statusCode !== 401) throw e;

    let refreshedToken: string;
    try {
      refreshedToken = await ensureRefresh();
    } catch {
      clearTokens();
      navigate("/onboarding");
      throw e;
    }

    return fn(refreshedToken);
  }
}
