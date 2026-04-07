import { Inject, Injectable } from "@nestjs/common";

export type PointsForNextLevel = Record<number, number>;

export type LevelPointsEntry = {
  level: number;
  points: number;
};

export const MAX_LEVEL_TOKEN = "LEVEL_CALCULATOR_MAX_LEVEL";
export const POINTS_FOR_NEXT_LEVEL_TOKEN =
  "LEVEL_CALCULATOR_POINTS_FOR_NEXT_LEVEL";

@Injectable()
export class LevelCalculatorService {
  constructor(
    @Inject(MAX_LEVEL_TOKEN) private readonly maxLevel: number,
    @Inject(POINTS_FOR_NEXT_LEVEL_TOKEN)
    private readonly pointsForNextLevel: PointsForNextLevel,
  ) {}

  addPoints(current: LevelPointsEntry, pointsAdded: number): LevelPointsEntry {
    if (current.level >= this.maxLevel) {
      return { level: this.maxLevel, points: 0 };
    }

    let { level, points } = current;
    points += pointsAdded;

    while (level < this.maxLevel) {
      const threshold = this.pointsForNextLevel[level];
      if (points < threshold) break;
      points -= threshold;
      level++;
    }

    if (level >= this.maxLevel) {
      return { level: this.maxLevel, points: 0 };
    }

    return { level, points };
  }
}
