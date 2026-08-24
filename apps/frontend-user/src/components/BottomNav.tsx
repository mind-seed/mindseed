import { Link, useLocation } from "react-router";
import styled from "styled-components";
import { COLORS } from "../style/colors";
import { TEXT_STYLE } from "../style/typography";
import { CommentIcon } from "./Icons/CommentIcon";
import { CompassIcon } from "./Icons/CompassIcon";
import { HomeIcon } from "./Icons/HomeIcon";
import { TargetIcon } from "./Icons/TargetIcon";
import { UserIcon } from "./Icons/UserIcon";

const NAV_LIST = [
  { label: "홈", link: "", icon: <HomeIcon /> },
  { label: "미션", link: "mission", icon: <TargetIcon /> },
  { label: "커뮤니티", link: "community", icon: <CommentIcon /> },
  { label: "콘텐츠", link: "contents", icon: <CompassIcon /> },
  { label: "마이페이지", link: "mypage", icon: <UserIcon /> },
];

export const BottomNav = () => {
  const location = useLocation();

  return (
    <Nav>
      {NAV_LIST.map(({ label, link, icon }) => {
        const isActive =
          location.pathname === `/${link}` ||
          (link === "" && location.pathname === "/");
        return (
          <NavItem key={link} to={`/${link}`} $isActive={isActive}>
            {icon}
            {label}
          </NavItem>
        );
      })}
    </Nav>
  );
};

const Nav = styled.nav`
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 0 1.25rem env(safe-area-inset-bottom);
  z-index: 10;
  background: ${COLORS.gray.gray0};
`;
const NavItem = styled(Link)<{ $isActive: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.1875rem;
  padding: 0.625rem 0;
  border: none;
  background: none;
  ${TEXT_STYLE.body.ti};
  color: ${({ $isActive }) =>
    $isActive ? COLORS.main.main : COLORS.gray.gray400};
  text-decoration: none;
`;
