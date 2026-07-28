import styled from "styled-components";
import { COLORS } from "../style/colors";
import { TEXT_STYLE } from "../style/typography";

type ProgressBarProps = {
  level: number;
  value: number;
  max: number;
};

export const ProgressBar = ({ level, value, max }: ProgressBarProps) => {
  const progress =
    max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

  return (
    <Container>
      <Level>Lv.{level}</Level>
      <Track
        role="progressbar"
        aria-label="레벨 진행도"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Math.min(max, Math.max(0, value))}
      >
        <Fill $progress={progress} />
      </Track>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Level = styled.span`
  flex-shrink: 0;
  color: ${COLORS.gray.gray500};
  ${TEXT_STYLE.title.ti};
`;

const Track = styled.div`
  width: 100%;
  height: 0.75rem;
  overflow: hidden;
  border-radius: 999px;
  background: ${COLORS.gray.gray200};
`;

const Fill = styled.div<{ $progress: number }>`
  width: ${({ $progress }) => `${$progress}%`};
  height: 100%;
  border-radius: inherit;
  background: ${COLORS.main.main};
`;
