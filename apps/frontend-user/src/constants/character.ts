import charSeed0 from "../assets/char0-seed.webp";
import charSeed1 from "../assets/char1-seed.webp";
import charSeed2 from "../assets/char2-seed.webp";
import charSeed3 from "../assets/char3-seed.webp";
import charCounsel0 from "../assets/char0-counsel.webp";
import charCounsel1 from "../assets/char1-counsel.webp";
import charCounsel2 from "../assets/char2-counsel.webp";
import charCounsel3 from "../assets/char3-counsel.webp";

export type CharacterAssetId = "char1" | "char2" | "char3" | "char4";
export type CharacterAction =
  | "default"
  | "blinking"
  | "excited"
  | "looking"
  | "hello"
  | "curious"
  | "whoa"
  | "yawn";

export type CharacterAnimations = {
  assetId: CharacterAssetId;
  default: { idle: CharacterAction; blinking: CharacterAction };
  interaction: readonly CharacterAction[];
};

type Character = {
  id: number;
  label: string;
  images: { seed: string; counsel: string };
  animations: CharacterAnimations;
};

export const CHARACTERS = {
  0: {
    id: 0,
    label: "활기찬 새싹이",
    images: { seed: charSeed0, counsel: charCounsel0 },
    animations: {
      assetId: "char1",
      default: { idle: "default", blinking: "blinking" },
      interaction: ["excited", "looking"],
    },
  },
  1: {
    id: 1,
    label: "생각이 많은 양양이",
    images: { seed: charSeed1, counsel: charCounsel1 },
    animations: {
      assetId: "char2",
      default: { idle: "default", blinking: "blinking" },
      interaction: ["excited", "hello"],
    },
  },
  2: {
    id: 2,
    label: "감성적인 강냥이",
    images: { seed: charSeed2, counsel: charCounsel2 },
    animations: {
      assetId: "char3",
      default: { idle: "default", blinking: "blinking" },
      interaction: ["excited", "curious"],
    },
  },
  3: {
    id: 3,
    label: "계획적인 마음이",
    images: {
      seed: charSeed3,
      counsel: charCounsel3,
    },
    animations: {
      assetId: "char4",
      default: { idle: "default", blinking: "blinking" },
      interaction: ["whoa", "yawn"],
    },
  },
} satisfies Record<number, Character>;

export const getCharacter = (id: number): Character | undefined => {
  return Object.hasOwn(CHARACTERS, id)
    ? CHARACTERS[id as keyof typeof CHARACTERS]
    : undefined;
};

export const getCharacterImages = (id: number) => getCharacter(id)?.images;

export const getCharacterAnimations = (id: number) =>
  getCharacter(id)?.animations;
