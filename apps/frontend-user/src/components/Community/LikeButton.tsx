import { styled } from "styled-components";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";
import { HeartFilledIcon, HeartOutlineIcon } from "../Icons/HeartIcon";

type LikeButtonProps = {
  isLiked: boolean;
  likeCount?: number;
  onClick: () => void;
};

export const LikeButton = ({
  isLiked,
  likeCount,
  onClick,
}: LikeButtonProps) => {
  const hasCount = likeCount !== undefined;
  return (
    <Wrapper>
      <Button
        type="button"
        onClick={onClick}
        aria-label={isLiked ? "좋아요 취소" : "좋아요"}
      >
        {isLiked ? (
          <HeartFilledIcon color={COLORS.main.main} />
        ) : (
          <HeartOutlineIcon color={COLORS.gray.gray700} />
        )}
      </Button>
      {hasCount && <CountText>{likeCount}</CountText>}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.125rem;
`;

const Button = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  background: none;
  cursor: pointer;
`;

const CountText = styled.span`
  ${TEXT_STYLE.body.sm}
  color: ${COLORS.gray.gray700}
`;
