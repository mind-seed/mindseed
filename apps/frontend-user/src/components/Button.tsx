import { styled, css } from "styled-components";
import { COLORS } from "../style/colors";
import { TEXT_STYLE } from "../style/typography";

type ButtonProps = {
  variant: "contained" | "outlined";
  showIcon?: boolean;
  size: "normal" | "mini";
  label: string;
};

export const Button = ({ variant, showIcon, size, label }: ButtonProps) => {
  return (
    <StyledButton $variant={variant} $showIcon={showIcon} $size={size}>
      {label}
      {showIcon && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 12L10 8L6 4"
            stroke="currentColor"
            stroke-width="1.4"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      )}
    </StyledButton>
  );
};

const StyledButton = styled.button<{
  $variant: "contained" | "outlined";
  $showIcon?: boolean;
  $size: "normal" | "mini";
}>`
  display: flex;
  justify-content: center;
  gap: ${({ $showIcon }) => $showIcon && `10px`};
  font-size: ${TEXT_STYLE.title.ti};
  cursor: pointer;

  ${({ $size }) =>
    $size === "normal"
      ? css`
          padding: 16px 20px;
          border-radius: 12px;
        `
      : css`
          padding: 8px 10px;
          border-radius: 6px;
        `}

  svg {
    stroke: currentColor;
  }

  ${({ $variant }) =>
    $variant === "contained"
      ? css`
          background: ${COLORS.main.main};
          border: none;
          color: ${COLORS.gray.gray0};

          &:hover {
            background: ${COLORS.main["main+"]};
          }

          &:disabled {
            background: ${COLORS.main.disabled};
            color: ${COLORS.gray.gray700};
          }
        `
      : css`
          background: ${COLORS.gray.gray0};
          border: 2px ${COLORS.main.main} solid;
          color: ${COLORS.main["main+"]};

          &:hover {
            background: ${COLORS.main.back};
          }

          &:disabled {
            background: ${COLORS.main.disabled};
            border: none;
            color: ${COLORS.gray.gray700};
          }
        `};
`;
