import { type MissionPicker } from "./mission-picker.common";

const MAX_WEIGHT = 7;

export const weightedMissionPicker: MissionPicker = (missions, count) => {
  const keyed = missions.map(({ mission, lastAssignedDay }) => {
    const weight = Math.min(MAX_WEIGHT, lastAssignedDay ?? 1);

    // Gumbel-max trick
    const key = -Math.log(Math.random()) / weight;
    return { mission, key };
  });

  keyed.sort((a, b) => b.key - a.key);

  return keyed.slice(0, count).map((k) => k.mission);
};
