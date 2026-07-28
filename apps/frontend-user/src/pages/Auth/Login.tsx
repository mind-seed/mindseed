import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { styled } from "styled-components";
import { Button } from "../../components/Button";
import { TextInput } from "../../components/TextInput";
import { TopBar } from "../../components/TopBar";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";
import { PasswordSchema } from "../../type/index";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim() || !password) return;

    const isEmailValid = EMAIL_PATTERN.test(email.trim());
    const passwordResult = PasswordSchema.safeParse(password);

    if (!isEmailValid || !passwordResult.success) {
      setEmailError(!isEmailValid ? "올바른 이메일 형식이 아닙니다." : "");
      setPasswordError(
        !passwordResult.success
          ? "영문 대소문자, 숫자, 특수문자를 포함한 8~20자로 입력해주세요."
          : "",
      );
      return;
    }

    setEmailError("");
    setPasswordError("");

    navigate("/");
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
              }}
            />
          </Field>

          <Field>
            <Label htmlFor="login-password">비밀번호</Label>
            <TextInput
              name="login-password"
              type="password"
              value={password}
              status={passwordError ? "error" : "normal"}
              description={passwordError}
              placeholder="비밀번호를 입력해주세요."
              adornmentType="icon"
              onChange={(event) => {
                setPassword(event.target.value);
                setPasswordError("");
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
            disabled={!email.trim() || !password}
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
  padding: 2.1875rem 1.25rem 1.875rem;
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
