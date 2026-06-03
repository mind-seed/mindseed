import { styled } from "styled-components";
import { useState, useRef, useEffect } from "react";
import { COLORS } from "../style/colors";
import { TEXT_STYLE } from "../style/typography";

export type MenuType = "최신순" | "추천순" | "인기순";

type DropdownProps = {
  activeMenu: MenuType;
  onClick: (menu: MenuType) => void;
};

export const Dropdown = ({ activeMenu, onClick }: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuList: MenuType[] = ["최신순", "추천순", "인기순"];

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleMenuClick = (menu: MenuType) => {
    onClick(menu);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <DropdownWrapper ref={dropdownRef}>
      <DropdownTrigger type="button" onClick={toggleDropdown}>
        <span>{activeMenu}</span>
        <ArrowIcon
          $isOpen={isOpen}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M7 14l5-5 5 5"
            stroke="black"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </ArrowIcon>
      </DropdownTrigger>
      {isOpen && (
        <Menu>
          {menuList.map((menu) => (
            <MenuItem
              key={menu}
              type="button"
              onClick={() => handleMenuClick(menu)}
            >
              {menu}
            </MenuItem>
          ))}
        </Menu>
      )}
    </DropdownWrapper>
  );
};

const DropdownWrapper = styled.div`
  width: 89px;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const DropdownTrigger = styled.button`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border: 1px solid ${COLORS.gray.gray400};
  border-radius: 6px;
  background: none;
  ${TEXT_STYLE.body.ti};
  color: ${COLORS.text.black};
  cursor: pointer;
`;

const ArrowIcon = styled.svg<{ $isOpen: boolean }>`
  width: 1rem;
  height: 1rem;
`;

const Menu = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid ${COLORS.gray.gray400};
  border-radius: 6px;
  overflow: hidden;
  z-index: 99;
`;

const MenuItem = styled.button`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border: none;
  background: none;
  ${TEXT_STYLE.body.ti};
  color: ${COLORS.text.black};
  cursor: pointer;

  &:hover {
    background: ${COLORS.gray.gray150};
  }
`;
