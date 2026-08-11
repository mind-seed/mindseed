import { useEffect, useState } from "react";
import styled from "styled-components";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";
import { WarningIcon } from "../Icons/WarningIcon";

type ReportModalProps = {
  isOpen: boolean;
  isPending: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
};

export const ReportModal = ({
  isOpen,
  isPending,
  onConfirm,
  onCancel,
}: ReportModalProps) => {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (isOpen) setReason("");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isPending) onCancel();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isPending, onCancel]);

  if (!isOpen) return null;

  return (
    <Overlay onClick={isPending ? undefined : onCancel}>
      <Modal
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <WarningIcon width={48} height={48} color={COLORS.state.error} />

        <Message>
          <Title id="report-modal-title">신고하기</Title>
          <Description>신고 사유를 입력해주세요.</Description>
        </Message>

        <ReasonInput
          value={reason}
          placeholder="신고 사유를 입력하세요"
          maxLength={200}
          onChange={(event) => setReason(event.target.value)}
          autoFocus
        />

        <Actions>
          <ConfirmButton
            type="button"
            disabled={!reason.trim() || isPending}
            onClick={() => onConfirm(reason.trim())}
          >
            신고
          </ConfirmButton>
          <CancelButton type="button" disabled={isPending} onClick={onCancel}>
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

const ReasonInput = styled.textarea`
  width: 100%;
  margin-top: 1rem;
  padding: 0.75rem;
  border: 1px solid ${COLORS.gray.gray300};
  border-radius: 8px;
  outline: none;
  resize: none;
  height: 6rem;
  color: ${COLORS.text.black};
  ${TEXT_STYLE.body.sm};
  box-sizing: border-box;

  &::placeholder {
    color: ${COLORS.gray.gray400};
  }
`;

const Actions = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 1rem;
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
