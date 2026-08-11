import { useEffect, useRef, useState } from "react";
import type {
  CommunityPost,
  PictureDto,
  PostCategory,
  PostContent,
} from "../../type/index";
import { useNavigate, useParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { styled } from "styled-components";
import { Category } from "../../components/Category";
import { PictureList } from "../../components/Picture";
import { TopBar } from "../../components/TopBar";
import { AddIcon } from "../../components/Icons/AddIcon";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";
import {
  getPost,
  createPost,
  updatePost,
  beginAttachmentUpload,
  confirmAttachmentUpload,
} from "../../api/api";
import { callAuthenticated } from "../../api/callAuthenticated";
import { POST_CATEGORIES } from "../../postCategory";

const COMMUNITY_AUTHOR_NICKNAME = "마음지기";

type WriteCategory = PostCategory;

const WRITE_CATEGORIES = POST_CATEGORIES;

const getCommunityPostPath = (postId: string | number) =>
  `/community/${postId}`;

type NewAttachment = {
  key: number;
  localUrl: string;
  attachmentId: number | null;
  uploadFailed?: boolean;
};

export const PostWritePage = () => {
  const { postId } = useParams();
  const navigate = useNavigate();

  const postQuery = useQuery({
    queryKey: ["posts", Number(postId)],
    queryFn: ({ signal }) =>
      callAuthenticated(
        (token) => getPost(token, Number(postId), { signal }),
        navigate,
      ),
    enabled: postId !== undefined,
  });

  useEffect(() => {
    if (postId !== undefined && postQuery.isError) navigate(-1);
  }, [postId, postQuery.isError, navigate]);

  if (postId !== undefined && !postQuery.data) return null;

  return (
    <PostWriteContent key={postId} postId={postId} post={postQuery.data} />
  );
};

const PostWriteContent = ({
  postId,
  post,
}: {
  postId?: string;
  post?: CommunityPost;
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const keyCounterRef = useRef(0);
  const localUrlsRef = useRef<string[]>([]);
  const isEdit = post !== undefined;
  const [category, setCategory] = useState<WriteCategory>(
    post?.category ?? WRITE_CATEGORIES[0].value,
  );
  const [content, setContent] = useState<PostContent>(post?.content ?? "");
  const [newAttachments, setNewAttachments] = useState<NewAttachment[]>([]);
  const displayNickname = post?.author.nickname ?? COMMUNITY_AUTHOR_NICKNAME;
  const pictures: PictureDto[] = [
    ...(post?.attachments ?? []),
    ...newAttachments.map((a) => ({ id: a.attachmentId ?? -a.key, url: a.localUrl })),
  ];
  const trimmedContent = content.trim();
  const hasUploadPending = newAttachments.some((a) => a.attachmentId === null && !a.uploadFailed);
  const hasUploadFailed = newAttachments.some((a) => a.uploadFailed);
  const isPostUnchanged =
    post !== undefined &&
    category === post.category &&
    trimmedContent === post.content.trim() &&
    newAttachments.length === 0;
  const isCompleteDisabled =
    !trimmedContent || isPostUnchanged || hasUploadPending || hasUploadFailed;

  const createPostMutation = useMutation({
    mutationFn: () =>
      callAuthenticated(
        (token) =>
          createPost(token, {
            content: trimmedContent,
            category,
            nickname: displayNickname,
            attachmentIds: newAttachments
              .filter((a) => a.attachmentId !== null)
              .map((a) => a.attachmentId!),
          }),
        navigate,
      ),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["posts"] });
      navigate(getCommunityPostPath(data.id));
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: () =>
      callAuthenticated(
        (token) =>
          updatePost(token, Number(postId), {
            content: trimmedContent,
            category,
            attachmentIds: [
              ...(post?.attachments.map((a) => a.id) ?? []),
              ...newAttachments
                .filter((a) => a.attachmentId !== null)
                .map((a) => a.attachmentId!),
            ],
          }),
        navigate,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["posts"] });
      navigate(getCommunityPostPath(Number(postId)));
    },
  });

  const isPending = createPostMutation.isPending || updatePostMutation.isPending;

  useEffect(
    () => () => {
      localUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    },
    [],
  );

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const existingCount =
      (post?.attachments.length ?? 0) + newAttachments.length;
    const remainingCount = Math.max(0, 3 - existingCount);
    const files = Array.from(event.target.files ?? []).slice(0, remainingCount);
    event.target.value = "";

    if (files.length === 0) return;

    const entries: NewAttachment[] = files.map((file) => {
      const key = ++keyCounterRef.current;
      const localUrl = URL.createObjectURL(file);
      localUrlsRef.current.push(localUrl);
      return { key, localUrl, attachmentId: null };
    });

    setNewAttachments((prev) => [...prev, ...entries]);

    void Promise.all(
      entries.map(async (entry, i) => {
        try {
          const { attachmentId, presignedUrl } = await callAuthenticated(
            (token) => beginAttachmentUpload(token),
            navigate,
          );
          const uploadResponse = await fetch(presignedUrl, {
            method: "PUT",
            body: files[i],
            headers: { "Content-Type": files[i].type },
          });
          if (!uploadResponse.ok) throw new Error("Upload failed");
          await callAuthenticated(
            (token) => confirmAttachmentUpload(token, { attachmentId }),
            navigate,
          );
          setNewAttachments((prev) =>
            prev.map((a) =>
              a.key === entry.key ? { ...a, attachmentId } : a,
            ),
          );
        } catch {
          setNewAttachments((prev) =>
            prev.map((a) =>
              a.key === entry.key ? { ...a, uploadFailed: true } : a,
            ),
          );
        }
      }),
    );
  };

  const handleComplete = () => {
    if (isCompleteDisabled || isPending) return;

    if (isEdit) {
      updatePostMutation.mutate();
    } else {
      createPostMutation.mutate();
    }
  };

  if (postId && !post) return null;

  return (
    <Page>
      <TopBar
        title={isEdit ? "글 수정" : "글 작성"}
        rightType="text"
        rightText={isEdit ? "완료" : "게시"}
        rightDisabled={isCompleteDisabled || isPending}
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
              {hasUploadFailed && (
                <UploadError>일부 이미지 업로드에 실패했습니다.</UploadError>
              )}
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

const UploadError = styled.p`
  margin-top: 0.5rem;
  color: ${COLORS.gray.gray500};
  ${TEXT_STYLE.body.sm};
`;
