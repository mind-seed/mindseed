import { Outlet, useLocation } from "react-router";
import { BottomNav } from "../components/BottomNav";
import styled from "styled-components";

export const Layout = () => {
  const { pathname } = useLocation();
  const hidesBottomNav =
    ["/onboarding", "/login", "/signup", "/password-reset"].includes(
      pathname,
    ) || /^\/community\/[^/]+(?:\/edit)?$/.test(pathname);

  return (
    <LayoutWrapper $hasBottomNav={!hidesBottomNav}>
      <Outlet />
      {!hidesBottomNav && <BottomNav />}
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
