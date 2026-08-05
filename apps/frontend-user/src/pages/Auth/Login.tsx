import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { styled } from "styled-components";
import { Button } from "../../components/Button";
import { TextInput } from "../../components/TextInput";
import { TopBar } from "../../components/TopBar";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";
import { LoginRequestDtoSchema } from "@mindseed/api-types";
import type { LoginRequestDto } from "@mindseed/api-types";
import { ApiError, login } from "../../api/api";
import { setTokens } from "../../api/tokens";

function getLoginErrorMessage(error: Error | null): string {
  if (error === null) return "";
  if (error instanceof ApiError && error.errorCode === "INVALID_CREDENTIALS") {
    return "이메일 또는 비밀번호가 올바르지 않습니다.";
  }
  return "로그인 중 오류가 발생했습니다. 다시 시도해주세요.";
}

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const loginMutation = useMutation({
    mutationFn: (input: LoginRequestDto) => login(input),
    onSuccess: (data) => {
      setTokens(data.accessToken, data.refreshToken);
      void navigate("/");
    },
  });

  const apiError = getLoginErrorMessage(loginMutation.error);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = LoginRequestDtoSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      setEmailError(fieldErrors.email?.[0] ?? "");
      setPasswordError(fieldErrors.password?.[0] ?? "");
      return;
    }
    loginMutation.mutate(result.data);
  };

  return (
    <Page>
      <TopBar onBackClick={() => navigate(-1)} />

      <Form onSubmit={handleSubmit}>
        <Heading>
          기다리고 있었어요.
          <br />
          다시 오신 걸 환영합니다.
        </Heading>

        <Fields>
          <Field>
            <Label htmlFor="login-email">이메일</Label>
            <TextInput
              name="login-email"
              type="email"
              value={email}
              status={emailError ? "error" : "normal"}
              description={emailError}
              placeholder="example@gmail.com"
              onChange={(event) => {
                setEmail(event.target.value);
                setEmailError("");
                loginMutation.reset();
              }}
            />
          </Field>

          <Field>
            <Label htmlFor="login-password">비밀번호</Label>
            <TextInput
              name="login-password"
              type="password"
              value={password}
              status={passwordError || apiError ? "error" : "normal"}
              description={passwordError || apiError}
              placeholder="비밀번호를 입력해주세요."
              adornmentType="icon"
              onChange={(event) => {
                setPassword(event.target.value);
                setPasswordError("");
                loginMutation.reset();
              }}
            />
          </Field>
        </Fields>

        <BottomArea>
          <Button
            variant="primary"
            size="medium"
            type="submit"
            label="로그인"
            disabled={loginMutation.isPending}
          />

          <Links>
            <StyledLink to="/signup">
              <Text>계정이 없으신가요? </Text>
              회원가입
            </StyledLink>
            <Divider />
            <StyledLink to="/password-reset">비밀번호 찾기</StyledLink>
          </Links>
        </BottomArea>
      </Form>
    </Page>
  );
};

const Page = styled.main`
  width: 100%;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
`;

const Form = styled.form`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0.75rem 1.25rem;
`;

const Heading = styled.h1`
  margin-bottom: 2rem;
  color: ${COLORS.main["main+"]};
  ${TEXT_STYLE.title.sm};
`;

const Fields = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

const Label = styled.label`
  color: ${COLORS.text.black};
  ${TEXT_STYLE.body.sm};
`;

const BottomArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

const Links = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  ${TEXT_STYLE.body.ti};
`;

const StyledLink = styled(Link)`
  color: ${COLORS.main["main+"]};
  font-weight: 600;
  text-decoration: none;
`;

const Text = styled.span`
  color: ${COLORS.gray.gray500};
  font-weight: 400;
`;

const Divider = styled.span`
  width: 1px;
  height: 0.75rem;
  background: ${COLORS.gray.gray200};
`;
