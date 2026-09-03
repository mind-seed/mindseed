import { useNavigate, useParams } from "react-router";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";
import { styled } from "styled-components";
import { TopBar } from "../../components/TopBar";
import { CounselPost } from "../../components/Counsel/CounselPost";
import { CounselResponse } from "../../components/Counsel/CounselResponse";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";
import type { z } from "zod";
import { CounselDtoSchema } from "@mindseed/api-types";
import { CounselCategorySchema } from "@mindseed/api-types";
import { RESOURCE_CATEGORIES } from "../../constants/resourceCategory";

type CounselDto = z.infer<typeof CounselDtoSchema>;
type CounselCategory = z.infer<typeof CounselCategorySchema>;

const ANSWER =
  "안녕하세요. 글 잘 읽어보았습니다.\n\n작성해주신 내용을 보면 단순히 조용한 성격의 문제라기보다는 사람들과의 관계 속에서 상당한 긴장과 소모를 경험하고 계신 것 같습니다. 특히 대화 속에 끼는 것 자체의 부담과 행동을 반복해서 되돌아보는 모습은 관계에 대한 불안이 커진 상태로 보입니다.\n\n우선 말씀드리고 싶은 건 지금의 모습이 잘못된 것이 아니라는 점입니다. 천천히 편안한 관계부터 시작해보세요.";

const COUNSEL = CounselDtoSchema.parse({
  id: 1,
  title: "혼자는 무섭고, 함께 있으면 너무 힘들어요hhhh",
  content:
    "요즘 들어 다른 사람과의 관계가 너무 힘들게 느껴집니다. 원래도 말이 많은 편은 아니었지만, 최근에는 대화에 끼는 것 자체가 부담스럽고 괜히 한마디 했다가 분위기를 망칠까 봐 입을 닫게 됩니다.\n\n친구들은 제가 조용한 성격이라 그런 거라고 가볍게 넘기지만, 사실은 계속 신경을 쓰고 있습니다. 단순히 낯을 가리는 걸 넘어서, 같이 있어도 혼자인 느낌이 들 때가 많습니다.\n\n이런 상황에서 어떻게 행동하는 게 나은지 조언 부탁드립니다.",
  category: "stress",
  createdAt: "2026-07-31T00:00:00.000Z",
  // response: ANSWER,
});

export const CounselDetail = () => {
  const { counselId } = useParams();

  return (
    <CounselDetailContent
      key={counselId}
      counsel={COUNSEL}
    ></CounselDetailContent>
  );
};

const CounselDetailContent = ({ counsel }: { counsel: CounselDto }) => {
  const navigate = useNavigate();
  const { counselId } = useParams();

  return (
    <Page>
      <TopBar onBackClick={() => navigate(-1)} />
      <CounselPost
        key={counsel.id}
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
      </ResponseSection>
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

const NotFound = styled.p`
  margin-top: 55%;
  color: ${COLORS.gray.gray500};
  ${TEXT_STYLE.body.sm};
  text-align: center;
`;
