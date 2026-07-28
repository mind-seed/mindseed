import { useState } from "react";
import { useNavigate } from "react-router";
import { styled } from "styled-components";
import { Button } from "../../components/Button";
import { TextInput } from "../../components/TextInput";
import { TopBar } from "../../components/TopBar";
import { VerificationCodeInput } from "../../components/VerificationCodeInput";
import { useCountdown } from "../../hooks/useCountdown";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";
import { PasswordSchema } from "../../type/index";

type PasswordResetStep = "email" | "code" | "password";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VERIFICATION_CODE_PATTERN = /^\d{6}$/;

export const PasswordReset = () => {
  const navigate = useNavigate();
  const verificationTimer = useCountdown(3 * 60);
  const [step, setStep] = useState<PasswordResetStep>("email");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [emailError, setEmailError] = useState("");
  const [verificationCodeError, setVerificationCodeError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordConfirmError, setPasswordConfirmError] = useState("");

  const isSubmitDisabled =
    step === "email"
      ? !email.trim()
      : step === "code"
        ? !verificationTimer.isRunning || verificationCode.length !== 6
        : !password || !passwordConfirm || password !== passwordConfirm;

  const handleBack = () => {
    if (step === "password") {
      setStep("code");
      return;
    }

    if (step === "code") {
      verificationTimer.stop();
      setStep("email");
      return;
    }

    navigate(-1);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitDisabled) return;

    if (step === "email") {
      if (!EMAIL_PATTERN.test(email.trim())) {
        setEmailError("올바른 이메일 형식이 아닙니다.");
        return;
      }

      setEmailError("");
      setVerificationCode("");
      verificationTimer.reset();
      setStep("code");
      return;
    }

    if (step === "code") {
      if (!VERIFICATION_CODE_PATTERN.test(verificationCode)) {
        setVerificationCodeError("인증 코드가 올바르지 않습니다.");
        return;
      }

      setVerificationCodeError("");
      setStep("password");
      return;
    }

    const passwordResult = PasswordSchema.safeParse(password);

    if (!passwordResult.success) {
      setPasswordError(
        "영문 대소문자, 숫자, 특수문자를 포함한 8~20자로 입력해주세요.",
      );
      return;
    }

    setPasswordError("");
    setPasswordConfirmError("");

    navigate("/login");
  };

  return (
    <Page>
      <TopBar title="비밀번호 찾기" onBackClick={handleBack} />

      <Form onSubmit={handleSubmit}>
        {step === "email" && (
          <EmailContent>
            <Heading>가입한 이메일을 입력해주세요.</Heading>
            <TextInput
              name="password-reset-email"
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
          </EmailContent>
        )}

        {step === "code" && (
          <>
            <CodeContent>
              <Timer>{verificationTimer.formattedTime}</Timer>
              <CodeHeader>
                <CodeHeading>인증 코드를 보내드렸습니다</CodeHeading>
                <Description>
                  이메일로 전송된 숫자 6자리를 입력해주세요.
                </Description>
              </CodeHeader>
              <VerificationCodeInput
                value={verificationCode}
                onChange={(value) => {
                  setVerificationCode(value);
                  setVerificationCodeError("");
                }}
              />
            </CodeContent>
            {verificationCodeError && (
              <ErrorMessage>인증 코드가 일치하지 않습니다.</ErrorMessage>
            )}
          </>
        )}

        {step === "password" && (
          <PasswordContent>
            <PasswordHeader>
              <PasswordHeading>새 비밀번호를 입력해주세요.</PasswordHeading>
            </PasswordHeader>
            <Fields>
              <Field>
                <Label htmlFor="password-reset-password">비밀번호</Label>
                <TextInput
                  name="password-reset-password"
                  type="password"
                  value={password}
                  status={passwordError ? "error" : "normal"}
                  description={passwordError}
                  placeholder="비밀번호를 입력해주세요."
                  adornmentType="icon"
                  onChange={(event) => {
                    const nextPassword = event.target.value;
                    setPassword(nextPassword);
                    setPasswordError("");
                    setPasswordConfirmError(
                      passwordConfirm && passwordConfirm !== nextPassword
                        ? "비밀번호가 일치하지 않습니다."
                        : "",
                    );
                  }}
                />
              </Field>
              <Field>
                <Label htmlFor="password-reset-password-confirm">
                  비밀번호 확인
                </Label>
                <TextInput
                  name="password-reset-password-confirm"
                  type="password"
                  value={passwordConfirm}
                  status={passwordConfirmError ? "error" : "normal"}
                  description={passwordConfirmError}
                  placeholder="비밀번호를 다시 입력해주세요."
                  adornmentType="icon"
                  onChange={(event) => {
                    const nextPasswordConfirm = event.target.value;
                    setPasswordConfirm(nextPasswordConfirm);
                    setPasswordConfirmError(
                      nextPasswordConfirm && nextPasswordConfirm !== password
                        ? "비밀번호가 일치하지 않습니다."
                        : "",
                    );
                  }}
                />
              </Field>
            </Fields>
          </PasswordContent>
        )}

        <BottomArea>
          <Button
            variant="primary"
            size="medium"
            type="submit"
            label={
              step === "email"
                ? "코드 전송"
                : step === "code"
                  ? "다음"
                  : "비밀번호 변경"
            }
            showIcon={step !== "password"}
            disabled={isSubmitDisabled}
          />
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

const EmailContent = styled.section`
  flex: 1;
  padding-top: 2.25rem;
`;

const Heading = styled.h1`
  margin-bottom: 0.75rem;
  color: ${COLORS.text.black};
  ${TEXT_STYLE.title.ti};
`;

const CodeContent = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.75rem 1rem 0;
  text-align: center;
`;

const Timer = styled.span`
  margin-bottom: 0.75rem;
  color: ${COLORS.main["main+"]};
  ${TEXT_STYLE.body.md};
`;

const CodeHeader = styled.header`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 2rem;
`;

const CodeHeading = styled.h1`
  color: ${COLORS.text.black};
  ${TEXT_STYLE.title.ti};
`;

const Description = styled.p`
  color: ${COLORS.gray.gray500};
  ${TEXT_STYLE.body.ti};
`;

const PasswordContent = styled.section`
  flex: 1;
`;

const PasswordHeader = styled.header`
  margin-bottom: 2.625rem;
  text-align: center;
`;

const PasswordHeading = styled.h1`
  color: ${COLORS.gray.gray700};
  ${TEXT_STYLE.body.sm};
`;

const ErrorMessage = styled.span`
  margin-bottom: 0.75rem;
  color: ${COLORS.state.error};
  ${TEXT_STYLE.body.ti};
  text-align: center;
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
  flex-shrink: 0;
`;
