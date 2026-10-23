/*
 * 외부 service에서 inject 하여, 실제 application 상에서 사용될
 * constants 정의
 */

import { PointsForNextLevel } from "./level-points-calculator.service";

export const MAX_LEVEL = 30;

export const pointsForNextLevel: PointsForNextLevel = {
  1: 100,
  2: 110,
  3: 130,
  4: 150,
  5: 170,
  6: 200,
  7: 230,
  8: 260,
  9: 290,
  10: 320,
  11: 350,
  12: 380,
  13: 410,
  14: 440,
  15: 470,
  16: 510,
  17: 550,
  18: 600,
  19: 650,
  20: 690,
  21: 730,
  22: 750,
  23: 750,
  24: 750,
  25: 760,
  26: 760,
  27: 760,
  28: 780,
  29: 800,
};
