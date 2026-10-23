import styled from "styled-components";
import { Button } from "../Button";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";

type MissionCardProps = {
  title: string;
  description: string;
  rewardPoints: number;
  isCompleted: boolean;
  onComplete: () => void;
};

export const MissionCard = ({
  title,
  description,
  rewardPoints,
  isCompleted,
  onComplete,
}: MissionCardProps) => (
  <Card>
    <Content>
      <Title>{title}</Title>
      <Description>{description}</Description>
    </Content>
    <Footer>
      <Reward>+{rewardPoints}point</Reward>
      <Button
        size="small"
        variant="primary"
        label={isCompleted ? "미션 완료" : "완료하기"}
        disabled={isCompleted}
        onClick={onComplete}
      />
    </Footer>
  </Card>
);

const Card = styled.article`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1rem;
  border: 1px solid ${COLORS.gray.gray150};
  border-radius: 12px;
  background: ${COLORS.gray.gray0};
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

const Title = styled.h2`
  color: ${COLORS.text.black};
  ${TEXT_STYLE.title.sm};
`;

const Description = styled.p`
  color: ${COLORS.gray.gray600};
  ${TEXT_STYLE.body.sm};
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const Reward = styled.span`
  color: ${COLORS.main["main+"]};
  ${TEXT_STYLE.body.ti};
`;
