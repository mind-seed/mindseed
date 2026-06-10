import styled, { css } from "styled-components";
import { COLORS } from "../style/colors";
import { TEXT_STYLE } from "../style/typography";

type OptionProps = {
  $label: string;
  $isSelected: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
};

export const Option = styled.button.attrs<OptionProps>((props) => ({
  type: "button",
  children: props.$label,
  onClick: props.onClick,
}))<OptionProps>`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  background: none;
  ${TEXT_STYLE.label.md};

  ${({ $isSelected }) =>
    $isSelected
      ? css`
          border: 1px solid ${COLORS.main.main};
          background: ${COLORS.main.back};
          color: ${COLORS.main.main};
        `
      : css`
          border: 1px solid ${COLORS.gray.gray400};
          color: ${COLORS.gray.gray400};

          &:hover {
            background: ${COLORS.gray.gray100};
          }
        `}
`;
