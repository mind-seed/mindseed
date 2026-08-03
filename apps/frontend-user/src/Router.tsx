import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Onboarding } from "./pages/Onboarding";
import { Login } from "./pages/Auth/Login";
import { SignUp } from "./pages/Auth/SignUp";
import { PasswordReset } from "./pages/Auth/PasswordReset";
import { Diagnoses } from "./pages/Diagnoses/Diagnoses";
import { DiagnosesResult } from "./pages/Diagnoses/DiagnosesResult";
import { CommunityMainPage } from "./pages/Community/Community";
import { PostDetailPage } from "./pages/Community/PostDetail";
import { PostWritePage } from "./pages/Community/PostWrite";
import { Contents } from "./pages/Contents/Contents";
import { Mission } from "./pages/Mission/Mission";
import { MyPage } from "./pages/MyPage/MyPage";
import { NicknameChange } from "./pages/MyPage/NicknameChange";
import { CharacterChange } from "./pages/MyPage/CharacterChange";
import { MyPosts } from "./pages/MyPage/MyPosts";
import { Counsel } from "./pages/Counsel/Counsel";
import { CounselWrite } from "./pages/Counsel/CounselWrite";
import { CounselDetail } from "./pages/Counsel/CounselDetail";

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
        path: "/diagnoses",
        children: [
          {
            index: true,
            element: <Diagnoses />,
          },
          {
            path: "result",
            element: <DiagnosesResult />,
          },
        ],
      },
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/mission",
        element: <Mission />,
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
      {
        path: "/contents",
        element: <Contents />,
      },
      {
        path: "/mypage",
        children: [
          { index: true, element: <MyPage /> },
          { path: "nickname", element: <NicknameChange /> },
          { path: "character", element: <CharacterChange /> },
          { path: "posts", element: <MyPosts /> },
        ],
      },
      {
        path: "/counsel",
        children: [
          { index: true, element: <Counsel /> },
          { path: "write", element: <CounselWrite /> },
          { path: ":counselId", element: <CounselDetail /> },
        ],
      },
    ],
  },
]);
