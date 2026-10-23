import { styled, css } from "styled-components";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";
import type { z } from "zod";
import { CounselSummaryDtoSchema } from "@mindseed/api-types";
import { CircleCheckIcon } from "../Icons/CircleCheckIcon";

type CounselSummaryDto = z.infer<typeof CounselSummaryDtoSchema>;

type CounselStatusProps = Pick<CounselSummaryDto, "title" | "responded"> & {
  onClick: () => void;
};

export const CounselStatus = ({
  title,
  responded,
  onClick,
}: CounselStatusProps) => (
  <Container type="button" $responded={responded} onClick={onClick}>
    <TitleArea>
      {responded && (
        <CircleCheckIcon width={16} height={16} color={COLORS.main.main} />
      )}
      <Title>{title}</Title>
    </TitleArea>
    <Status>{responded ? "답변완료" : "미답변"}</Status>
  </Container>
);

const Container = styled.button<{ $responded: boolean }>`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 1rem 1.5rem;
  ${({ $responded }) =>
    $responded
      ? css`
          border: 1px solid ${COLORS.main.main};
          background: ${COLORS.main.back};
          color: ${COLORS.main["main+"]};
        `
      : css`
          border: 1px solid ${COLORS.gray.gray400};
          background: ${COLORS.gray.gray0};
          color: ${COLORS.gray.gray600};
        `}
  border-radius: 12px;
  cursor: pointer;
`;

const TitleArea = styled.span`
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.375rem;
`;

const Title = styled.span`
  ${TEXT_STYLE.body.sm};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Status = styled.span`
  flex-shrink: 0;
  ${TEXT_STYLE.body.sm};
`;
