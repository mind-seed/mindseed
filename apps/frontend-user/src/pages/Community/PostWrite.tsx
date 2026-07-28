import { useEffect, useRef, useState } from "react";
import { PostWithCommentsSchema } from "../../type/index";
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
import { AddIcon } from "../../components/Icons/AddIcon";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";

const COMMUNITY_AUTHOR_NICKNAME = "마음지기";

type WriteCategory = PostCategory | "other";

const WRITE_CATEGORIES: ReadonlyArray<{
  value: WriteCategory;
  label: string;
}> = [
  { value: "dummy1", label: "고민상담" },
  { value: "dummy2", label: "일상" },
  { value: "dummy3", label: "문의" },
  { value: "other", label: "기타" },
];

const COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 1,
    content: "요즘 마음이 복잡한데 어떻게 정리하면 좋을까요?",
    category: "dummy1",
    author: { nickname: COMMUNITY_AUTHOR_NICKNAME },
    attachments: [],
    likeCount: 12,
    isOwner: true,
    isLiked: false,
    createdAt: "2026-07-28T09:00:00.000Z",
    updatedAt: "2026-07-28T09:00:00.000Z",
    comments: [
      {
        type: "active",
        id: 1,
        content: "작성자 댓글입니다.",
        author: { nickname: COMMUNITY_AUTHOR_NICKNAME },
        createdAt: "2026-07-28T09:10:00.000Z",
        updatedAt: "2026-07-28T09:10:00.000Z",
      },
      {
        type: "active",
        id: 2,
        content: "천천히 하나씩 적어보는 건 어떨까요?",
        author: { nickname: "새싹이" },
        createdAt: "2026-07-28T09:20:00.000Z",
        updatedAt: "2026-07-28T09:20:00.000Z",
      },
    ],
  },
  {
    id: 2,
    content: "오늘은 산책하면서 기분 전환을 했어요.",
    category: "dummy2",
    author: { nickname: "초록이" },
    attachments: [],
    likeCount: 8,
    isOwner: false,
    isLiked: true,
    createdAt: "2026-07-27T10:00:00.000Z",
    updatedAt: "2026-07-27T10:00:00.000Z",
    comments: [],
  },
  {
    id: 3,
    content: "자가진단 결과는 어디에서 다시 확인할 수 있나요?",
    category: "dummy3",
    author: { nickname: "푸른콩" },
    attachments: [],
    likeCount: 5,
    isOwner: false,
    isLiked: false,
    createdAt: "2026-07-26T11:00:00.000Z",
    updatedAt: "2026-07-26T11:00:00.000Z",
    comments: [],
  },
  {
    id: 4,
    content: "잠들기 전에 어떤 생각을 하면 마음이 편해질까요?",
    category: "dummy1",
    author: { nickname: "나무늘보" },
    attachments: [],
    likeCount: 18,
    isOwner: false,
    isLiked: false,
    createdAt: "2026-07-25T12:00:00.000Z",
    updatedAt: "2026-07-25T12:00:00.000Z",
    comments: [],
  },
  {
    id: 5,
    content: "작은 화분에 새싹이 올라왔어요!",
    category: "dummy2",
    author: { nickname: "햇살이" },
    attachments: [],
    likeCount: 21,
    isOwner: false,
    isLiked: true,
    createdAt: "2026-07-24T13:00:00.000Z",
    updatedAt: "2026-07-24T13:00:00.000Z",
    comments: [],
  },
].map((post) => PostWithCommentsSchema.parse(post));

const getCommunityPostPath = (postId: string | number) =>
  `/community/${postId}`;

export const PostWritePage = () => {
  const { postId } = useParams();
  const post = COMMUNITY_POSTS.find((item) => String(item.id) === postId);

  return <PostWriteContent key={postId} postId={postId} post={post} />;
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
  const [category, setCategory] = useState<WriteCategory>(
    post?.category ?? WRITE_CATEGORIES[0].value,
  );
  const [content, setContent] = useState<PostContent>(post?.content ?? "");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const imageUrlsRef = useRef<string[]>([]);
  const displayNickname = post?.author.nickname ?? COMMUNITY_AUTHOR_NICKNAME;
  const pictures: PictureDto[] = [
    ...(post?.attachments ?? []),
    ...imageUrls.map((url, index) => ({ id: -(index + 1), url })),
  ];
  const trimmedContent = content.trim();
  const isPostUnchanged =
    post !== undefined &&
    category === post.category &&
    trimmedContent === post.content.trim() &&
    imageUrls.length === 0;
  const isCompleteDisabled = !trimmedContent || isPostUnchanged;

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
    if (isCompleteDisabled) return;

    navigate(post ? getCommunityPostPath(post.id) : "/community");
  };

  if (postId && !post) return null;

  return (
    <Page>
      <TopBar
        title={isEdit ? "글 수정" : "글 작성"}
        rightType="text"
        rightText={isEdit ? "완료" : "게시"}
        rightDisabled={isCompleteDisabled}
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
          <AddIcon width={20} height={20} />
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
