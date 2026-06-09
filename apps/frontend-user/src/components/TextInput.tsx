import { styled, css } from "styled-components";
import { useState } from "react";
import { COLORS } from "../style/colors";
import { TEXT_STYLE } from "../style/typography";

type InputProps = {
  name: string;
  value: string;
  status: "normal" | "error";
  placeholder?: string;
  disabled?: boolean;
  description?: string;
  adornmentType?: "icon" | "text" | "none";
  adornmentText?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export const TextInput = ({
  name,
  value,
  status,
  placeholder,
  disabled = false,
  description,
  adornmentType = "none",
  adornmentText,
  onChange,
}: InputProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const handleClick = () => {
    setIsVisible((prev) => !prev);
  };

  return (
    <InputContainer>
      <InputWrapper $status={status} $disabled={disabled}>
        <StyledInput
          type={isVisible ? "text" : "password"}
          name={name}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={onChange}
        />
        {adornmentType === "icon" && (
          <InputButton type="button" onClick={handleClick}>
            {isVisible ? (
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_1556_2403)">
                  <path
                    d="M0.666672 7.99996C0.666672 7.99996 3.33334 2.66663 8.00001 2.66663C12.6667 2.66663 15.3333 7.99996 15.3333 7.99996C15.3333 7.99996 12.6667 13.3333 8.00001 13.3333C3.33334 13.3333 0.666672 7.99996 0.666672 7.99996Z"
                    stroke="#ADADAD"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z"
                    stroke="#ADADAD"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_1556_2403">
                    <rect width="16" height="16" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            ) : (
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_144_626)">
                  <path
                    d="M6.60008 2.82667C7.05897 2.71926 7.52879 2.66557 8.00008 2.66667C12.6667 2.66667 15.3334 8.00001 15.3334 8.00001C14.9287 8.75708 14.4461 9.46983 13.8934 10.1267M9.41341 9.41334C9.23032 9.60984 9.00951 9.76744 8.76418 9.87676C8.51885 9.98607 8.25402 10.0448 7.98548 10.0496C7.71693 10.0543 7.45019 10.0049 7.20115 9.90433C6.95212 9.80374 6.7259 9.65403 6.53598 9.46411C6.34606 9.27419 6.19634 9.04797 6.09575 8.79893C5.99516 8.5499 5.94577 8.28315 5.9505 8.01461C5.95524 7.74607 6.01402 7.48124 6.12333 7.23591C6.23264 6.99057 6.39025 6.76977 6.58675 6.58667M11.9601 11.96C10.8205 12.8287 9.43282 13.3099 8.00008 13.3333C3.33341 13.3333 0.666748 8.00001 0.666748 8.00001C1.49601 6.4546 2.64617 5.10441 4.04008 4.04001L11.9601 11.96Z"
                    stroke="#ADADAD"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M0.666748 0.666656L15.3334 15.3333"
                    stroke="#ADADAD"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_144_626">
                    <rect width="16" height="16" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            )}
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

  ${({ $status, $disabled }) =>
    $status === "normal"
      ? css`
          border: 1px ${COLORS.gray.gray400} solid;
          background: ${$disabled ? COLORS.gray.gray150 : "none"};
        `
      : css`
          border: 1px ${COLORS.state.error} solid;
        `}
`;

const StyledInput = styled.input`
  flex: 1;
  border: none;
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
  border: none;
  background: none;
  cursor: pointer;
`;

const InputText = styled.span`
  color: ${COLORS.gray.gray400};
  ${TEXT_STYLE.label.md};
`;

const InputMessage = styled.span<{
  $status: "normal" | "error";
}>`
  color: ${({ $status }) =>
    $status === "normal" ? COLORS.gray.gray600 : COLORS.state.error};
  ${TEXT_STYLE.body.ti};
`;
