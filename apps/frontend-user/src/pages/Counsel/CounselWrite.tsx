import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { styled } from "styled-components";
import { Category } from "../../components/Category";
import { TopBar } from "../../components/TopBar";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";
import type zod from "zod";
import { CounselCategorySchema, CounselDtoSchema } from "@mindseed/api-types";
import { COUNSEL_CATEGORIES } from "../../constants/counselCategory";
import { createCounsel, getCounsel, updateCounsel } from "../../api/api";
import { callAuthenticated } from "../../api/callAuthenticated";

type CounselCategory = zod.infer<typeof CounselCategorySchema>;
type CounselDto = zod.infer<typeof CounselDtoSchema>;

type WriteCategory = CounselCategory;

export const CounselWrite = ({ isEdit = false }: { isEdit?: boolean }) => {
  const { counselId: counselIdParam } = useParams();
  const counselId = counselIdParam ? Number(counselIdParam) : undefined;
  const navigate = useNavigate();

  const counselQuery = useQuery({
    queryKey: ["counsels", counselId],
    queryFn: ({ signal }) =>
      callAuthenticated(
        (token) => getCounsel(token, counselId!, { signal }),
        navigate,
      ),
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && counselQuery.isError) navigate(-1);
  }, [isEdit, counselQuery.isError, navigate]);

  if (isEdit && !counselQuery.data) return null;

  return (
    <CounselWriteContent
      key={counselIdParam}
      counselId={counselId}
      counsel={counselQuery.data}
      isEdit={isEdit}
    />
  );
};

const CounselWriteContent = ({
  counselId,
  counsel,
  isEdit,
}: {
  counselId?: number;
  counsel?: CounselDto;
  isEdit: boolean;
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState(counsel?.title ?? "");
  const [content, setContent] = useState(counsel?.content ?? "");
  const [category, setCategory] = useState<WriteCategory>(
    counsel?.category ?? COUNSEL_CATEGORIES[0].value,
  );

  const isDisabled = !title.trim() || !content.trim();

  const createCounselMutation = useMutation({
    mutationFn: () =>
      callAuthenticated(
        (token) =>
          createCounsel(token, {
            title: title.trim(),
            content: content.trim(),
            category,
          }),
        navigate,
      ),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["counsels"] });
      navigate(`/counsel/${data.id}`, { replace: true });
    },
  });

  const updateCounselMutation = useMutation({
    mutationFn: () =>
      callAuthenticated(
        (token) =>
          updateCounsel(token, counselId!, {
            title: title.trim(),
            content: content.trim(),
            category,
          }),
        navigate,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["counsels"] });
      navigate(`/counsel/${counselId}`, { replace: true });
    },
  });

  const isPending =
    createCounselMutation.isPending || updateCounselMutation.isPending;
  const isError =
    createCounselMutation.isError || updateCounselMutation.isError;

  const handleSubmit = () => {
    if (isDisabled || isPending) return;
    if (isEdit) {
      updateCounselMutation.mutate();
    } else {
      createCounselMutation.mutate();
    }
  };

  return (
    <Page>
      <TopBar
        title={isEdit ? "글 수정" : "글 작성"}
        rightType="text"
        rightText={isEdit ? "완료" : "게시"}
        rightDisabled={isDisabled || isPending}
        onBackClick={() => navigate(-1)}
        onRightClick={handleSubmit}
      />
      <Editor>
        <CategoryList>
          {COUNSEL_CATEGORIES.map((item) => (
            <Category
              key={item.value}
              $variant={category === item.value ? "selected" : "inactive"}
              $label={item.label}
              onClick={() => setCategory(item.value)}
            />
          ))}
        </CategoryList>

        <InputWrapper>
          <TitleInput
            value={title}
            placeholder="제목을 입력해주세요."
            maxLength={50}
            onChange={(event) => setTitle(event.target.value)}
          />
          <BodyInput
            value={content}
            placeholder="요즘 힘든 일이 있나요?"
            maxLength={500}
            onChange={(event) => setContent(event.target.value)}
          />
          {isError && (
            <ErrorMessage>오류가 발생했습니다. 잠시 후 다시 시도해주세요.</ErrorMessage>
          )}
        </InputWrapper>
      </Editor>
    </Page>
  );
};

const Page = styled.main`
  width: 100%;
  height: 100dvh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const Editor = styled.section`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const CategoryList = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem 1.25rem;
`;

const InputWrapper = styled.div`
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  padding: 0.625rem 1.25rem;
`;

const TitleInput = styled.input`
  width: 100%;
  border: none;
  outline: none;
  color: ${COLORS.text.black};
  ${TEXT_STYLE.title.ti};

  &::placeholder {
    color: ${COLORS.gray.gray600};
  }
`;

const BodyInput = styled.textarea`
  width: 100%;
  border: none;
  outline: none;
  color: ${COLORS.text.black};
  ${TEXT_STYLE.body.sm};
  resize: none;
  white-space: pre-wrap;
  word-break: break-all;
  overflow-wrap: break-word;

  &::placeholder {
    color: ${COLORS.gray.gray600};
  }
`;

const ErrorMessage = styled.p`
  color: ${COLORS.state.error};
  ${TEXT_STYLE.body.sm};
`;
