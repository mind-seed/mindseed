import { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import styled from "styled-components";
import { updateCurrentUserProfile } from "../../api/api";
import { callAuthenticated } from "../../api/callAuthenticated";
import { Button } from "../../components/Button";
import { CharacterCarousel } from "../../components/Diagnoses/CharacterCarousel";
import { TopBar } from "../../components/TopBar";
import { CHARACTERS } from "../../constants/character";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";

const SELECTED_CHARACTER_ID_KEY = "diagnosis_selected_character_id";

const getStoredCharacterId = () => {
  const storedCharacterId = sessionStorage.getItem(SELECTED_CHARACTER_ID_KEY);
  if (storedCharacterId === null) return null;

  const value = Number(storedCharacterId);
  return Number.isInteger(value) && CHARACTERS[value] ? value : null;
};

export const CharacterSelect = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedCharacterId, setSelectedCharacterId] = useState<number | null>(
    getStoredCharacterId,
  );
  const characterMutation = useMutation({
    mutationFn: (characterIndex: number) =>
      callAuthenticated(
        (token) => updateCurrentUserProfile(token, { characterIndex }),
        navigate,
      ),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      navigate("/diagnosis");
    },
  });

  const handleCharacterSelect = (characterId: number) => {
    setSelectedCharacterId(characterId);
    sessionStorage.setItem(SELECTED_CHARACTER_ID_KEY, String(characterId));
  };

  return (
    <Page>
      <TopBar
        onBackClick={() => {
          if (!characterMutation.isPending) navigate(-1);
        }}
      />
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
        <CarouselArea inert={characterMutation.isPending}>
          <CharacterCarousel
            initialCharacterId={selectedCharacterId ?? undefined}
            onSelect={handleCharacterSelect}
          />
        </CarouselArea>
      </Content>

      <Actions>
        {characterMutation.isError ? (
          <ErrorMessage role="alert">
            캐릭터를 저장하지 못했습니다. 다시 시도해주세요.
          </ErrorMessage>
        ) : (
          <HelperText>선택한 캐릭터는 언제든 바꿀 수 있습니다!</HelperText>
        )}
        <Button
          variant="primary"
          size="medium"
          label={
            characterMutation.isPending
              ? "저장 중..."
              : characterMutation.isError
                ? "다시 시도"
                : "다음"
          }
          showIcon
          disabled={selectedCharacterId === null || characterMutation.isPending}
          onClick={() => {
            if (selectedCharacterId === null || characterMutation.isPending)
              return;
            characterMutation.mutate(selectedCharacterId);
          }}
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

const ErrorMessage = styled.span`
  color: ${COLORS.state.error};
  ${TEXT_STYLE.body.ti};
  text-align: center;
`;
