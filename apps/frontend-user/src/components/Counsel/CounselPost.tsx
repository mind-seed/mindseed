import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";
import { styled } from "styled-components";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";
import type { z } from "zod";
import { CounselDtoSchema } from "@mindseed/api-types";
import { getResourceCategoryLabel } from "../../constants/resourceCategory";
dayjs.extend(relativeTime);
dayjs.locale("ko");

type CounselDto = z.infer<typeof CounselDtoSchema>;

type CounselPostProps = Pick<
  CounselDto,
  "title" | "content" | "category" | "createdAt"
>;

export const CounselPost = ({
  title,
  content,
  category,
  createdAt,
}: CounselPostProps) => {
  const createdTime = dayjs(createdAt.epochMilliseconds).fromNow();
  return (
    <PostContainer>
      <Header>
        <Title>{title}</Title>
        <CreatedAt>{createdTime}</CreatedAt>
      </Header>

      <Body>
        <Content>{content}</Content>
        <Footer>
          <Category>#{getResourceCategoryLabel(category)}</Category>
        </Footer>
      </Body>
    </PostContainer>
  );
};

const PostContainer = styled.article`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem 1.25rem;
  border-bottom: 1px solid ${COLORS.gray.gray200};
  background: ${COLORS.gray.gray0};
  user-select: none;
`;

const Header = styled.header`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.span`
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
