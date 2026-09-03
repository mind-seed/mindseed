import { useState } from "react";
import { useNavigate } from "react-router";
import { styled } from "styled-components";
import { Category } from "../../components/Category";
import { TopBar } from "../../components/TopBar";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";
import type zod from "zod";
import { CounselCategorySchema } from "@mindseed/api-types";
import { RESOURCE_CATEGORIES } from "../../constants/resourceCategory";

type CounselCategory = zod.infer<typeof CounselCategorySchema>;

type WriteCategory = CounselCategory;

const WRITE_CATEGORIES = RESOURCE_CATEGORIES;

export const CounselWrite = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<WriteCategory>(
    WRITE_CATEGORIES[0].value,
  );
  const isDisabled = !title.trim() || !content.trim();

  const handleSubmit = () => {
    if (isDisabled) return;
    navigate("/counsel");
  };

  return (
    <Page>
      <TopBar
        title="글 작성"
        rightType="text"
        rightText="게시"
        rightDisabled={isDisabled}
        onBackClick={() => navigate(-1)}
        onRightClick={handleSubmit}
      />
      <Editor>
        <CategoryList>
          {RESOURCE_CATEGORIES.map((item) => (
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
            maxLength={200}
            onChange={(event) => setContent(event.target.value)}
          />
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
