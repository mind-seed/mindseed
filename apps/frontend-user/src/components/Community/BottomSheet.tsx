import { useEffect, useRef } from "react";
import { styled } from "styled-components";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";
import { CheckIcon } from "../Icons/CheckIcon";
import { ChevronRightIcon } from "../Icons/ChevronIcon";
import { CopyIcon } from "../Icons/CopyIcon";
import { PenIcon } from "../Icons/PenIcon";
import { TrashIcon } from "../Icons/TrashIcon";
import { WarningIcon } from "../Icons/WarningIcon";

type ManageProps = {
  variant: "manage";
  isClose: boolean;
  onClick: (menu: "edit" | "delete") => void;
  onClose: () => void;
};
type MoreProps = {
  variant: "more";
  isClose: boolean;
  onClick: (menu: "copyLink" | "report") => void;
  onClose: () => void;
};
type CommentMoreProps = {
  variant: "commentMore";
  isClose: boolean;
  onClick: (menu: "report") => void;
  onClose: () => void;
};
type SortProps<T extends string> = {
  variant: "sort";
  menuList: T[];
  activeMenu: T;
  isClose: boolean;
  onClick: (menu: T) => void;
  onClose: () => void;
};
type BottomSheetProps<T extends string> =
  | ManageProps
  | MoreProps
  | CommentMoreProps
  | SortProps<T>;

export const BottomSheet = <T extends string>(props: BottomSheetProps<T>) => {
  const title =
    props.variant === "manage"
      ? "글 관리"
      : props.variant === "more" || props.variant === "commentMore"
        ? "더보기"
        : "정렬기준";
  const { isClose, onClose } = props;
  const sheetRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isClose) return;

    previousFocusRef.current = document.activeElement as HTMLElement;

    const timer = setTimeout(() => {
      sheetRef.current?.focus();
    }, 10);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);

      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isClose, onClose]);

  if (isClose) return null;
  return (
    <Overlay onClick={props.onClose}>
      <Sheet
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <Content>
          <Title>{title}</Title>
          <ActionList>
            {props.variant === "manage" && (
              <>
                <ActionButton
                  type="button"
                  onClick={() => props.onClick("edit")}
                >
                  <ActionContent>
                    <PenIcon />
                    <span>내 글 수정하기</span>
                  </ActionContent>
                  <ChevronRightIcon color={COLORS.gray.gray400} />
                </ActionButton>
                <ActionButton
                  type="button"
                  $danger
                  onClick={() => props.onClick("delete")}
                >
                  <ActionContent>
                    <TrashIcon />
                    <span>내 글 삭제하기</span>
                  </ActionContent>
                </ActionButton>
              </>
            )}
            {props.variant === "more" && (
              <>
                <ActionButton
                  type="button"
                  onClick={() => props.onClick("copyLink")}
                >
                  <ActionContent>
                    <CopyIcon />
                    <span>글 링크 복사</span>
                  </ActionContent>
                </ActionButton>
                <ActionButton
                  type="button"
                  $danger
                  onClick={() => props.onClick("report")}
                >
                  <ActionContent>
                    <TrashIcon />
                    <span>신고하기</span>
                  </ActionContent>
                </ActionButton>
              </>
            )}
            {props.variant === "commentMore" && (
              <ActionButton
                type="button"
                $danger
                onClick={() => props.onClick("report")}
              >
                <ActionContent>
                  <WarningIcon />
                  <span>댓글 신고하기</span>
                </ActionContent>
              </ActionButton>
            )}
            {props.variant === "sort" &&
              props.menuList.map((menu) => {
                const selected = props.activeMenu === menu;
                return (
                  <SortButton
                    key={menu}
                    type="button"
                    $selected={selected}
                    onClick={() => props.onClick(menu)}
                  >
                    <span>{menu}</span>
                    {selected && <CheckIcon />}
                  </SortButton>
                );
              })}
          </ActionList>
        </Content>
        <CancelArea>
          <CancelButton type="button" onClick={props.onClose}>
            취소
          </CancelButton>
        </CancelArea>
      </Sheet>
    </Overlay>
  );
};

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 20;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background: color-mix(in srgb, ${COLORS.text.black} 30%, transparent);
`;
const Sheet = styled.div`
  width: 100%;
  padding-bottom: 3.5rem;
  border-radius: 24px 24px 0 0;
  background: ${COLORS.gray.gray0};
  overflow: hidden;
`;
const Content = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;
const Title = styled.h2`
  width: 100%;
  padding: 20px 0 6px;
  color: ${COLORS.text.black};
  ${TEXT_STYLE.title.sm};
  text-align: center;
`;
const ActionList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;
const ActionButton = styled.button<{ $danger?: boolean }>`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.75rem 2rem;
  border: none;
  background: none;
  color: ${({ $danger }) => ($danger ? COLORS.state.error : COLORS.text.black)};
  ${TEXT_STYLE.body.md};
  cursor: pointer;
`;
const ActionContent = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;
const SortButton = styled.button<{ $selected: boolean }>`
  width: 100%;
  min-height: 3rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 2rem;
  border: none;
  background: none;
  color: ${({ $selected }) =>
    $selected ? COLORS.main["main+"] : COLORS.text.black};
  ${({ $selected }) => ($selected ? TEXT_STYLE.body.md2 : TEXT_STYLE.body.md)};
  cursor: pointer;
`;
const CancelArea = styled.div`
  width: 100%;
  margin-top: 1.5rem;
  padding: 0 1.25rem;
`;
const CancelButton = styled.button`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem 1.25rem;
  border: none;
  border-radius: 12px;
  background: ${COLORS.gray.gray300};
  color: ${COLORS.gray.gray0};
  ${TEXT_STYLE.title.ti};
  cursor: pointer;
`;
