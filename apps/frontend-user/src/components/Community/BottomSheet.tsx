import { styled } from "styled-components";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";

type ManageBottomSheetProps = {
  variant: "manage";
  isClose: boolean;
  onClick: (menu: "edit" | "delete") => void;
  onClose: () => void;
};

type MoreBottomSheetProps = {
  variant: "more";
  isClose: boolean;
  onClick: (menu: "copyLink" | "report") => void;
  onClose: () => void;
};

type CommentMoreBottomSheetProps = {
  variant: "commentMore";
  isClose: boolean;
  onClick: (menu: "report") => void;
  onClose: () => void;
};

type SortBottomSheetProps<T extends string> = {
  variant: "sort";
  menuList: T[];
  activeMenu: T;
  isClose: boolean;
  onClick: (menu: T) => void;
  onClose: () => void;
};

type BottomSheetProps<T extends string> =
  | ManageBottomSheetProps
  | MoreBottomSheetProps
  | CommentMoreBottomSheetProps
  | SortBottomSheetProps<T>;

export const BottomSheet = <T extends string>(props: BottomSheetProps<T>) => {
  const title =
    props.variant === "manage"
      ? "글 관리"
      : props.variant === "more" || props.variant === "commentMore"
        ? "더보기"
        : "정렬기준";

  return (
    <Overlay onClick={props.onClose}>
      <Sheet
        onClick={(e) => {
          e.stopPropagation();
        }}
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
                  <ChevronIcon />
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
                const isSelected = props.activeMenu === menu;

                return (
                  <SortButton
                    key={menu}
                    type="button"
                    $selected={isSelected}
                    onClick={() => props.onClick(menu)}
                  >
                    <span>{menu}</span>
                    {isSelected && <CheckIcon />}
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

const Icon = styled.svg`
  width: 1.5rem;
  height: 1.5rem;
`;

const PenIcon = () => (
  <Icon viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M2.77694 19.783L3.38394 15.621C3.42094 15.349 3.54494 15.096 3.73894 14.901L15.4999 3.124C15.6522 2.96956 15.8417 2.85702 16.0502 2.79728C16.2587 2.73755 16.479 2.73262 16.6899 2.783C17.7696 3.08146 18.7483 3.66686 19.5219 4.477C20.3299 5.25595 20.9112 6.23958 21.2039 7.323C21.2543 7.53393 21.2494 7.75429 21.1897 7.96276C21.1299 8.17123 21.0174 8.36076 20.8629 8.513L9.08894 20.275C8.89366 20.4685 8.64046 20.5928 8.36794 20.629L4.20694 21.236C4.01039 21.2647 3.80984 21.2466 3.62157 21.1833C3.43329 21.12 3.26259 21.0132 3.12331 20.8715C2.98402 20.7299 2.88008 20.5575 2.8199 20.3682C2.75972 20.1789 2.74501 19.978 2.77694 19.782M13.2749 5.364L18.6379 10.727"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

const TrashIcon = () => (
  <Icon viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M4 7H20M9 7V4H15V7M6 7L7 21H17L18 7M10 11V17M14 11V17"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

const CopyIcon = () => (
  <Icon viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <rect
      x="9"
      y="3"
      width="11"
      height="15"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M15 21H5C4.448 21 4 20.552 4 20V7"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </Icon>
);

const WarningIcon = () => (
  <Icon viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 3L22 20H2L12 3Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M12 9V14"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <circle cx="12" cy="17" r="1" fill="currentColor" />
  </Icon>
);

const ChevronIcon = () => (
  <Icon viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M9 18L15 12L9 6"
      stroke={COLORS.gray.gray400}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

const CheckIcon = () => (
  <Icon viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M5 12.5L9.5 17L19 7.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);
