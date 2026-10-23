import { Outlet, useLocation } from "react-router";
import { BottomNav } from "../components/BottomNav";
import styled from "styled-components";
import { COLORS } from "../style/colors";

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
    <LayoutWrapper>
      <ContentArea $hasBottomNav={showsBottomNav}>
        <Outlet />
      </ContentArea>
      {showsBottomNav && <BottomNav />}
    </LayoutWrapper>
  );
};

const LayoutWrapper = styled.div`
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background: ${COLORS.gray.gray0};
  overflow: hidden;
`;

const ContentArea = styled.main<{ $hasBottomNav: boolean }>`
  width: 100%;
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  padding-top: env(safe-area-inset-top);
  padding-bottom: ${({ $hasBottomNav }) =>
    $hasBottomNav
      ? "calc(64px + env(safe-area-inset-bottom))"
      : "env(safe-area-inset-bottom)"};
`;
