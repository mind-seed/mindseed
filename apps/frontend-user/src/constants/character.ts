import charSeed1 from "../assets/char1-seed.png";
import charSeed2 from "../assets/char2-seed.png";
import charSeed3 from "../assets/char3-seed.png";
import charSeed4 from "../assets/char4-seed.png";
import charCounsel1 from "../assets/char1-counsel.png";
import charCounsel2 from "../assets/char2-counsel.png";
import charCounsel3 from "../assets/char3-counsel.png";
import charCounsel4 from "../assets/char4-counsel.png";

type Character = {
  id: number;
  label: string;
  images: { seed: string; counsel: string };
};

export const CHARACTERS: Record<number, Character> = {
  1: {
    id: 1,
    label: "포근하고 다정한 토닥씨앗",
    images: { seed: charSeed1, counsel: charCounsel1 },
  },
  2: {
    id: 2,
    label: "차분하고 조용한 차곡씨앗",
    images: { seed: charSeed2, counsel: charCounsel2 },
  },
  3: {
    id: 3,
    label: "호기심 많고 엉뚱한 궁금씨앗",
    images: { seed: charSeed3, counsel: charCounsel3 },
  },
  4: {
    id: 4,
    label: "똑똑하고 꼼꼼한 척척씨앗",
    images: {
      seed: charSeed4,
      counsel: charCounsel4,
    },
  },
};

export const getChracter = (id: number) => {
  return CHARACTERS[id];
};

export const getCharcterImages = (id: number) => {
  return CHARACTERS[id].images;
};
