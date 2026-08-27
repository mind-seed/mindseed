import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { styled } from "styled-components";
import { Comment, CommentInput } from "../../components/Community/Comment";
import { BottomSheet } from "../../components/Community/BottomSheet";
import { CommentButton } from "../../components/Community/CommentButton";
import { LikeButton } from "../../components/Community/LikeButton";
import { Post } from "../../components/Community/Post";
import { TopBar } from "../../components/TopBar";
import { DeleteModal } from "../../components/Community/DeleteModal";
import { ReportModal } from "../../components/Community/ReportModal";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";
import type { z } from "zod";
import {
  ActiveCommentDtoSchema,
  PostWithCommentsSchema,
  type CreateCommentRequestDto,
} from "@mindseed/api-types";
import {
  getPost,
  setPostLike,
  deletePost,
  createComment,
  updateComment,
  deleteComment,
  createPostReport,
  createCommentReport,
} from "../../api/api";
import { callAuthenticated } from "../../api/callAuthenticated";

type CommunityPost = z.infer<typeof PostWithCommentsSchema>;

const COMMUNITY_AUTHOR_NICKNAME = "마음지기";

type DeleteTarget = { type: "post" } | { type: "comment"; commentId: number };
type ReportTarget = { type: "post" } | { type: "comment"; commentId: number };

export const PostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const postQuery = useQuery({
    queryKey: ["posts", Number(postId)],
    queryFn: ({ signal }) =>
      callAuthenticated(
        (token) => getPost(token, Number(postId), { signal }),
        navigate,
      ),
    enabled: !!postId,
  });

  const deletePostMutation = useMutation({
    mutationFn: () =>
      callAuthenticated((token) => deletePost(token, Number(postId)), navigate),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["posts"] });
      navigate("/community", { replace: true });
    },
  });

  if (postQuery.isLoading) return null;
  if (postQuery.isError)
    return (
      <Page>
        <TopBar onBackClick={() => navigate("/community")} />
        <NotFound>게시글을 불러오지 못했습니다.</NotFound>
      </Page>
    );

  return (
    <PostDetailContent
      key={postId}
      post={postQuery.data}
      onDeletePost={() => deletePostMutation.mutate()}
    />
  );
};

const PostDetailContent = ({
  post,
  onDeletePost,
}: {
  post?: CommunityPost;
  onDeletePost: () => void;
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const originalEditingComment = comments.find(
    (item) => item.id === editingCommentId && item.type === "active",
  );
  const trimmedEditingComment = editingComment.trim();
  const isEditingCommentUnchanged =
    originalEditingComment?.type === "active" &&
    trimmedEditingComment === originalEditingComment.content.trim();
  const isEditDisabled = !trimmedEditingComment || isEditingCommentUnchanged;

  const createCommentMutation = useMutation({
    mutationFn: (input: CreateCommentRequestDto) =>
      callAuthenticated(
        (token) => createComment(token, post!.id, input),
        navigate,
      ),
    onSuccess: (data, variables) => {
      const now = new Date().toISOString();
      const result = ActiveCommentDtoSchema.safeParse({
        type: "active",
        id: data.id,
        content: variables.content,
        author: { nickname: variables.nickname },
        isOwner: true,
        createdAt: now,
        updatedAt: now,
      });
      if (result.success) {
        setComments((items) => [...items, result.data]);
      } else {
        void queryClient.invalidateQueries({ queryKey: ["posts", post!.id] });
      }
      setComment("");
      setIsCommentMode(false);
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: ({
      commentId,
      content,
    }: {
      commentId: number;
      content: string;
    }) =>
      callAuthenticated(
        (token) => updateComment(token, post!.id, commentId, { content }),
        navigate,
      ),
    onSuccess: (_, variables) => {
      setComments((items) =>
        items.map((item) =>
          item.id === variables.commentId && item.type === "active"
            ? { ...item, content: variables.content }
            : item,
        ),
      );
      setEditingCommentId(null);
      setEditingComment("");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) =>
      callAuthenticated(
        (token) => deleteComment(token, post!.id, commentId),
        navigate,
      ),
    onSuccess: (_, commentId) => {
      setComments((items) =>
        items.map((item) =>
          item.id === commentId
            ? {
                type: "deleted" as const,
                id: item.id,
                deletionType: "author" as const,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt,
              }
            : item,
        ),
      );
      setEditingCommentId(null);
      setEditingComment("");
      setDeleteTarget(null);
    },
  });

  const createPostReportMutation = useMutation({
    mutationFn: (reason: string) =>
      callAuthenticated(
        (token) => createPostReport(token, { postId: post!.id, reason }),
        navigate,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["posts"] });
      setReportTarget(null);
      navigate("/community", { replace: true });
    },
  });

  const createCommentReportMutation = useMutation({
    mutationFn: ({
      commentId,
      reason,
    }: {
      commentId: number;
      reason: string;
    }) =>
      callAuthenticated(
        (token) => createCommentReport(token, { commentId, reason }),
        navigate,
      ),
    onSuccess: (_, variables) => {
      setComments((items) =>
        items.filter((item) => item.id !== variables.commentId),
      );
      setReportTarget(null);
    },
  });

  const setPostLikeMutation = useMutation({
    mutationFn: (liked: boolean) =>
      callAuthenticated(
        (token) => setPostLike(token, post!.id, { liked }),
        navigate,
      ),
    onError: (_, liked) => {
      setIsLiked(!liked);
      setLikeCount((count) => Math.max(0, count + (liked ? -1 : 1)));
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

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
    createCommentMutation.mutate({
      nickname: COMMUNITY_AUTHOR_NICKNAME,
      content: trimmedComment,
    });
  };

  const handleLikeClick = () => {
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikeCount((count) => Math.max(0, count + (newLiked ? 1 : -1)));
    setPostLikeMutation.mutate(newLiked);
  };

  const handleEditSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isEditDisabled || editingCommentId === null) return;
    updateCommentMutation.mutate({
      commentId: editingCommentId,
      content: trimmedEditingComment,
    });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "comment") {
      deleteCommentMutation.mutate(deleteTarget.commentId);
      return;
    }

    setDeleteTarget(null);
    onDeletePost();
  };

  const handleReportConfirm = (reason: string) => {
    if (!reportTarget) return;

    if (reportTarget.type === "comment") {
      createCommentReportMutation.mutate({
        commentId: reportTarget.commentId,
        reason,
      });
      return;
    }

    createPostReportMutation.mutate(reason);
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
              disabled={!comment.trim() || createCommentMutation.isPending}
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
                disabled={isEditDisabled || updateCommentMutation.isPending}
                onChange={(event) => setEditingComment(event.target.value)}
                onSubmit={handleEditSubmit}
                autoFocus
              />
            </CommentInputArea>
          ) : item.type === "active" && item.isOwner ? (
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
          onClick={(menu) => {
            if (menu === "report") {
              setReportTarget({ type: "comment", commentId: moreCommentId });
            }
            setMoreCommentId(null);
          }}
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

            if (menu === "report") {
              setReportTarget({ type: "post" });
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

      <ReportModal
        isOpen={reportTarget !== null}
        isPending={
          createPostReportMutation.isPending ||
          createCommentReportMutation.isPending
        }
        onConfirm={handleReportConfirm}
        onCancel={() => setReportTarget(null)}
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
  margin-top: 55%;
  color: ${COLORS.gray.gray500};
  ${TEXT_STYLE.body.sm};
  text-align: center;
`;
