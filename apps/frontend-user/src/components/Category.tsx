import { styled, css } from "styled-components";
import { COLORS } from "../style/colors";
import { TEXT_STYLE } from "../style/typography";

type CategoryProps = {
  $variant: "active" | "inactive" | "selected";
  $label: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
};

export const Category = styled.button.attrs<CategoryProps>((props) => ({
  $variant: props.$variant,
  type: "button",
  children: props.$label,
  onClick: props.onClick,
}))<CategoryProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.375rem 0.5rem;
  border: none;
  background: none;
  ${TEXT_STYLE.body.ti};
  line-height: normal;
  cursor: pointer;

  ${({ $variant }) => {
    switch ($variant) {
      case "active":
        return css`
          border-bottom: 1px solid ${COLORS.text.black};
          color: ${COLORS.text.black};
        `;
      case "inactive":
        return css`
          color: ${COLORS.gray.gray600};
        `;
      case "selected":
      default:
        return css`
          border: 1px solid ${COLORS.main.main};
          border-radius: 6px;
          background: ${COLORS.main.back};
          color: ${COLORS.main.darker};
        `;
    }
  }}
`;
