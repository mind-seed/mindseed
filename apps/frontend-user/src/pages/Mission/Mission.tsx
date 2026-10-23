import { useEffect, useState } from "react";
import styled from "styled-components";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";
import { CheckIcon } from "../../components/Icons/CheckIcon";
import { TargetIcon } from "../../components/Icons/TargetIcon";
import { TrophyIcon } from "../../components/Icons/TrophyIcon";
import { LevelProgress } from "../../components/Mission/LevelProgress";
import { MissionCard } from "../../components/Mission/MissionCard";
import type { z } from "zod";
import {
  MissionAssignmentDtoSchema,
  UserProfileDtoSchema,
} from "@mindseed/api-types";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  completeMission,
  getCurrentUser,
  getTodayMissions,
} from "../../api/api";
import { useNavigate } from "react-router";
import { callAuthenticated } from "../../api/callAuthenticated";

type MissionAssignmentDto = z.infer<typeof MissionAssignmentDtoSchema>;
type UserProfileDto = z.infer<typeof UserProfileDtoSchema>;

type MissionSummary = {
  level: UserProfileDto["level"];
  progress: number;
  todayCount: number;
  completedCount: number;
  totalPoints: UserProfileDto["points"];
};

// eslint-disable-next-line react-refresh/only-export-components
export const pointsForNextLevel: Record<number, number> = {
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

export const Mission = () => {
  const navigate = useNavigate();

  const missionQuery = useQuery({
    queryKey: ["missions"],
    queryFn: () =>
      callAuthenticated((token) => getTodayMissions(token), navigate),
  });

  const missionSummarySet = (missionSummaryQueryData, missionQueryData) => {
    setMissionSummary({
      level: missionSummaryQueryData.profile.level,
      progress:
        (missionSummaryQueryData.profile.points /
          pointsForNextLevel[missionSummaryQueryData.profile?.level]) *
        100,
      todayCount: missionQueryData.assignments.length,
      completedCount: completedIds.length,
      totalPoints: missionSummaryQueryData.profile.points,
    });
  };

  const missionSummaryQuery = useQuery({
    queryKey: ["missionSummary"],
    queryFn: () =>
      callAuthenticated((token) => getCurrentUser(token), navigate),
  });

  const completeMutation = useMutation({
    mutationFn: (missionId: number) =>
      callAuthenticated((token) => completeMission(token, missionId), navigate),
  });

  const [completedIds, setCompletedIds] = useState<number[]>(
    missionQuery.data?.assignments
      .filter((mission) => mission.status === "completed")
      .map((mission) => mission.id) || [],
  );

  const [missionSummary, setMissionSummary] = useState({
    level: missionQuery.data?.level || 1,
    progress: 0,
    todayCount: missionQuery.data?.assignments.length || 0,
    completedCount: completedIds.length,
    totalPoints: missionQuery.data?.points || 0,
  });

  useEffect(() => {
    if (missionQuery.data) {
      setCompletedIds(
        missionQuery.data.assignments
          .filter((mission) => mission.status === "completed")
          .map((mission) => mission.id),
      );
    }
  }, [missionQuery.data]);

  useEffect(() => {
    if (missionQuery.data && missionSummaryQuery.data) {
      const data = missionSummaryQuery.data;
      if (data.profile) {
        console.log(completedIds);
        missionSummarySet(data, missionQuery.data);
      }
    }
  }, [missionQuery.data, missionSummaryQuery.data]);

  const missions = missionQuery.data?.assignments || [];
  return (
    <Page>
      <LevelProgress
        level={missionSummary.level}
        progress={missionSummary.progress}
      />

      <Summary aria-label="미션 현황">
        <SummaryItem>
          <SummaryLabel>오늘 미션</SummaryLabel>
          <SummaryValue>
            <TargetIcon color={COLORS.main.main} />
            <SummaryText>{missionSummary.todayCount}</SummaryText>
          </SummaryValue>
        </SummaryItem>
        <SummaryItem>
          <SummaryLabel>완료된 미션</SummaryLabel>
          <SummaryValue>
            <CheckIcon color={COLORS.main.main} />
            <SummaryText>{completedIds.length}</SummaryText>
          </SummaryValue>
        </SummaryItem>
        <SummaryItem>
          <SummaryLabel>전체 포인트</SummaryLabel>
          <SummaryValue>
            <TrophyIcon color={COLORS.main.main} />
            <SummaryText>{missionSummary.totalPoints}</SummaryText>
          </SummaryValue>
        </SummaryItem>
      </Summary>

      <MissionList>
        {missions.map((mission) => {
          const isCompleted = completedIds.includes(mission.id);
          return (
            <MissionCard
              key={mission.id}
              title={mission.mission.title}
              description={mission.mission.description}
              rewardPoints={mission.mission.points}
              isCompleted={isCompleted}
              onComplete={async () => {
                try {
                  await completeMutation.mutateAsync(mission.id);

                  setCompletedIds((prev) => [...prev, mission.id]);

                  const { data } = await missionSummaryQuery.refetch();

                  if (
                    data.isSuccess &&
                    data.data?.profile &&
                    missionQuery.data
                  ) {
                    missionSummarySet(data, missionQuery.data);
                  }
                } catch {
                  return;
                }
              }}
            />
          );
        })}
      </MissionList>
    </Page>
  );
};

const Page = styled.div`
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 1.25rem;
`;

const Summary = styled.section`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: center;
  padding: 1.375rem 0 0.75rem;

  div:not(:last-child) {
    border-width: 2.625rem;
    border-right: 1px solid ${COLORS.gray.gray300};
  }
`;

const SummaryItem = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.25rem;
`;

const SummaryLabel = styled.span`
  color: ${COLORS.gray.gray600};
  ${TEXT_STYLE.body.sm};
  white-space: nowrap;
`;

const SummaryValue = styled.div`
  display: flex;
  align-items: center;
  gap: 0.125rem;
`;

const SummaryText = styled.strong`
  margin-top: 1.5px;
  color: ${COLORS.main["main+"]};
  ${TEXT_STYLE.title.sm};
`;

const MissionList = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 0.625rem 0;
`;
