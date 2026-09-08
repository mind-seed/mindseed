import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";
import { styled } from "styled-components";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";
import { Picture } from "../Picture";
import { LikeButton } from "./LikeButton";
import { CheckIcon } from "../Icons/CheckIcon";
import type { z } from "zod";
import { PostDtoSchema } from "@mindseed/api-types";
import { getPostCategoryLabel } from "../../constants/postCategory";
dayjs.extend(relativeTime);
dayjs.locale("ko");

type PostDto = z.infer<typeof PostDtoSchema>;

type PostVariant = "list" | "detail";

export type PostProps = Pick<
  PostDto,
  "author" | "category" | "content" | "attachments" | "createdAt" | "isLiked"
> & {
  variant?: PostVariant;
  selectionMode?: boolean;
  selected?: boolean;
  onClick: () => void;
  onLikeClick: () => void;
  onSelectionClick?: () => void;
};

export const Post = ({
  author,
  category,
  content,
  attachments,
  createdAt,
  isLiked,
  variant = "list",
  selectionMode = false,
  selected = false,
  onClick,
  onLikeClick,
  onSelectionClick,
}: PostProps) => {
  const createdTime = dayjs(createdAt.epochMilliseconds).fromNow();
  return (
    <PostContainer
      $variant={variant}
      $selectionMode={selectionMode}
      onClick={selectionMode ? onSelectionClick : onClick}
      role={variant === "list" ? "button" : undefined}
      tabIndex={variant === "list" ? 0 : undefined}
      onKeyDown={(e) => {
        if (variant === "list" && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          if (selectionMode) onSelectionClick?.();
          else onClick();
        }
      }}
    >
      {selectionMode && (
        <SelectionButton
          type="button"
          $selected={selected}
          aria-label={selected ? "글 선택 해제" : "글 선택"}
          aria-pressed={selected}
          onClick={(event) => {
            event.stopPropagation();
            onSelectionClick?.();
          }}
        >
          {selected && <CheckIcon width={20} height={20} />}
        </SelectionButton>
      )}

      <PostContent>
        <Header>
          <Author>{author.nickname}</Author>
          <CreatedAt>{createdTime}</CreatedAt>
        </Header>

        <Body>
          <Content>{content}</Content>
          {attachments && attachments.length > 0 && (
            <Picture pictures={attachments} />
          )}
          <Footer>
            <Category>#{getPostCategoryLabel(category)}</Category>
            {variant === "list" && (
              <LikeArea onClick={(event) => event.stopPropagation()}>
                <LikeButton isLiked={isLiked} onClick={onLikeClick} />
              </LikeArea>
            )}
          </Footer>
        </Body>
      </PostContent>
    </PostContainer>
  );
};

const PostContainer = styled.article<{
  $variant: PostVariant;
  $selectionMode: boolean;
}>`
  width: 100%;
  display: flex;
  flex-direction: row;
  gap: ${({ $selectionMode }) => ($selectionMode ? "0.625rem" : "")};
  padding: 1.5rem 1.25rem;
  border-bottom: ${({ $variant }) =>
    $variant === "list" ? `1px solid ${COLORS.gray.gray200}` : "none"};
  background: ${COLORS.gray.gray0};
  user-select: none;
`;

const PostContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SelectionButton = styled.button<{ $selected: boolean }>`
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  border: 1px solid
    ${({ $selected }) => ($selected ? COLORS.main.main : COLORS.gray.gray300)};
  border-radius: 6px;
  background: ${({ $selected }) =>
    $selected ? COLORS.main.main : COLORS.gray.gray0};
  color: ${COLORS.gray.gray0};
  cursor: pointer;
`;

const Header = styled.header`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Author = styled.span`
  ${TEXT_STYLE.title.ti};
  color: ${COLORS.text.black};
`;

const CreatedAt = styled.time`
  ${TEXT_STYLE.body.sm};
  color: ${COLORS.gray.gray500};
`;

const Body = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Content = styled.p`
  ${TEXT_STYLE.body.sm};
  color: ${COLORS.text.black};
  white-space: pre-line;
  word-break: break-all;
  overflow-wrap: anywhere;
`;

const Footer = styled.footer`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Category = styled.span`
  ${TEXT_STYLE.body.sm};
  color: ${COLORS.gray.gray500};
`;

const LikeArea = styled.div`
  display: flex;
`;
