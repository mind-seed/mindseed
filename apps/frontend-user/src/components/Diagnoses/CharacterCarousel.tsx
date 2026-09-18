import { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";
import { CHARACTERS } from "../../constants/character";

export type CharacterCarouselProps = {
  onSelect: (characterId: number) => void;
};

const CARD_SIZE = 13.4375;
const ACTIVE_SCALE = 18.75 / 13.4375;
const VISIBLE_GAP = 1;
const COMPUTED_GAP = VISIBLE_GAP + 2.66;
const CHARACTER_LIST = Object.values(CHARACTERS);

export const CharacterCarousel = ({ onSelect }: CharacterCarouselProps) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    onSelect(CHARACTER_LIST[activeIndex].id);
  }, [activeIndex, onSelect]);

  const handleScroll = useCallback(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;

    const center = carousel.scrollLeft + carousel.clientWidth / 2;

    let closestIndex = 0;
    let minDistance = Number.POSITIVE_INFINITY;

    itemRefs.current.forEach((item, index) => {
      if (!item) return;
      const itemCenter = item.offsetLeft + item.offsetWidth / 2;
      const distance = Math.abs(center - itemCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== activeIndex) {
      setActiveIndex(closestIndex);
    }
  }, [activeIndex]);

  const handleItemClick = (index: number) => {
    const item = itemRefs.current[index];
    if (!item) return;

    setActiveIndex(index);
    item.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  return (
    <Wrapper>
      <Carousel ref={carouselRef} onScroll={handleScroll}>
        {CHARACTER_LIST.map((character, index) => (
          <Item
            key={character.id}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
          >
            <CharacterButton
              type="button"
              $isActive={activeIndex === index}
              aria-pressed={activeIndex === index}
              aria-label={`${character.label} 선택`}
              onClick={() => handleItemClick(index)}
            >
              <CharacterImage src={character.images.seed} alt="" />
            </CharacterButton>
          </Item>
        ))}
      </Carousel>

      <CharacterLabel>{CHARACTER_LIST[activeIndex].label}</CharacterLabel>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: calc(100% + 2.5rem);
  margin-left: -1.25rem;
  overflow: hidden;
`;

const Carousel = styled.div`
  width: 100%;
  height: 18.75rem;
  display: flex;
  align-items: center;
  gap: ${COMPUTED_GAP}rem;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;

  padding-left: calc(50% - ${CARD_SIZE / 2}rem);
  padding-right: calc(50% - ${CARD_SIZE / 2}rem);

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Item = styled.div`
  flex: 0 0 ${CARD_SIZE}rem;
  width: ${CARD_SIZE}rem;
  height: ${CARD_SIZE}rem;

  display: flex;
  justify-content: center;
  align-items: center;

  scroll-snap-align: center;
  scroll-snap-stop: always;
`;

const CharacterButton = styled.button<{ $isActive: boolean }>`
  position: relative;
  z-index: ${({ $isActive }) => ($isActive ? 2 : 1)};
  width: 100%;
  height: 100%;

  border: none;
  border-radius: 12px;
  background: transparent;
  padding: 0;
  cursor: pointer;

  transform: ${({ $isActive }) =>
    $isActive ? `scale(${ACTIVE_SCALE})` : "scale(1)"};
  transition: transform 200ms ease;

  &:focus-visible {
    outline: none;
  }
`;

const CharacterImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
`;

const CharacterLabel = styled.p`
  margin-top: 1.75rem;
  text-align: center;
  color: ${COLORS.main["main+"]};
  ${TEXT_STYLE.title.ti};
`;
