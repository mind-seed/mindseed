import styled from "styled-components";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";

type LevelProgressProps = {
  level: number;
  progress: number;
};

export const LevelProgress = ({ level, progress }: LevelProgressProps) => (
  <Container>
    <Label>
      Lv. <Hightlight>{level}</Hightlight>
    </Label>
    <Track>
      <Progress $progress={Math.min(Math.max(progress, 0), 100)} />
    </Track>
  </Container>
);

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0;
`;

const Label = styled.strong`
  color: ${COLORS.gray.gray500};
  ${TEXT_STYLE.title.ti};
`;

const Hightlight = styled.strong`
  color: ${COLORS.main["main+"]};
  ${TEXT_STYLE.title.ti};
`;

const Track = styled.div`
  height: 0.75rem;
  flex: 1;
  overflow: hidden;
  border-radius: 999px;
  background: ${COLORS.gray.gray150};
`;

const Progress = styled.div<{ $progress: number }>`
  width: ${({ $progress }) => `${$progress}%`};
  height: 100%;
  background: linear-gradient(to right, #abd138 0%, #54854d 100%);
`;
