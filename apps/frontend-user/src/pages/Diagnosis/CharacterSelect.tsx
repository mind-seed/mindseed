import { useState } from "react";
import { useNavigate } from "react-router";
import styled from "styled-components";
import { Button } from "../../components/Button";
import { CharacterCarousel } from "../../components/Diagnoses/CharacterCarousel";
import { TopBar } from "../../components/TopBar";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";

export const CharacterSelect = () => {
  const navigate = useNavigate();
  const [selectedCharacterId, setSelectedCharacterId] = useState<number>();

  return (
    <Page>
      <TopBar onBackClick={() => navigate(-1)} />
      <Content>
        <Header>
          <Title>
            앞으로 <TitleHighlight>당신의 여정과 함께</TitleHighlight>할
            <br />
            캐릭터를 골라주세요!
          </Title>
          <Description>
            옆으로 스와이프해 함께할 캐릭터를 선택해주세요!
          </Description>
        </Header>
        <CarouselArea>
          <CharacterCarousel onSelect={setSelectedCharacterId} />
        </CarouselArea>
      </Content>

      <Actions>
        <HelperText>선택한 캐릭터는 언제든 바꿀 수 있습니다!</HelperText>
        <Button
          variant="primary"
          size="medium"
          label="다음"
          showIcon
          disabled={selectedCharacterId === undefined}
          onClick={() => navigate(`/diagnosis`)}
        />
      </Actions>
    </Page>
  );
};

const Page = styled.main`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: ${COLORS.gray.gray0};
`;

const Content = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3rem;
  text-align: center;
  padding: 3rem 1.25rem;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Title = styled.h1`
  white-space: nowrap;
  color: ${COLORS.text.black};
  ${TEXT_STYLE.title.sm};
`;

const TitleHighlight = styled.span`
  color: ${COLORS.main["main+"]};
`;

const Description = styled.p`
  color: ${COLORS.gray.gray600};
  ${TEXT_STYLE.body.sm};
`;

const CarouselArea = styled.div`
  width: 100%;
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0 1.25rem 0.75rem;
`;

const HelperText = styled.p`
  text-align: center;
  color: ${COLORS.gray.gray400};
  ${TEXT_STYLE.body.ti};
`;
