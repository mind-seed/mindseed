import { MissionPicker } from "./mission-picker.common";

const FILTERED_DAYS = 3;

export const cooldownFilterMissionPicker: MissionPicker = (missions, count) => {
  // assumption: available.length >= count
  // 현재는 미션 개수가 많다고 가정하기 때문에 잘 작동합니다.
  const available = missions.filter(
    (m) => m.lastAssignedDay === null || m.lastAssignedDay > FILTERED_DAYS,
  );
  return [...available]
    .sort(() => Math.random() - 0.5)
    .slice(0, count)
    .map((m) => m.mission);
};
