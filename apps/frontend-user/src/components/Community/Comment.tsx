import TextareaAutosize from "react-textarea-autosize";
import { useEffect, useRef } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";
import { styled } from "styled-components";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";
import type { CommentDto } from "../../type/index";
import { MoreHorizontalIcon } from "../Icons/MoreHorizontalIcon";
dayjs.extend(relativeTime);
dayjs.locale("ko");

export type CommentProps = {
  comment: CommentDto;
} & (
  | { variant: "user"; onMoreClick: () => void }
  | { variant: "author"; onEditClick: () => void; onDeleteClick: () => void }
  | { variant: "admin"; onDeleteClick: () => void }
);

const getCommentMeta = (comment: CommentDto) => {
  switch (comment.type) {
    case "active":
      return {
        author: comment.author.nickname,
        authorColor: COLORS.text.black,
        content: comment.content,
      };
    case "authorDeleted":
      return {
        author: "탈퇴한 사용자",
        authorColor: COLORS.gray.gray400,
        content: comment.content,
      };
    case "deleted":
    default:
      return {
        author: "삭제된 댓글",
        authorColor: COLORS.gray.gray400,
        content: "삭제된 댓글입니다.",
      };
  }
};

type CommentInputProps = {
  value: string;
  buttonText: string;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  onFocus?: () => void;
  autoFocus?: boolean;
};

export const Comment = (props: CommentProps) => {
  const { comment } = props;
  const { author, authorColor, content } = getCommentMeta(comment);
  const displayTime = dayjs(comment.createdAt.epochMilliseconds).fromNow();

  return (
    <Wrapper>
      <Header>
        <Meta>
          <Author style={{ color: authorColor }}>{author}</Author>
          <svg
            width="4"
            height="4"
            viewBox="0 0 4 4"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="2" cy="2" r="2" fill={COLORS.gray.gray500} />
          </svg>
          <Time>{displayTime}</Time>
        </Meta>

        {comment.type === "active" && props.variant === "user" && (
          <MoreButton
            type="button"
            onClick={props.onMoreClick}
            aria-label="댓글 더보기"
          >
            <MoreHorizontalIcon
              width="16"
              height="16"
              color={COLORS.gray.gray500}
            />
          </MoreButton>
        )}

        {comment.type === "active" && props.variant === "author" && (
          <Actions>
            <ActionButton type="button" onClick={props.onEditClick}>
              수정
            </ActionButton>
            <ActionButton type="button" $danger onClick={props.onDeleteClick}>
              삭제
            </ActionButton>
          </Actions>
        )}

        {comment.type === "active" && props.variant === "admin" && (
          <Actions>
            <ActionButton type="button" $danger onClick={props.onDeleteClick}>
              삭제
            </ActionButton>
          </Actions>
        )}
      </Header>
      <Body>
        <Arrow
          viewBox="0 0 24 49"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 25.7321C1.66667 24.9623 1.66667 23.0377 3 22.2679L15 15.3397C16.3333 14.5699 18 15.5322 18 17.0718V30.9282C18 32.4678 16.3333 33.4301 15 32.6603L3 25.7321Z"
            fill={COLORS.gray.gray150}
          />
        </Arrow>
        <Content>{content}</Content>
      </Body>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding: 0.75rem 1.25rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 1rem;
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4375rem;
`;

const Author = styled.span`
  color: ${COLORS.text.black};
  ${TEXT_STYLE.body.sm};
`;

const Time = styled.span`
  color: ${COLORS.gray.gray500};
  ${TEXT_STYLE.body.ti};
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ActionButton = styled.button<{ $danger?: boolean }>`
  padding: 0;
  border: none;
  background: none;
  color: ${({ $danger }) =>
    $danger ? COLORS.state.error : COLORS.gray.gray500};
  ${TEXT_STYLE.body.ti};
  cursor: pointer;
`;

const MoreButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.1875rem;
  border: none;
  background: none;
  cursor: pointer;

  span {
    width: 0.1875rem;
    height: 0.1875rem;
    border-radius: 50%;
    background: ${COLORS.gray.gray500};
  }
`;

const Body = styled.div`
  display: flex;
`;

const Content = styled.div`
  width: 100%;
  margin-left: -8px;
  padding: 1rem;
  border-radius: 12px;
  background: ${COLORS.gray.gray150};
  color: ${COLORS.text.black};
  ${TEXT_STYLE.body.ti};
  overflow-wrap: break-word;
`;

const Arrow = styled.svg`
  flex-shrink: 0;
  width: 1.5rem;
  height: 3.0625rem;
`;

export const CommentInput = ({
  value,
  buttonText,
  disabled = false,
  onChange,
  onSubmit,
  onFocus,
  autoFocus,
}: CommentInputProps) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!autoFocus || !textAreaRef.current) return;

    const textArea = textAreaRef.current;
    textArea.focus();
    textArea.setSelectionRange(textArea.value.length, textArea.value.length);
  }, [autoFocus]);

  return (
    <InputWrapper>
      <Form onSubmit={onSubmit}>
        <TextArea
          ref={textAreaRef}
          value={value}
          placeholder="댓글을 입력하세요."
          minRows={1}
          wrap="soft"
          onChange={onChange}
          onFocus={onFocus}
          autoFocus={autoFocus}
        ></TextArea>
        <SubmitButton type="submit" disabled={disabled}>
          {buttonText}
        </SubmitButton>
      </Form>
    </InputWrapper>
  );
};

const InputWrapper = styled.div`
  width: 100%;
  padding: 1rem;
  border: 1px solid ${COLORS.gray.gray200};
  border-radius: 12px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  gap: 0.625rem;
`;

const TextArea = styled(TextareaAutosize)`
  width: 100%;
  border: none;
  outline: none;
  color: ${COLORS.text.black};
  ${TEXT_STYLE.body.ti};
  word-break: break-all;
  resize: none;

  &::placeholder {
    color: ${COLORS.gray.gray600};
  }
`;

const SubmitButton = styled.button`
  border: none;
  background: none;
  color: ${COLORS.main["main+"]};
  ${TEXT_STYLE.title.ti};
  cursor: pointer;

  &:disabled {
    color: ${COLORS.gray.gray400};
    cursor: default;
  }
`;
