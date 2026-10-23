import { styled } from "styled-components";
import { COLORS } from "../../style/colors";
import { AddIcon } from "../Icons/AddIcon";

type FloatingButtonProps = {
  onClick: () => void;
};

export const FloatingButton = ({ onClick }: FloatingButtonProps) => {
  return (
    <StyledButton type="button" onClick={onClick} aria-label="글쓰기">
      <AddIcon />
    </StyledButton>
  );
};

const StyledButton = styled.button`
  display: flex;
  width: 3.5rem;
  height: 3.5rem;
  padding: 1rem;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  gap: 0.625rem;
  border: none;
  border-radius: 50000px;
  background: ${COLORS.main.main};
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.25);
  color: ${COLORS.gray.gray0};
  cursor: pointer;
`;
