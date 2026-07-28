import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { styled } from "styled-components";
import { Comment, CommentInput } from "../../components/community/Comment";
import { BottomSheet } from "../../components/community/BottomSheet";
import { CommentButton } from "../../components/community/CommentButton";
import { LikeButton } from "../../components/community/LikeButton";
import { Post } from "../../components/community/Post";
import { TopBar } from "../../components/TopBar";
import { DeleteModal } from "../../components/community/DeleteModal";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";
import {
  ActiveCommentDtoSchema,
  PostWithCommentsSchema,
} from "../../type/index";
import type { CommunityPost } from "../../type/index";

const COMMUNITY_AUTHOR_NICKNAME = "마음지기";

type DeleteTarget = { type: "post" } | { type: "comment"; commentId: number };

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

export const PostDetailPage = () => {
  const { postId } = useParams();
  const post = COMMUNITY_POSTS.find((item) => String(item.id) === postId);

  return <PostDetailContent key={postId} post={post} />;
};

const PostDetailContent = ({ post }: { post?: CommunityPost }) => {
  const navigate = useNavigate();
  const commentInputRef = useRef<HTMLDivElement>(null);
  const [comment, setComment] = useState("");
  const [isCommentMode, setIsCommentMode] = useState(false);
  const [isLiked, setIsLiked] = useState(post?.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(post?.likeCount ?? 0);
  const [moreCommentId, setMoreCommentId] = useState<number | null>(null);
  const [isPostMenuOpen, setIsPostMenuOpen] = useState(false);
  const [comments, setComments] = useState(post?.comments ?? []);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingComment, setEditingComment] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const originalEditingComment = comments.find(
    (item) => item.id === editingCommentId && item.type === "active",
  );
  const trimmedEditingComment = editingComment.trim();
  const isEditingCommentUnchanged =
    originalEditingComment?.type === "active" &&
    trimmedEditingComment === originalEditingComment.content.trim();
  const isEditDisabled = !trimmedEditingComment || isEditingCommentUnchanged;

  useEffect(() => {
    if (!isCommentMode && editingCommentId === null) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!commentInputRef.current?.contains(event.target as Node)) {
        setIsCommentMode(false);
        setEditingCommentId(null);
        setEditingComment("");
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [editingCommentId, isCommentMode]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedComment = comment.trim();
    if (!trimmedComment || !post) return;

    const now = new Date().toISOString();
    const result = ActiveCommentDtoSchema.safeParse({
      type: "active",
      id: comments.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1,
      content: trimmedComment,
      author: { nickname: COMMUNITY_AUTHOR_NICKNAME },
      createdAt: now,
      updatedAt: now,
    });

    if (!result.success) return;

    setComments((items) => [...items, result.data]);
    setComment("");
    setIsCommentMode(false);
  };

  const handleLikeClick = () => {
    setIsLiked(!isLiked);
    setLikeCount((count) => Math.max(0, count + (isLiked ? -1 : 1)));
  };

  const handleEditSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isEditDisabled || editingCommentId === null) return;

    setComments((items) =>
      items.map((item) =>
        item.id === editingCommentId && item.type === "active"
          ? { ...item, content: trimmedEditingComment }
          : item,
      ),
    );
    setEditingCommentId(null);
    setEditingComment("");
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "comment") {
      setComments((items) =>
        items.filter((item) => item.id !== deleteTarget.commentId),
      );
      setEditingCommentId(null);
      setEditingComment("");
      setDeleteTarget(null);
      return;
    }

    setDeleteTarget(null);
    navigate("/community", { replace: true });
  };

  if (!post) {
    return (
      <Page>
        <TopBar onBackClick={() => navigate("/community")} />
        <NotFound>게시글을 찾을 수 없습니다.</NotFound>
      </Page>
    );
  }

  const postMenuVariant = post.isOwner ? "manage" : "more";

  return (
    <Page>
      <TopBar
        rightType="icon"
        onBackClick={() => navigate(-1)}
        onRightClick={() => setIsPostMenuOpen(true)}
      />
      <Post
        author={post.author}
        category={post.category}
        content={post.content}
        attachments={post.attachments}
        createdAt={post.createdAt}
        isLiked={isLiked}
        variant="detail"
        onClick={() => undefined}
        onLikeClick={handleLikeClick}
      />
      <Stats>
        <LikeButton
          isLiked={isLiked}
          likeCount={likeCount}
          onClick={handleLikeClick}
        />
        <CommentButton
          count={comments.length}
          onClick={() => setIsCommentMode(true)}
        />
      </Stats>

      <CommentSection>
        {isCommentMode && (
          <CommentInputArea ref={commentInputRef}>
            <CommentInput
              value={comment}
              buttonText="등록"
              disabled={!comment.trim()}
              onChange={(event) => setComment(event.target.value)}
              onSubmit={handleSubmit}
              autoFocus
            />
          </CommentInputArea>
        )}

        {comments.map((item) =>
          item.id === editingCommentId && item.type === "active" ? (
            <CommentInputArea key={item.id} ref={commentInputRef}>
              <CommentInput
                value={editingComment}
                buttonText="수정"
                disabled={isEditDisabled}
                onChange={(event) => setEditingComment(event.target.value)}
                onSubmit={handleEditSubmit}
                autoFocus
              />
            </CommentInputArea>
          ) : item.type === "active" &&
            item.author.nickname === COMMUNITY_AUTHOR_NICKNAME ? (
            <Comment
              key={item.id}
              comment={item}
              variant="author"
              onEditClick={() => {
                setIsCommentMode(false);
                setEditingCommentId(item.id);
                setEditingComment(item.content);
              }}
              onDeleteClick={() =>
                setDeleteTarget({ type: "comment", commentId: item.id })
              }
            />
          ) : (
            <Comment
              key={item.id}
              comment={item}
              variant="user"
              onMoreClick={() => setMoreCommentId(item.id)}
            />
          ),
        )}
      </CommentSection>

      {moreCommentId !== null && (
        <BottomSheet
          variant="commentMore"
          isClose={false}
          onClick={() => setMoreCommentId(null)}
          onClose={() => setMoreCommentId(null)}
        />
      )}

      {isPostMenuOpen && postMenuVariant === "manage" && (
        <BottomSheet
          variant="manage"
          isClose={false}
          onClick={(menu) => {
            setIsPostMenuOpen(false);

            if (menu === "edit") {
              navigate(`/community/${post.id}/edit`);
            }

            if (menu === "delete") {
              setDeleteTarget({ type: "post" });
            }
          }}
          onClose={() => setIsPostMenuOpen(false)}
        />
      )}

      {isPostMenuOpen && postMenuVariant === "more" && (
        <BottomSheet
          variant="more"
          isClose={false}
          onClick={(menu) => {
            setIsPostMenuOpen(false);

            if (menu === "copyLink") {
              void navigator.clipboard?.writeText(window.location.href);
            }
          }}
          onClose={() => setIsPostMenuOpen(false)}
        />
      )}

      <DeleteModal
        isOpen={deleteTarget !== null}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </Page>
  );
};

const Page = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Stats = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 0.5625rem 0 0.5625rem 1.375rem;
  border-top: 1px solid ${COLORS.gray.gray200};
  border-bottom: 1px solid ${COLORS.gray.gray200};
`;

const CommentSection = styled.section`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CommentInputArea = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: 0.75rem 1.25rem;
`;

const NotFound = styled.p`
  padding: 5rem 1.25rem;
  color: ${COLORS.gray.gray500};
  ${TEXT_STYLE.body.sm};
  text-align: center;
`;
