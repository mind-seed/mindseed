import { Outlet, useLocation } from "react-router";
import { BottomNav } from "../components/BottomNav";
import styled from "styled-components";

const SHOW_BOTTOM_NAV_PATHS = [
  "/",
  "/mission",
  "/community",
  "/contents",
  "/mypage",
];

export const Layout = () => {
  const { pathname } = useLocation();
  const showsBottomNav = SHOW_BOTTOM_NAV_PATHS.includes(pathname);

  return (
    <LayoutWrapper $hasBottomNav={showsBottomNav}>
      <Outlet />
      {showsBottomNav && <BottomNav />}
    </LayoutWrapper>
  );
};

const LayoutWrapper = styled.div<{ $hasBottomNav: boolean }>`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  padding-top: env(safe-area-inset-top);
  padding-bottom: ${({ $hasBottomNav }) =>
    $hasBottomNav
      ? "calc(4.25rem + env(safe-area-inset-bottom))"
      : "env(safe-area-inset-bottom)"};
`;
