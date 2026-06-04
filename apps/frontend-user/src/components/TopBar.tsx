import { styled } from "styled-components";
import { COLORS } from "../style/colors";
import { TEXT_STYLE } from "../style/typography";

type TopBarProps = {
  title?: string;
  buttonText?: string;
  onBackClick?: () => void;
  onRightClick?: () => void;
};

export const TopBar = ({
  title,
  buttonText,
  onBackClick,
  onRightClick,
}: TopBarProps) => {
  return (
    <Container>
      <LeftArea>
        <BackButton type="button" onClick={onBackClick}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="black"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </BackButton>
      </LeftArea>
      <CenterArea> {title && <Title>{title}</Title>}</CenterArea>
      <RightArea>
        {buttonText && (
          <RightButton type="button" onClick={onRightClick}>
            {buttonText}
          </RightButton>
        )}
      </RightArea>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.25rem;
`;

const LeftArea = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-start;
`;

const CenterArea = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
`;

const RightArea = styled.div`
  flex: 1;
  display: flex;
  justify-content: flex-end;
`;

const BackButton = styled.button`
  border: none;
  background: none;
  cursor: pointer;
`;

const Title = styled.span`
  ${TEXT_STYLE.body.md2};
  user-select: none;
`;

const RightButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  background: none;
  ${TEXT_STYLE.title.ti};
  color: ${COLORS.main["main+"]};
  line-height: 1;
  user-select: none;
  cursor: pointer;
`;
