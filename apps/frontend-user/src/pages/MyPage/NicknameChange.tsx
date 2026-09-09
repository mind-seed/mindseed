import { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { styled } from "styled-components";
import { Button } from "../../components/Button";
import { TextInput } from "../../components/TextInput";
import { TopBar } from "../../components/TopBar";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";
import { UpdateCurrentUserRequestDtoSchema } from "@mindseed/api-types";
import { ApiError, updateCurrentUserProfile } from "../../api/api";
import { callAuthenticated } from "../../api/callAuthenticated";

function getApiError(error: unknown): string | null {
  if (!(error instanceof ApiError)) return null;
  return "오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
}

export const NicknameChange = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [nickname, setNickname] = useState("");
  const isNicknameValid = UpdateCurrentUserRequestDtoSchema.safeParse({
    nickname: nickname.trim(),
  }).success;

  const updateMutation = useMutation({
    mutationFn: (trimmedNickname: string) =>
      callAuthenticated(
        (token) => updateCurrentUserProfile(token, { nickname: trimmedNickname }),
        navigate,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      navigate("/mypage");
    },
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isNicknameValid) return;
    updateMutation.mutate(nickname.trim());
  };

  const apiError = getApiError(updateMutation.error);

  return (
    <Page>
      <TopBar title="닉네임 변경" onBackClick={() => navigate(-1)} />

      <Form onSubmit={handleSubmit}>
        <Content>
          <Heading>변경할 이름을 입력해주세요.</Heading>
          <TextInput
            name="nickname"
            value={nickname}
            status={apiError ? "error" : "normal"}
            description={apiError ?? "2~8자,한글·영문(대소문자)·숫자·공백을 사용할 수 있습니다."}
            placeholder="내용을 입력해주세요."
            onChange={(event) => {
              setNickname(event.target.value);
              updateMutation.reset();
            }}
          />
        </Content>

        <BottomArea>
          <Button
            variant="primary"
            size="medium"
            type="submit"
            label="저장하기"
            disabled={!isNicknameValid || updateMutation.isPending}
          />
        </BottomArea>
      </Form>
    </Page>
  );
};

const Page = styled.main`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Form = styled.form`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1.25rem;
`;

const Content = styled.section`
  flex: 1;
`;

const Heading = styled.h1`
  margin-bottom: 0.75rem;
  color: ${COLORS.text.black};
  ${TEXT_STYLE.body.md2};
`;

const BottomArea = styled.div`
  flex-shrink: 0;
`;
