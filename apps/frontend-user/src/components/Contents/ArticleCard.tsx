import { styled } from "styled-components";
import type { z } from "zod";
import { ResourceDtoSchema } from "@mindseed/api-types";
import { ExternalLinkIcon } from "../Icons/ExternalLinkIcon";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";
import { getResourceCategoryLabel } from "../../constants/resourceCategory";

type ResourceDto = z.infer<typeof ResourceDtoSchema>;
type ArticleCardProps = Pick<ResourceDto, "title" | "category" | "url"> & {
  description: string;
  thumbnailUrl?: string;
};

export const ArticleCard = ({
  title,
  description,
  category,
  url,
  thumbnailUrl,
}: ArticleCardProps) => (
  <ArticleLink href={url} target="_blank" rel="noreferrer">
    <ThumbnailContainer>
      {thumbnailUrl && <Thumbnail src={thumbnailUrl} alt={title} />}
    </ThumbnailContainer>
    <ContentArea>
      <TitleContainer>
        <Title>{title}</Title>
        <ExternalLinkIcon
          color={COLORS.gray.gray200}
          style={{ flexShrink: 0 }}
          aria-hidden="true"
        />
      </TitleContainer>
      <Description>{description}</Description>
      <Category># {getResourceCategoryLabel(category)}</Category>
    </ContentArea>
  </ArticleLink>
);

const ArticleLink = styled.article.attrs({ as: "a" })`
  display: flex;
  gap: 1rem;
  text-decoration: none;
`;

const ThumbnailContainer = styled.div`
  width: 5.75rem;
  height: 5.75rem;
  flex-shrink: 0;
  background: #b5b5b5;
  overflow: hidden;
`;

const Thumbnail = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ContentArea = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 3px;
`;

const Title = styled.h3`
  color: ${COLORS.text.black};
  ${TEXT_STYLE.title.ti};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Description = styled.p`
  display: -webkit-box;
  color: ${COLORS.gray.gray600};
  ${TEXT_STYLE.body.sm};
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Category = styled.span`
  margin-top: auto;
  color: ${COLORS.gray.gray600};
  ${TEXT_STYLE.body.sm}
`;
