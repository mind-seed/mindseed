import { useEffect, useRef } from "react";
import styled from "styled-components";
import { COLORS } from "../style/colors";
import { TEXT_STYLE } from "../style/typography";
import { WarningIcon } from "./Icons/WarningIcon";

type DestructiveConfirmModalProps = {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export const DestructiveConfirmModal = ({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel,
  isPending = false,
  onConfirm,
  onCancel,
}: DestructiveConfirmModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement;
    const timer = window.setTimeout(() => {
      const firstButton = modalRef.current?.querySelector<HTMLElement>(
        "button:not(:disabled)",
      );
      (firstButton ?? modalRef.current)?.focus();
    });

    return () => {
      window.clearTimeout(timer);
      previousFocusRef.current?.focus();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isPending) onCancel();

      if (event.key !== "Tab") return;

      const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
        "button:not(:disabled)",
      );
      if (!focusableElements || focusableElements.length === 0) {
        event.preventDefault();
        modalRef.current?.focus();
        return;
      }

      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isPending, onCancel]);

  if (!isOpen) return null;

  return (
    <Overlay onClick={isPending ? undefined : onCancel}>
      <Modal
        ref={modalRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="destructive-modal-title"
        aria-describedby="destructive-modal-description"
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        <WarningIcon width={48} height={48} color={COLORS.state.error} />

        <Message>
          <Title id="destructive-modal-title">{title}</Title>
          <Description id="destructive-modal-description">{description}</Description>
        </Message>

        <Actions>
          <ConfirmButton
            type="button"
            onClick={onConfirm}
            disabled={isPending}
          >
            {confirmLabel}
          </ConfirmButton>
          <CancelButton type="button" onClick={onCancel} disabled={isPending}>
            {cancelLabel}
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

  &:disabled {
    opacity: 0.4;
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
`;
