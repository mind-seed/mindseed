import { useEffect, useRef, useState } from "react";
import { PostCategorySchema } from "../../type/index";
import type {
  CommunityPost,
  PictureDto,
  PostCategory,
  PostContent,
} from "../../type/index";
import { useNavigate, useParams } from "react-router";
import { styled } from "styled-components";
import { Category } from "../../components/Category";
import { PictureList } from "../../components/Picture";
import { TopBar } from "../../components/TopBar";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";
import { getCommunityPostPath } from "./communityModel";

const COMMUNITY_AUTHOR_NICKNAME = "마음지기";

const POST_CATEGORY_LABELS: Record<PostCategory, string> = {
  dummy1: "고민상담",
  dummy2: "일상기록",
  dummy3: "문의",
};

const WRITE_CATEGORIES = PostCategorySchema.options.map((value) => ({
  value,
  label: POST_CATEGORY_LABELS[value],
}));

export const PostWritePage = () => {
  const { postId } = useParams();

  return <PostWriteContent key={postId} postId={postId} />;
};

const PostWriteContent = ({
  postId,
  post,
}: {
  postId?: string;
  post?: CommunityPost;
}) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEdit = post !== undefined;
  const [category, setCategory] = useState<PostCategory>(
    post?.category ?? PostCategorySchema.options[0],
  );
  const [content, setContent] = useState<PostContent>(post?.content ?? "");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const imageUrlsRef = useRef<string[]>([]);
  const displayNickname = post?.author.nickname ?? COMMUNITY_AUTHOR_NICKNAME;
  const pictures: PictureDto[] = [
    ...(post?.attachments ?? []),
    ...imageUrls.map((url, index) => ({ id: -(index + 1), url })),
  ];

  useEffect(
    () => () => {
      imageUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const remainingCount = Math.max(
      0,
      3 - (post?.attachments.length ?? 0) - imageUrlsRef.current.length,
    );
    const files = Array.from(event.target.files ?? []).slice(0, remainingCount);
    const urls = files.map((image) => URL.createObjectURL(image));

    imageUrlsRef.current = [...imageUrlsRef.current, ...urls];
    setImageUrls(imageUrlsRef.current);
    event.target.value = "";
  };

  const handleComplete = () => {
    if (!content.trim()) return;

    navigate(post ? getCommunityPostPath(post.id) : "/community");
  };

  if (postId && !post) return null;

  return (
    <Page>
      <TopBar
        title={isEdit ? "글 수정" : "글 작성"}
        rightType="text"
        rightText={isEdit ? "완료" : "게시"}
        onBackClick={() => navigate(-1)}
        onRightClick={handleComplete}
      />

      <Editor>
        <CategoryList>
          {WRITE_CATEGORIES.map((item) => (
            <Category
              key={item.value}
              $variant={category === item.value ? "selected" : "inactive"}
              $label={item.label}
              onClick={() => setCategory(item.value)}
            />
          ))}
        </CategoryList>

        <InputWrapper>
          <Nickname>{displayNickname}</Nickname>

          <BodyInput
            value={content}
            placeholder="커뮤니티에 글을 작성해보세요!"
            maxLength={200}
            onChange={(event) => setContent(event.target.value)}
          />

          {pictures.length > 0 && (
            <PictureContainer aria-label="첨부 이미지">
              <PictureList pictures={pictures} />
            </PictureContainer>
          )}
        </InputWrapper>

        <ImageButton
          type="button"
          onClick={() => fileInputRef.current?.click()}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15.8337 10.8317H10.8337V15.8317H9.16699V10.8317H4.16699V9.16504H9.16699V4.16504H10.8337V9.16504H15.8337V10.8317Z"
              fill="#979797"
            />
          </svg>
          이미지 추가
        </ImageButton>

        <HiddenInput
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
        />
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
  padding-bottom: 1rem;
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

const Nickname = styled.span`
  color: ${COLORS.text.black};
  ${TEXT_STYLE.title.ti};
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
    color: ${COLORS.gray.gray400};
  }
`;

const ImageButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.375rem;
  z-index: 20;
  padding: 0.625rem 1.25rem;
  border: none;
  background: none;
  color: ${COLORS.gray.gray500};
  ${TEXT_STYLE.body.sm};
  cursor: pointer;
`;

const HiddenInput = styled.input`
  display: none;
`;

const PictureContainer = styled.div`
  padding: 0.625rem 0;
`;
