import { styled } from "styled-components";
import { COLORS } from "../../style/colors";

type FloatingButtonProps = {
  onClick: () => void;
};

export const FloatingButton = ({ onClick }: FloatingButtonProps) => {
  return (
    <StyledButton type="button" onClick={onClick}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 5C12.5523 5 13 5.44772 13 6V11H18C18.5523 11 19 11.4477 19 12C19 12.5523 18.5523 13 18 13H13V18C13 18.5523 12.5523 19 12 19C11.4477 19 11 18.5523 11 18V13H6C5.44772 13 5 12.5523 5 12C5 11.4477 5.44772 11 6 11H11V6C11 5.44772 11.4477 5 12 5Z"
          fill="currentColor"
        />
      </svg>
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
