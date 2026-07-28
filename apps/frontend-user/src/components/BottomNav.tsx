import { Link, useLocation } from "react-router";
import styled from "styled-components";
import { COLORS } from "../style/colors";
import { TEXT_STYLE } from "../style/typography";
import { CommunityIcon } from "./Icons/CommunityIcon";
import { ContentsIcon } from "./Icons/ContentsIcon";
import { HomeIcon } from "./Icons/HomeIcon";
import { MissionIcon } from "./Icons/MissionIcon";
import { ProfileIcon } from "./Icons/ProfileIcon";

const NAV_LIST = [
  { label: "홈", link: "", icon: <HomeIcon /> },
  { label: "미션", link: "mission", icon: <MissionIcon /> },
  { label: "커뮤니티", link: "community", icon: <CommunityIcon /> },
  { label: "콘텐츠", link: "contents", icon: <ContentsIcon /> },
  { label: "마이페이지", link: "mypage", icon: <ProfileIcon /> },
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
