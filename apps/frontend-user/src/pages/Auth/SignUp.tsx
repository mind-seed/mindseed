import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { styled } from "styled-components";
import { Button } from "../../components/Button";
import { TextInput } from "../../components/TextInput";
import { TopBar } from "../../components/TopBar";
import { useCountdown } from "../../hooks/useCountdown";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";
import { AuthorNicknameSchema, PasswordSchema } from "../../type/index";

type SignUpStep = "email" | "password" | "profile";

const VERIFICATION_VALIDITY_SECONDS = 3 * 60;
const VERIFICATION_RESEND_DELAY_SECONDS = 30;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const VERIFICATION_CODE_PATTERN = /^\d{6}$/;

export const SignUp = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<SignUpStep>("email");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationCodeError, setVerificationCodeError] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const verificationTimer = useCountdown(VERIFICATION_VALIDITY_SECONDS);
  const resendTimer = useCountdown(VERIFICATION_RESEND_DELAY_SECONDS);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordConfirmError, setPasswordConfirmError] = useState("");
  const [nickname, setNickname] = useState("");
  const [nicknameError, setNicknameError] = useState("");
  const [age, setAge] = useState("");
  const [ageError, setAgeError] = useState("");
  const isCodeValid = verificationTimer.isRunning;
  const isEmailStepDisabled =
    !isCodeValid || verificationCode.trim().length !== 6;
  const isPasswordStepDisabled =
    !password || !passwordConfirm || password !== passwordConfirm;
  const isProfileStepDisabled = !nickname.trim() || !age;

  const handleBack = () => {
    if (step === "profile") {
      setStep("password");
      return;
    }

    if (step === "password") {
      setStep("email");
      return;
    }

    navigate(-1);
  };

  const handleSendCode = () => {
    if (!EMAIL_PATTERN.test(email.trim())) {
      setEmailError("올바른 이메일 형식이 아닙니다.");
      return;
    }

    setEmailError("");
    setVerificationCodeError("");
    setIsCodeSent(true);
    setVerificationCode("");
    verificationTimer.reset();
    resendTimer.reset();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (step === "email") {
      if (isEmailStepDisabled) return;

      if (!VERIFICATION_CODE_PATTERN.test(verificationCode)) {
        setVerificationCodeError("인증 코드가 올바르지 않습니다.");
        return;
      }

      setVerificationCodeError("");
      verificationTimer.stop();
      setStep("password");
      return;
    }

    if (step === "password") {
      if (isPasswordStepDisabled) return;

      const passwordResult = PasswordSchema.safeParse(password);

      if (!passwordResult.success) {
        setPasswordError(
          "영문 대소문자, 숫자, 특수문자를 포함한 8~20자로 입력해주세요.",
        );
        return;
      }

      setPasswordError("");
      setPasswordConfirmError("");
      setStep("profile");
      return;
    }

    if (isProfileStepDisabled) return;

    const nicknameResult = AuthorNicknameSchema.safeParse(nickname.trim());
    const numericAge = Number(age);
    const isAgeValid = numericAge >= 1 && numericAge <= 99;

    setNicknameError(
      nicknameResult.success ? "" : "닉네임은 2~10자로 입력해주세요.",
    );
    setAgeError(isAgeValid ? "" : "나이를 올바르게 입력해주세요.");

    if (!nicknameResult.success || !isAgeValid) return;

    navigate("/login");
  };

  return (
    <Page>
      <TopBar onBackClick={handleBack} />

      <Form onSubmit={handleSubmit}>
        {step === "email" && (
          <>
            <Header>
              <Heading>이메일 인증을 완료해주세요.</Heading>
              <Description>
                마음씨에서 사용할 이메일을 인증해주세요.
              </Description>
            </Header>

            <Fields>
              <Field>
                <Label htmlFor="signup-email">이메일</Label>
                <EmailRow>
                  <TextInput
                    name="signup-email"
                    type="email"
                    value={email}
                    status={emailError ? "error" : "normal"}
                    description={emailError}
                    placeholder="example@gmail.com"
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setEmailError("");
                      setVerificationCodeError("");
                      setVerificationCode("");
                      setIsCodeSent(false);
                      verificationTimer.stop();
                      resendTimer.stop();
                    }}
                  />

                  <ButtonWrapper>
                    <Button
                      variant="primary"
                      size="medium"
                      label="코드 발송"
                      disabled={!email.trim() || resendTimer.isRunning}
                      onClick={handleSendCode}
                    />
                  </ButtonWrapper>
                </EmailRow>
              </Field>

              <Field>
                <Label htmlFor="signup-code">인증 코드</Label>
                <TextInput
                  name="signup-code"
                  value={verificationCode}
                  status={verificationCodeError ? "error" : "normal"}
                  description={verificationCodeError}
                  placeholder={
                    !isCodeSent
                      ? "인증번호 발송 후 입력 가능합니다"
                      : isCodeValid
                        ? "숫자 6자리를 입력해주세요."
                        : "인증 코드가 만료되었습니다."
                  }
                  disabled={!isCodeValid}
                  adornmentType={isCodeSent ? "text" : "none"}
                  adornmentText={verificationTimer.formattedTime}
                  onChange={(event) => {
                    setVerificationCode(event.target.value);
                    setVerificationCodeError("");
                  }}
                />
              </Field>
            </Fields>
          </>
        )}

        {step === "password" && (
          <>
            <Header>
              <Heading>비밀번호를 입력해주세요.</Heading>
              <Description>
                안전한 이용을 위해 영문 대소문자, 숫자, 특수문자를
                <br />
                모두 포함하여 8~20자로 설정해 주세요.
              </Description>
            </Header>

            <Fields>
              <Field>
                <Label htmlFor="signup-password">비밀번호</Label>
                <TextInput
                  name="signup-password"
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
                <Label htmlFor="signup-password-confirm">비밀번호 확인</Label>
                <TextInput
                  name="signup-password-confirm"
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
          </>
        )}

        {step === "profile" && (
          <>
            <Header>
              <Heading>닉네임과 나이를 입력해주세요</Heading>
              <Description>
                서로를 편하게 부르고 더 가까워지기 위한 작은 정보예요.
              </Description>
            </Header>

            <Fields>
              <Field>
                <Label htmlFor="signup-nickname">닉네임</Label>
                <TextInput
                  name="signup-nickname"
                  value={nickname}
                  status={nicknameError ? "error" : "normal"}
                  description={nicknameError}
                  placeholder="닉네임을 입력해주세요"
                  onChange={(event) => {
                    setNickname(event.target.value);
                    setNicknameError("");
                  }}
                />
              </Field>

              <Field>
                <Label htmlFor="signup-age">나이</Label>
                <TextInput
                  name="signup-age"
                  value={age}
                  status={ageError ? "error" : "normal"}
                  description={ageError}
                  placeholder="나이를 입력해주세요"
                  onChange={(event) => {
                    setAge(event.target.value.replace(/\D/g, "").slice(0, 2));
                    setAgeError("");
                  }}
                />
              </Field>
            </Fields>
          </>
        )}

        <BottomArea>
          <Button
            variant="primary"
            size="medium"
            type="submit"
            label={step === "profile" ? "회원가입" : "다음"}
            showIcon={step !== "profile"}
            disabled={
              step === "email"
                ? isEmailStepDisabled
                : step === "password"
                  ? isPasswordStepDisabled
                  : isProfileStepDisabled
            }
          />
          <Links>
            <StyledLink to="/login">
              <Text>계정이 있으신가요? </Text>
              로그인
            </StyledLink>
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

const Header = styled.header`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-bottom: 2rem;
`;

const Heading = styled.h1`
  color: ${COLORS.main["main+"]};
  ${TEXT_STYLE.title.sm};
`;

const Description = styled.p`
  color: ${COLORS.gray.gray400};
  ${TEXT_STYLE.body.ti};
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

const EmailRow = styled.div`
  display: flex;
  align-items: stretch;
  gap: 0.75rem;
`;

const ButtonWrapper = styled.div`
  width: 108px;
  flex-shrink: 0;
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
