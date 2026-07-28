import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { styled } from "styled-components";
import { Comment, CommentInput } from "../../components/Community/Comment";
import { BottomSheet } from "../../components/Community/BottomSheet";
import { CommentButton } from "../../components/Community/CommentButton";
import { LikeButton } from "../../components/Community/LikeButton";
import { Post } from "../../components/Community/Post";
import { TopBar } from "../../components/TopBar";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";
import { ActiveCommentDtoSchema } from "../../type/index";
import type { CommunityPost } from "../../type/index";

const COMMUNITY_AUTHOR_NICKNAME = "마음지기";

export const PostDetailPage = () => {
  const { postId } = useParams();

  return <PostDetailContent key={postId} />;
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

  useEffect(() => {
    if (!isCommentMode) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!commentInputRef.current?.contains(event.target as Node)) {
        setIsCommentMode(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isCommentMode]);

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
    const trimmedComment = editingComment.trim();
    if (!trimmedComment || editingCommentId === null) return;

    setComments((items) =>
      items.map((item) =>
        item.id === editingCommentId && item.type === "active"
          ? { ...item, content: trimmedComment }
          : item,
      ),
    );
    setEditingCommentId(null);
    setEditingComment("");
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
              onChange={(event) => setComment(event.target.value)}
              onSubmit={handleSubmit}
              autoFocus
            />
          </CommentInputArea>
        )}

        {comments.map((item) =>
          item.id === editingCommentId && item.type === "active" ? (
            <CommentInputArea key={item.id}>
              <CommentInput
                value={editingComment}
                buttonText="수정"
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
              onDeleteClick={() => undefined}
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
