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
import { callAuthenticated } from "../api/callAuthenticated";
import { getTodayMissions } from "../api/api";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

type UserProfileDto = z.infer<typeof UserProfileDtoSchema>;

const USER_LEVEL: UserProfileDto["level"] = 4;

export const Home = () => {
  const navigate = useNavigate();
  const missionQuery = useQuery({
    queryKey: ["missions"],
    queryFn: () =>
      callAuthenticated(
        (token) => getTodayMissions(token),
        navigate,
      ),
  });

  const todayMission = missionQuery.data?.assignments.find(
    (item) => item.status === "uncompleted"
  );

  const todayMissionTitle = todayMission?.mission.title ?? "";
  const todayMissionPoints = todayMission
    ? `+${todayMission.mission.points}point`
    : "";
  const todayMissionExists = todayMission
    ? true
    : false;

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
        {
        todayMissionExists && 
        <TodayMission>
          <MissionTitle>{todayMissionTitle}</MissionTitle>
          <Reward>+{todayMissionPoints}</Reward>
        </TodayMission>
        }
      </MissionArea>
    </Page>
  );
};

const Page = styled.div`
  width: 100%;
  height: 100%;
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
