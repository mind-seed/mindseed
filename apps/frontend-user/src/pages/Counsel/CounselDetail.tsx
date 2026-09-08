import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { styled } from "styled-components";
import { TopBar } from "../../components/TopBar";
import { CounselPost } from "../../components/Counsel/CounselPost";
import { CounselResponse } from "../../components/Counsel/CounselResponse";
import { BottomSheet } from "../../components/Community/BottomSheet";
import { DeleteModal } from "../../components/Community/DeleteModal";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";
import type { z } from "zod";
import { CounselDtoSchema, CounselErrorCode } from "@mindseed/api-types";
import { ApiError, getCounsel, deleteCounsel } from "../../api/api";
import { callAuthenticated } from "../../api/callAuthenticated";

function getCounselError(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.errorCode) {
      case CounselErrorCode.COUNSEL_NOT_FOUND:
        return "상담 글을 찾을 수 없습니다.";
      case CounselErrorCode.NOT_COUNSEL_AUTHOR:
        return "조회 권한이 없습니다.";
    }
  }
  return "상담 글을 불러오지 못했습니다.";
}

function getDeleteError(error: Error | null): string | null {
  if (error === null) return null;
  if (error instanceof ApiError) {
    switch (error.errorCode) {
      case CounselErrorCode.NOT_COUNSEL_AUTHOR:
        return "삭제 권한이 없습니다.";
      case CounselErrorCode.COUNSEL_NOT_FOUND:
        return "상담 글을 찾을 수 없습니다.";
    }
  }
  return "삭제 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
}

type CounselDto = z.infer<typeof CounselDtoSchema>;

export const CounselDetail = () => {
  const { counselId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const counselQuery = useQuery({
    queryKey: ["counsels", Number(counselId)],
    queryFn: ({ signal }) =>
      callAuthenticated(
        (token) => getCounsel(token, Number(counselId), { signal }),
        navigate,
      ),
    enabled: !!counselId,
  });

  const deleteCounselMutation = useMutation({
    mutationFn: () =>
      callAuthenticated(
        (token) => deleteCounsel(token, Number(counselId)),
        navigate,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["counsels"] });
      navigate("/counsel", { replace: true });
    },
  });

  if (counselQuery.isLoading) return null;
  if (counselQuery.isError)
    return (
      <Page>
        <TopBar onBackClick={() => navigate(-1)} />
        <NotFound>{getCounselError(counselQuery.error)}</NotFound>
      </Page>
    );

  return (
    <CounselDetailContent
      key={counselId}
      counsel={counselQuery.data!}
      deleteError={getDeleteError(deleteCounselMutation.error)}
      onDeleteConfirm={() => deleteCounselMutation.mutate()}
    />
  );
};

const CounselDetailContent = ({
  counsel,
  deleteError,
  onDeleteConfirm,
}: {
  counsel: CounselDto;
  deleteError: string | null;
  onDeleteConfirm: () => void;
}) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <Page>
      <TopBar
        rightType="icon"
        onBackClick={() => navigate(-1)}
        onRightClick={() => setIsMenuOpen(true)}
      />
      <CounselPost
        title={counsel.title}
        content={counsel.content}
        category={counsel.category}
        createdAt={counsel.createdAt}
      />
      <ResponseSection>
        {counsel.response ? (
          <CounselResponse response={counsel.response} />
        ) : (
          <Waiting>아직 아무런 답변도 작성되지 않았어요.</Waiting>
        )}
        {deleteError && <DeleteError>{deleteError}</DeleteError>}
      </ResponseSection>

      {isMenuOpen && (
        <BottomSheet
          variant="manage"
          isClose={false}
          onClick={(menu) => {
            setIsMenuOpen(false);
            if (menu === "edit") {
              navigate(`/counsel/${counsel.id}/edit`);
            } else if (menu === "delete") {
              setIsDeleteOpen(true);
            }
          }}
          onClose={() => setIsMenuOpen(false)}
        />
      )}

      <DeleteModal
        isOpen={isDeleteOpen}
        onConfirm={() => {
          setIsDeleteOpen(false);
          onDeleteConfirm();
        }}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </Page>
  );
};

const Page = styled.main`
  position: relative;
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ResponseSection = styled.section`
  padding: 1.25rem;
`;

const Waiting = styled.p`
  margin-top: 50%;
  color: ${COLORS.gray.gray400};
  ${TEXT_STYLE.body.sm};
  text-align: center;
`;

const DeleteError = styled.p`
  margin-top: 1rem;
  color: ${COLORS.state.error};
  ${TEXT_STYLE.body.sm};
  text-align: center;
`;

const NotFound = styled.p`
  margin-top: 55%;
  color: ${COLORS.gray.gray500};
  ${TEXT_STYLE.body.sm};
  text-align: center;
`;
