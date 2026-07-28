import { useNavigate } from "react-router";
import { styled } from "styled-components";
import onboardingImage from "../assets/OnboardingImage.png";
import { Button } from "../components/Button";
import { Logo } from "../components/Logo";
import { COLORS } from "../style/colors";
import { TEXT_STYLE } from "../style/typography";

export const Onboarding = () => {
  const navigate = useNavigate();

  return (
    <Page>
      <WelcomeHeader>
        <Logo />
        <Welcome>
          <Highlight>마음씨</Highlight>에 오신 것을 환영해요.
        </Welcome>
      </WelcomeHeader>

      <IntroSection>
        <IllustrationArea>
          <Illustration src={onboardingImage} alt="마음씨 캐릭터" />
        </IllustrationArea>

        <Description>
          나만의 캐릭터를 키우며 감정을 돌보고,
          <br />
          작은 실천으로 마음의 변화를 만들어보세요.
        </Description>
      </IntroSection>

      <Actions>
        <Button
          variant="primary"
          size="medium"
          label="로그인"
          onClick={() => navigate("/login")}
        />
        <Button
          variant="outlined"
          size="medium"
          label="회원가입"
          onClick={() => navigate("/signup")}
        />
      </Actions>
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

const WelcomeHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0;
`;

const Welcome = styled.p`
  color: ${COLORS.gray.gray500};
  ${TEXT_STYLE.title.sm};
`;

const Highlight = styled.span`
  color: ${COLORS.main.main};
`;

const IntroSection = styled.section`
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.375rem;
  padding-top: 3.875rem;
`;

const IllustrationArea = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;

const Illustration = styled.img`
  width: 100%;
  max-width: 22.0625rem;
  height: auto;
  object-fit: contain;
`;

const Description = styled.p`
  text-align: center;
  color: ${COLORS.gray.gray400};
  ${TEXT_STYLE.body.sm};
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;
