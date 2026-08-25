import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";
import { styled } from "styled-components";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";
import { Picture } from "../Picture";
import { LikeButton } from "./LikeButton";
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
  onClick: () => void;
  onLikeClick: () => void;
};

export const Post = ({
  author,
  category,
  content,
  attachments,
  createdAt,
  isLiked,
  variant = "list",
  onClick,
  onLikeClick,
}: PostProps) => {
  const createdTime = dayjs(createdAt.epochMilliseconds).fromNow();
  return (
    <PostContainer
      $variant={variant}
      onClick={onClick}
      role={variant === "list" ? "button" : undefined}
      tabIndex={variant === "list" ? 0 : undefined}
      onKeyDown={(e) => {
        if (variant === "list" && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
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
    </PostContainer>
  );
};

const PostContainer = styled.article<{ $variant: PostVariant }>`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem 1.25rem;
  border-bottom: ${({ $variant }) =>
    $variant === "list" ? `1px solid ${COLORS.gray.gray200}` : "none"};
  background: ${COLORS.gray.gray0};
  user-select: none;
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
