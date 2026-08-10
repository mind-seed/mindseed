import { createBrowserRouter, redirect } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Onboarding } from "./pages/Onboarding";
import { Login } from "./pages/Auth/Login";
import { SignUp } from "./pages/Auth/SignUp";
import { PasswordReset } from "./pages/Auth/PasswordReset";
import { CommunityMainPage } from "./pages/Community/Community";
import { PostDetailPage } from "./pages/Community/PostDetail";
import { PostWritePage } from "./pages/Community/PostWrite";
import { ApiError, refreshTokens } from "./api/api";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "./api/tokens";
import { AuthErrorCode } from "@mindseed/api-types";

let bootstrapPromise: Promise<void> | null = null;

async function bootstrap(): Promise<void> {
  if (getAccessToken() !== null) return;
  const rt = getRefreshToken();
  if (rt === null) return;
  bootstrapPromise ??= (async () => {
    try {
      const tokens = await refreshTokens(rt);
      setTokens(tokens.accessToken, tokens.refreshToken);
    } catch (e) {
      if (e instanceof ApiError && e.errorCode === AuthErrorCode.INVALID_REFRESH_TOKEN) {
        clearTokens();
      }
    } finally {
      bootstrapPromise = null;
    }
  })();
  await bootstrapPromise;
}

async function appLoader() {
  await bootstrap();
  if (getAccessToken() === null) return redirect("/onboarding");
  return null;
}

async function authLoader() {
  await bootstrap();
  if (getAccessToken() !== null) return redirect("/");
  return null;
}

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        loader: authLoader,
        children: [
          { path: "/onboarding", element: <Onboarding /> },
          { path: "/login", element: <Login /> },
          { path: "/signup", element: <SignUp /> },
          { path: "/password-reset", element: <PasswordReset /> },
        ],
      },
      {
        loader: appLoader,
        children: [
          { path: "/", element: <Home /> },
          {
            path: "/community",
            children: [
              { index: true, element: <CommunityMainPage /> },
              { path: "write", element: <PostWritePage /> },
              { path: ":postId", element: <PostDetailPage /> },
              { path: ":postId/edit", element: <PostWritePage /> },
            ],
          },
        ],
      },
    ],
  },
]);
