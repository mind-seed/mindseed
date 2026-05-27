import { styled, css } from "styled-components";
import { COLORS } from "../style/colors";
import { TEXT_STYLE } from "../style/typography";

type OpitonProps = {
  label: string;
  isSelected: boolean;
};

export const Option = ({ label, isSelected }: OpitonProps) => {
  return <StyledOption $isSelected={isSelected}>{label}</StyledOption>;
};

const StyledOption = styled.button<{ $isSelected: boolean }>`
  width: 100%;
  padding: 1rem 1.25rem;
  ${TEXT_STYLE.label.md};

  ${({ $isSelected }) =>
    $isSelected
      ? css`
          border: 1px solid ${COLORS.gray.gray400};
          color: ${COLORS.gray.gray400};
        `
      : css`
          border: 1px solid ${COLORS.main.main};
          background: ${COLORS.main.back};
          color: ${COLORS.main.main};
        `}
`;
