import { useNavigate } from "react-router";
import { styled } from "styled-components";
import { Banner } from "../components/Community/Banner";
import { ChevronRightIcon } from "../components/Icons/ChevronIcon";
import { LevelProgress } from "../components/Mission/LevelProgress";
import { COLORS } from "../style/colors";
import { TEXT_STYLE } from "../style/typography";
import type { z } from "zod";
import {
  SimplifiedMissionSchema,
  UserProfileDtoSchema,
} from "@mindseed/api-types";

type SimplifiedMission = z.infer<typeof SimplifiedMissionSchema>;
type UserProfileDto = z.infer<typeof UserProfileDtoSchema>;

const USER_LEVEL: UserProfileDto["level"] = 4;
const TODAY_MISSION: SimplifiedMission = {
  title: "물 한잔 먹기",
  description: "물 한 잔을 마셔보세요.",
  points: 60,
};

export const Home = () => {
  const navigate = useNavigate();

  return (
    <Page>
      <TopContent>
        <LevelProgress level={USER_LEVEL} progress={78} />
        <Banner />
      </TopContent>

      <MissionArea>
        <MissionHeaderButton type="button" onClick={() => navigate("/mission")}>
          <MissionHeading>오늘의 미션 수행하기</MissionHeading>
          <ChevronRightIcon color={COLORS.gray.gray400} />
        </MissionHeaderButton>
        <TodayMission>
          <MissionTitle>{TODAY_MISSION.title}</MissionTitle>
          <Reward>+{TODAY_MISSION.points}point</Reward>
        </TodayMission>
      </MissionArea>
    </Page>
  );
};

const Page = styled.main`
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 1.25rem;
`;

const TopContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const MissionArea = styled.div`
  margin-top: auto;
  margin-bottom: 1rem;
`;

const MissionHeaderButton = styled.button`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem 1rem;
  border: none;
  background: none;
  color: ${COLORS.gray.gray400};
  cursor: pointer;
`;

const MissionHeading = styled.h2`
  color: ${COLORS.text.black};
  ${TEXT_STYLE.body.md2};
`;

const TodayMission = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border: 1px solid ${COLORS.gray.gray150};
  border-radius: 6px;
  background: ${COLORS.gray.gray100};
`;

const MissionTitle = styled.span`
  color: ${COLORS.gray.gray600};
  ${TEXT_STYLE.body.sm};
`;

const Reward = styled.span`
  color: ${COLORS.main["main+"]};
  ${TEXT_STYLE.body.ti};
`;
