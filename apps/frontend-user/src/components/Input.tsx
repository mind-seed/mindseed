import { styled, css } from "styled-components";
import { useState } from "react";
import { COLORS } from "../style/colors";
import { TEXT_STYLE } from "../style/typography";

type InputProps = {
  status: "normal" | "error";
  iconOn: boolean;
  placeholder: string;
  description?: string;
};

export const Input = ({
  status,
  iconOn,
  placeholder,
  description,
}: InputProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const handleClick = () => {
    setIsVisible((prev) => !prev);
  };

  return (
    <InputContainer>
      <InputWrapper $status={status}>
        <StyledInput
          type={isVisible ? "text" : "password"}
          placeholder={placeholder}
        />
        {iconOn && (
          <InputButton onClick={handleClick}>
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
                  stroke-width="1.4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M8 10C9.10457 10 10 9.10457 10 8C10 6.89543 9.10457 6 8 6C6.89543 6 6 6.89543 6 8C6 9.10457 6.89543 10 8 10Z"
                  stroke="#ADADAD"
                  stroke-width="1.4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </g>
              <defs>
                <clipPath id="clip0_1556_2403">
                  <rect width="16" height="16" fill="white" />
                </clipPath>
              </defs>
            </svg>
          </InputButton>
        )}
      </InputWrapper>
      {description?.trim() && (
        <InputMessage $status={status}>{description}</InputMessage>
      )}
    </InputContainer>
  );
};

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
`;

const InputWrapper = styled.div<{
  $status: "normal" | "error";
}>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-radius: 12px;

  ${({ $status }) =>
    $status === "normal"
      ? css`
          border: 1px ${COLORS.gray.gray400} solid;
        `
      : css`
          border: 1px ${COLORS.state.error} solid;
        `}
`;

const StyledInput = styled.input`
  flex: 1;
  border: none;
  ${TEXT_STYLE.label.md};
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
  cursor: pointer;
`;

const InputMessage = styled.span<{
  $status: "normal" | "error";
}>`
  color: ${({ $status }) =>
    $status === "normal" ? COLORS.gray.gray600 : COLORS.state.error};
  ${TEXT_STYLE.body.ti};
`;
