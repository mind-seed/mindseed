import each from "jest-each";
import type {
  LevelPointsEntry,
  PointsForNextLevel,
} from "./level-points-calculator.service";
import { LevelCalculatorService } from "./level-points-calculator.service";

const testPointsForNextLevel: PointsForNextLevel = {
  1: 100,
  2: 200,
  3: 200,
};

const calculator = new LevelCalculatorService(4, testPointsForNextLevel);

describe("LevelCalculatorService", () => {
  describe("addPoints", () => {
    each([
      ["레벨업 없음", { level: 1, points: 0 }, 50, { level: 1, points: 50 }],
      ["정확히 레벨업", { level: 1, points: 0 }, 100, { level: 2, points: 0 }],
      [
        "레벨업 후 잉여 포인트 존재",
        { level: 1, points: 0 },
        110,
        { level: 2, points: 10 },
      ],
      [
        "여러 번 정확히 레벨업",
        { level: 1, points: 0 },
        300,
        { level: 3, points: 0 },
      ],
      [
        "여러 번 레벨업 후 잉여 포인트 존재",
        { level: 1, points: 0 },
        310,
        { level: 3, points: 10 },
      ],
      [
        "최대 레벨 정확히 도달",
        { level: 3, points: 0 },
        200,
        { level: 4, points: 0 },
      ],
      [
        "최대 레벨 도달 후 잉여 포인트 제거",
        { level: 3, points: 0 },
        220,
        { level: 4, points: 0 },
      ],
      [
        "최대 레벨에서 포인트 증가 없음",
        { level: 4, points: 0 },
        20,
        { level: 4, points: 0 },
      ],
    ] as [
      string,
      LevelPointsEntry,
      number,
      LevelPointsEntry,
    ][]).test.concurrent("%s", (_desc, current, pointsAdded, expected) => {
      expect(calculator.addPoints(current, pointsAdded)).toEqual(expected);
    });
  });
});
