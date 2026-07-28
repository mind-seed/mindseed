import { styled } from "styled-components";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";
import { CommentIcon } from "../Icons/CommentIcon";

type CommentButtonProps = {
  count: number;
  onClick: () => void;
};

export const CommentButton = ({ count, onClick }: CommentButtonProps) => {
  return (
    <Wrapper>
      <Button type="button" onClick={onClick} aria-label="댓글 작성">
        <CommentIcon />
      </Button>
      <CountText>{count}</CountText>
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
