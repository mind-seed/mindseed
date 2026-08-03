import { styled, css } from "styled-components";
import { COLORS } from "../style/colors";
import { TEXT_STYLE } from "../style/typography";
import { SmallChevronRightIcon } from "./Icons/SmallChevronRightIcon";

type ButtonVariant = "primary" | "outlined";

type ButtonProps = {
  variant: ButtonVariant;
  size: "medium" | "small";
  label: string;
  type?: "button" | "submit";
  showIcon?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

export const Button = ({
  variant,
  size,
  label,
  type = "button",
  showIcon = false,
  disabled = false,
  onClick,
}: ButtonProps) => {
  return (
    <StyledButton
      type={type}
      disabled={disabled}
      onClick={onClick}
      $variant={variant}
      $size={size}
      $showIcon={showIcon}
    >
      {label}
      {showIcon && <SmallChevronRightIcon width="1em" height="1em" />}
    </StyledButton>
  );
};

const StyledButton = styled.button<{
  $variant: ButtonVariant;
  $showIcon?: boolean;
  $size: "medium" | "small";
}>`
  display: flex;
  justify-content: center;
  gap: ${({ $showIcon }) => $showIcon && `0.625rem`};
  ${TEXT_STYLE.title.ti};
  cursor: pointer;

  ${({ $size }) =>
    $size === "medium"
      ? css`
          width: 100%;
          padding: 1rem 1.25rem;
          border-radius: 12px;
        `
      : css`
          padding: 0.5rem 0.625rem;
          border-radius: 6px;
        `}

  svg {
    stroke: currentColor;
  }

  ${({ $variant }) =>
    $variant === "primary"
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
