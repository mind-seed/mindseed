import { useState } from "react";
import { css, styled } from "styled-components";
import { COLORS } from "../style/colors";
import { TEXT_STYLE } from "../style/typography";
import { EyeIcon, EyeOffIcon } from "./Icons/EyeIcon";

type InputProps = {
  name: string;
  value: string;
  type?: "text" | "email" | "password";
  status: "normal" | "error";
  placeholder?: string;
  disabled?: boolean;
  description?: string;
  adornmentType?: "icon" | "text" | "none";
  adornmentText?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export const TextInput = ({
  name,
  value,
  type = "text",
  status,
  placeholder,
  disabled = false,
  description,
  adornmentType = "none",
  adornmentText,
  onChange,
}: InputProps) => {
  const [isVisible, setIsVisible] = useState(type !== "password");
  return (
    <InputContainer>
      <InputWrapper $status={status} $disabled={disabled}>
        <StyledInput
          id={name}
          type={type === "password" && isVisible ? "text" : type}
          name={name}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={onChange}
        />
        {adornmentType === "icon" && (
          <InputButton
            type="button"
            onClick={() => setIsVisible((current) => !current)}
            aria-label={isVisible ? "비밀번호 숨기기" : "비밀번호 보기"}
          >
            {isVisible ? <EyeIcon /> : <EyeOffIcon />}
          </InputButton>
        )}
        {adornmentType === "text" && adornmentText && (
          <InputText>{adornmentText}</InputText>
        )}
      </InputWrapper>
      {description?.trim() && (
        <InputMessage $status={status}>{description}</InputMessage>
      )}
    </InputContainer>
  );
};

const InputContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
`;
const InputWrapper = styled.div<{
  $status: "normal" | "error";
  $disabled?: boolean;
}>`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 1rem 1.25rem;
  border-radius: 12px;
  background: ${COLORS.gray.gray100};
  ${({ $status, $disabled }) =>
    $status === "normal"
      ? css`
          ${$disabled && `background:${COLORS.gray.gray150}`};
        `
      : css`
          border: 1px ${COLORS.state.error} solid;
        `}
`;
const StyledInput = styled.input`
  flex: 1;
  border: none;
  background: none;
  ${TEXT_STYLE.label.md};
  color: ${COLORS.text.black};
  outline: none;
  &::placeholder {
    color: ${COLORS.gray.gray400};
    ${TEXT_STYLE.label.md};
  }
`;
const InputButton = styled.button`
  width: 1rem;
  height: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  border: none;
  background: none;
  color: ${COLORS.gray.gray400};
  cursor: pointer;
`;
const InputText = styled.span`
  color: ${COLORS.gray.gray400};
  ${TEXT_STYLE.label.md};
`;
const InputMessage = styled.span<{ $status: "normal" | "error" }>`
  color: ${({ $status }) =>
    $status === "normal" ? COLORS.gray.gray600 : COLORS.state.error};
  ${TEXT_STYLE.body.ti};
`;
