import { styled, css } from "styled-components";
import { useState } from "react";
import { COLORS } from "../style/colors";
import type { z } from "zod";
import { AttachmentDtoSchema } from "@mindseed/api-types";
import { ChevronLeftIcon } from "./Icons/ChevronIcon";
import { ChevronRightIcon } from "./Icons/ChevronIcon";

type PictureDto = z.infer<typeof AttachmentDtoSchema>;

type PictureProps = {
  pictures: PictureDto[];
};

export const Picture = ({ pictures }: PictureProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!pictures || pictures.length === 0) {
    return null;
  }

  const safeIndex = Math.min(currentIndex, pictures.length - 1);

  const handlePrev = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setCurrentIndex(safeIndex === 0 ? pictures.length - 1 : safeIndex - 1);
  };

  const handleNext = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setCurrentIndex(safeIndex === pictures.length - 1 ? 0 : safeIndex + 1);
  };

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement>,
    index: number,
  ) => {
    event.stopPropagation();
    setCurrentIndex(index);
  };
  return (
    <PictureWrapper>
      <MainImage
        src={pictures[safeIndex].url}
        alt={`첨부 이미지 ${safeIndex + 1} / ${pictures.length}`}
        draggable={false}
      />
      <Pagination>
        <ArrowButton
          type="button"
          onClick={handlePrev}
          aria-label="이전 이미지"
        >
          <ChevronLeftIcon width="100%" height="100%" />
        </ArrowButton>
        <DotWrapper>
          {pictures.map((picture, index) => (
            <DotButton
              type="button"
              key={picture.id}
              $isActive={safeIndex === index}
              aria-label={`${index + 1}번째 이미지 보기`}
              aria-current={safeIndex === index ? "true" : undefined}
              onClick={(event) => handleClick(event, index)}
            ></DotButton>
          ))}
        </DotWrapper>
        <ArrowButton
          type="button"
          onClick={handleNext}
          aria-label="다음 이미지"
        >
          <ChevronRightIcon width="100%" height="100%" />
        </ArrowButton>
      </Pagination>
    </PictureWrapper>
  );
};

export const PictureList = ({ pictures }: PictureProps) => {
  if (!pictures || pictures.length === 0) {
    return null;
  }

  return (
    <PictureListContainer>
      {pictures.map((picture) => (
        <ThumbnailImage key={picture.id} src={picture.url} alt="" />
      ))}
    </PictureListContainer>
  );
};

const PictureWrapper = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: flex-end;
  aspect-ratio: 1 / 1;
  border: 2px solid ${COLORS.gray.gray200};
  border-radius: 6px;
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(
      180deg,
      rgba(248, 248, 248, 0) 50%,
      rgba(0, 0, 0, 0.15) 100%
    );
  }
`;

const MainImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Pagination = styled.div`
  position: absolute;
  inset: auto 0 0;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1rem;
`;

const DotWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.25rem;
`;

const DotButton = styled.button<{ $isActive: boolean }>`
  height: 0.5rem;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  ${({ $isActive }) =>
    $isActive
      ? css`
          width: 1.125rem;
          background: ${COLORS.gray.gray0};
        `
      : css`
          width: 0.5rem;
          background: ${COLORS.gray.gray0};
          opacity: 60%;
        `}
`;

const ArrowButton = styled.button`
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  background: none;
  color: ${COLORS.gray.gray0};
  cursor: pointer;
`;

const PictureListContainer = styled.div`
  width: 100%;
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const ThumbnailImage = styled.img`
  width: 200px;
  aspect-ratio: 1 / 1;
  flex-shrink: 0;
  border-radius: 6px;
  object-fit: cover;
`;
