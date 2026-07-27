import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Onboarding } from "./pages/Onboarding";
import { PasswordReset } from "./pages/PasswordReset";
import { SignUp } from "./pages/SignUp";
import { CommunityMainPage } from "./pages/Community/Community";
import { PostDetailPage } from "./pages/Community/PostDetail";
import { PostWritePage } from "./pages/Community/PostWrite";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/onboarding",
        element: <Onboarding />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/signup",
        element: <SignUp />,
      },
      {
        path: "/password-reset",
        element: <PasswordReset />,
      },
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/community",
        children: [
          {
            index: true,
            element: <CommunityMainPage />,
          },
          {
            path: "write",
            element: <PostWritePage />,
          },
          {
            path: ":postId",
            element: <PostDetailPage />,
          },
          {
            path: ":postId/edit",
            element: <PostWritePage />,
          },
        ],
      },
    ],
  },
]);
