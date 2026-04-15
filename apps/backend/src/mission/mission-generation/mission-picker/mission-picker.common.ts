import { SimplifiedMission } from "../mission-generation.types";

export type MissionWithMetadata = {
  /**
   * MissionPicker 내부적으로는 black box 취급하는 property
   */
  mission: SimplifiedMission;
  /**
   * n >= 0
   * n일 전에 assign 되었음을 의미
   */
  lastAssignedDay: number | null;
};

/**
 * metadata 기반으로 mission을 pick 한다.
 * assumption: missions.length >= count
 */
export type MissionPicker = (
  missions: MissionWithMetadata[],
  count: number,
) => SimplifiedMission[];

export const MISSION_PICKER_TOKEN = Symbol("MISSION_PICKER");
