import { useEffect } from "react";
import styled from "styled-components";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";
import { WarningIcon } from "../Icons/WarningIcon";

type DeleteModalProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export const DeleteModal = ({
  isOpen,
  onConfirm,
  onCancel,
}: DeleteModalProps) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <Overlay onClick={onCancel}>
      <Modal
        role="alertdialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <WarningIcon width={48} height={48} color={COLORS.state.error} />

        <Message>
          <Title>정말 삭제하시겠습니까?</Title>
          <Description>
            한 번 삭제한 글과 댓글은 다시
            <br />
            복구할 수 없습니다.
          </Description>
        </Message>

        <Actions>
          <ConfirmButton type="button" onClick={onConfirm} autoFocus>
            확인
          </ConfirmButton>
          <CancelButton type="button" onClick={onCancel}>
            취소
          </CancelButton>
        </Actions>
      </Modal>
    </Overlay>
  );
};

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 30;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.25rem;
  background: color-mix(in srgb, ${COLORS.text.black} 30%, transparent);
`;

const Modal = styled.div`
  width: min(80%, 22.0625rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  border-radius: 12px;
  background: ${COLORS.gray.gray0};
`;

const Message = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-top: 1rem;
  text-align: center;
`;

const Title = styled.h2`
  color: ${COLORS.text.black};
  ${TEXT_STYLE.title.sm};
`;

const Description = styled.p`
  color: ${COLORS.gray.gray600};
  ${TEXT_STYLE.body.sm};
`;

const Actions = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 3rem;
`;

const ConfirmButton = styled.button`
  width: 100%;
  padding: 1rem 1.25rem;
  border: none;
  border-radius: 12px;
  background: ${COLORS.state.error};
  color: ${COLORS.gray.gray0};
  ${TEXT_STYLE.title.ti};
  cursor: pointer;
`;

const CancelButton = styled.button`
  width: 100%;
  padding: 1rem 1.25rem;
  border: none;
  border-radius: 12px;
  background: none;
  color: ${COLORS.gray.gray600};
  ${TEXT_STYLE.title.ti};
  cursor: pointer;
`;
