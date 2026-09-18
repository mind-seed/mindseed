import styled from "styled-components";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";

type DiagnosisProgressProps = {
  current: number;
  total: number;
};

export const DiagnosisProgress = ({
  current,
  total,
}: DiagnosisProgressProps) => (
  <Container aa-={`자가진단 ${current}/${total}`}>
    <Count>
      <CurrentCount>{current}</CurrentCount>/{total}
    </Count>
    <Track>
      <Progress $progress={(current / total) * 100} />
    </Track>
  </Container>
);

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0 1.25rem;
`;

const Count = styled.span`
  color: ${COLORS.text[2]};
  ${TEXT_STYLE.body.ti};
`;

const CurrentCount = styled.strong`
  color: ${COLORS.main.main};
  font: inherit;
`;

const Track = styled.div`
  height: 0.25rem;
  flex: 1;
  overflow: hidden;
  border-radius: 99px;
  background: ${COLORS.gray.gray200};
`;

const Progress = styled.div<{ $progress: number }>`
  width: ${({ $progress }) => `${$progress}%`};
  height: 100%;
  border-radius: inherit;
  background: ${COLORS.main.main};
  transition: width 200ms ease;
`;
