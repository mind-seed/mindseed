import { styled, css } from "styled-components";
import { useState } from "react";
import { COLORS } from "../style/colors";

type PictureProps = {
  urls: string[];
};

export const Picture = ({ urls }: PictureProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!urls || urls.length === 0) {
    return null;
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? urls.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === urls.length - 1 ? 0 : prev + 1));
  };

  const handleClick = (index: number) => {
    setCurrentIndex(index);
  };
  return (
    <PictureWrapper $currentUrl={urls[currentIndex]}>
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
          {urls.map((_, index) => (
            <DotButton
              type="button"
              key={index}
              $isActive={currentIndex === index}
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

const PictureWrapper = styled.div<{ $currentUrl: string }>`
  width: 353px;
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
