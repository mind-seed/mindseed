import { MissionPicker } from "./mission-picker.common";

const FILTERED_DAYS = 3;

export const cooldownFilterMissionPicker: MissionPicker = (missions, count) => {
  const available = missions.filter(
    (m) => m.lastAssignedDay === null || m.lastAssignedDay > FILTERED_DAYS,
  );
  return [...available]
    .sort(() => Math.random() - 0.5)
    .slice(0, count)
    .map((m) => m.mission);
};
