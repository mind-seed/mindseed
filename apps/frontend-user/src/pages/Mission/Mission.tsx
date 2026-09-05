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
import { completeMission, getTodayMissions } from "../../api/api";
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

const MISSIONS: MissionAssignmentDto[] = [
  {
    id: 1,
    status: "completed",
    mission: {
      title: "미션 제목",
      description:
        "상세글을 적습니다. 글 제한은 없습니다.\n길어지는 만큼 카드가 늘어납니다.",
      points: 80,
    },
  },
  {
    id: 2,
    status: "uncompleted",
    mission: {
      title: "미션 제목",
      description: "상세글을 적습니다.",
      points: 80,
    },
  },
  {
    id: 3,
    status: "uncompleted",
    mission: {
      title: "미션 제목",
      description: "상세글을 적습니다.",
      points: 80,
    },
  },
  {
    id: 4,
    status: "uncompleted",
    mission: {
      title: "미션 제목",
      description: "상세글을 적습니다.",
      points: 80,
    },
  },
];

export const Mission = () => {
  const navigate = useNavigate();
  
  const missionQuery = useQuery({
    queryKey: ["missions"],
    queryFn: () =>
      callAuthenticated(
        (token) => getTodayMissions(token),
        navigate,
      ),
  })

  const completeMutation = useMutation({
    mutationFn: (missionId: number) =>
      callAuthenticated((token) => completeMission(token, missionId), navigate),
  });


  const [completedIds, setCompletedIds] = useState<number[]>(
    missionQuery.data?.assignments.filter((mission) => mission.status === "completed").map(
      (mission) => mission.id,
    ) || [],
  );

  const missionSummary = {
    level: missionQuery.data?.level || 1,
    progress: 0,
    todayCount: missionQuery.data?.assignments.length || 0,
    completedCount: completedIds.length,
    totalPoints: missionQuery.data?.points || 0,
  };

  useEffect(() => {
    if (missionQuery.data) {
      setCompletedIds(
        missionQuery.data.assignments
          .filter((mission) => mission.status === "completed")
          .map((mission) => mission.id),
      );
    }
  }, [missionQuery.data]);

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
              onComplete={() => {
                  completeMutation.mutate(mission.id);
                  setCompletedIds((prev) => [...prev, mission.id]);
                }
              }
            />
          );
        })}
      </MissionList>
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

const Divider = styled.span`
  width: 1px;
  height: 2.625rem;
  background: ${COLORS.gray.gray300};
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
