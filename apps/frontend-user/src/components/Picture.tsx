import { styled, css } from "styled-components";
import { useState } from "react";
import { COLORS } from "../style/colors";
import type { PictureDto } from "../type/index";

type PictureProps = {
  pictures: PictureDto[];
};

export const Picture = ({ pictures }: PictureProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!pictures || pictures.length === 0) {
    return null;
  }

  const safeIndex = Math.min(currentIndex, pictures.length - 1);

  const handlePrev = () => {
    setCurrentIndex(safeIndex === 0 ? pictures.length - 1 : safeIndex - 1);
  };

  const handleNext = () => {
    setCurrentIndex(safeIndex === pictures.length - 1 ? 0 : safeIndex + 1);
  };

  const handleClick = (index: number) => {
    setCurrentIndex(index);
  };
  return (
    <PictureWrapper $currentUrl={pictures[safeIndex].url}>
      <Pagination>
        <ArrowButton type="button" onClick={handlePrev}>
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </ArrowButton>
        <DotWrapper>
          {pictures.map((picture, index) => (
            <DotButton
              type="button"
              key={picture.id}
              $isActive={safeIndex === index}
              onClick={() => handleClick(index)}
            ></DotButton>
          ))}
        </DotWrapper>
        <ArrowButton type="button" onClick={handleNext}>
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
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

const PictureWrapper = styled.div<{ $currentUrl: string }>`
  width: 100%;
  display: flex;
  align-items: flex-end;
  aspect-ratio: 1 / 1;
  border: 2px solid ${COLORS.gray.gray200};
  border-radius: 6px;
  background:
    linear-gradient(
      180deg,
      rgba(248, 248, 248, 0) 50%,
      rgba(0, 0, 0, 0.15) 100%
    ),
    url(${(props) => props.$currentUrl}) no-repeat center / cover;
`;

const Pagination = styled.div`
  width: 100%;
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
