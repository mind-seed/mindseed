import TextareaAutosize from "react-textarea-autosize";
import { useEffect, useRef } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";
import { styled } from "styled-components";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";
import type { CommentDto } from "../../type/index";
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
          <MoreButton type="button" onClick={props.onMoreClick}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <mask
                id="mask0_2496_6541"
                style={{ maskType: "alpha" }}
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width="16"
                height="16"
              >
                <rect width="16" height="16" fill="#D9D9D9" />
              </mask>
              <g mask="url(#mask0_2496_6541)">
                <path
                  d="M4.00033 9.33329C3.63366 9.33329 3.31977 9.20274 3.05866 8.94163C2.79755 8.68052 2.66699 8.36663 2.66699 7.99996C2.66699 7.63329 2.79755 7.3194 3.05866 7.05829C3.31977 6.79718 3.63366 6.66663 4.00033 6.66663C4.36699 6.66663 4.68088 6.79718 4.94199 7.05829C5.2031 7.3194 5.33366 7.63329 5.33366 7.99996C5.33366 8.36663 5.2031 8.68052 4.94199 8.94163C4.68088 9.20274 4.36699 9.33329 4.00033 9.33329ZM8.00033 9.33329C7.63366 9.33329 7.31977 9.20274 7.05866 8.94163C6.79755 8.68052 6.66699 8.36663 6.66699 7.99996C6.66699 7.63329 6.79755 7.3194 7.05866 7.05829C7.31977 6.79718 7.63366 6.66663 8.00033 6.66663C8.36699 6.66663 8.68088 6.79718 8.94199 7.05829C9.2031 7.3194 9.33366 7.63329 9.33366 7.99996C9.33366 8.36663 9.2031 8.68052 8.94199 8.94163C8.68088 9.20274 8.36699 9.33329 8.00033 9.33329ZM12.0003 9.33329C11.6337 9.33329 11.3198 9.20274 11.0587 8.94163C10.7975 8.68052 10.667 8.36663 10.667 7.99996C10.667 7.63329 10.7975 7.3194 11.0587 7.05829C11.3198 6.79718 11.6337 6.66663 12.0003 6.66663C12.367 6.66663 12.6809 6.79718 12.942 7.05829C13.2031 7.3194 13.3337 7.63329 13.3337 7.99996C13.3337 8.36663 13.2031 8.68052 12.942 8.94163C12.6809 9.20274 12.367 9.33329 12.0003 9.33329Z"
                  fill="#919191"
                />
              </g>
            </svg>
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
      <Form action="submit" onSubmit={onSubmit}>
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
        <SubmitButton type="submit">{buttonText}</SubmitButton>
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
`;
