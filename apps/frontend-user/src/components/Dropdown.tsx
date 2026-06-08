import { styled } from "styled-components";
import { useState, useRef, useEffect } from "react";
import { COLORS } from "../style/colors";
import { TEXT_STYLE } from "../style/typography";

type DropdownProps<T> = {
  menuList: T[];
  activeMenu: T;
  onClick: (menu: T) => void;
};

export const Dropdown = <T extends string>({
  menuList,
  activeMenu,
  onClick,
}: DropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen((prev) => !prev);

  const handleMenuClick = (menu: T) => {
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
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 10L8 6L4 10"
            stroke="black"
            stroke-width="1.4"
            stroke-linecap="round"
            stroke-linejoin="round"
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
  width: 100%;
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

  transform: ${({ $isOpen }) => $isOpen && `rotate(180deg)`};
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
