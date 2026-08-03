import { styled } from "styled-components";
import { COLORS } from "../style/colors";
import { TEXT_STYLE } from "../style/typography";
import { ChevronLeftIcon } from "./Icons/ChevronLeftIcon";
import { MoreHorizontalIcon } from "./Icons/MoreHorizontalIcon";

type TopBarProps = {
  title?: string;
  rightType?: "text" | "icon";
  rightText?: string;
  rightDisabled?: boolean;
  onBackClick?: () => void;
  onRightClick?: () => void;
};

export const TopBar = ({
  title,
  rightType,
  rightText,
  rightDisabled = false,
  onBackClick,
  onRightClick,
}: TopBarProps) => (
  <Container>
    <LeftArea>
      <BackButton type="button" onClick={onBackClick} aria-label="뒤로 가기">
        <ChevronLeftIcon />
      </BackButton>
    </LeftArea>
    <CenterArea>{title && <Title>{title}</Title>}</CenterArea>
    <RightArea>
      {rightType === "icon" && onRightClick && (
        <RightButton
          type="button"
          disabled={rightDisabled}
          onClick={onRightClick}
          aria-label="더보기"
        >
          <MoreHorizontalIcon color={COLORS.text.black} />
        </RightButton>
      )}
      {rightType === "text" && rightText && (
        <RightButton
          type="button"
          disabled={rightDisabled}
          onClick={onRightClick}
        >
          {rightText}
        </RightButton>
      )}
    </RightArea>
  </Container>
);

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
  margin-top: 3px;
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
  &:disabled {
    color: ${COLORS.gray.gray400};
    cursor: default;
    opacity: 0.5;
  }
`;
