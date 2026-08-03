import { useRef } from "react";
import { styled } from "styled-components";
import { COLORS } from "../../style/colors";
import { TEXT_STYLE } from "../../style/typography";

type VerificationCodeInputProps = {
  value: string;
  onChange: (value: string) => void;
};

const CODE_LENGTH = 6;

export const VerificationCodeInput = ({
  value,
  onChange,
}: VerificationCodeInputProps) => {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus();
  };

  const handleChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const digit = event.target.value.replace(/\D/g, "").slice(-1);
    if (!digit) return;

    const nextValue = `${value.slice(0, index)}${digit}${value.slice(index + 1)}`;
    onChange(nextValue.slice(0, CODE_LENGTH));
    focusInput(Math.min(index + 1, CODE_LENGTH - 1));
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace") {
      event.preventDefault();

      if (value[index]) {
        onChange(`${value.slice(0, index)}${value.slice(index + 1)}`);
        return;
      }

      if (index > 0) {
        onChange(`${value.slice(0, index - 1)}${value.slice(index)}`);
        focusInput(index - 1);
      }
    }

    if (event.key === "ArrowLeft" && index > 0) focusInput(index - 1);
    if (event.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      focusInput(Math.min(index + 1, value.length));
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    const pastedCode = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LENGTH);

    onChange(pastedCode);
    focusInput(Math.min(pastedCode.length, CODE_LENGTH - 1));
  };

  return (
    <CodeContainer>
      <CodeFields onPaste={handlePaste}>
        {Array.from({ length: CODE_LENGTH }, (_, index) => (
          <CodeInput
            key={index}
            ref={(element) => {
              inputRefs.current[index] = element;
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={value[index] ?? ""}
            autoFocus={index === 0}
            onFocus={(event) => event.currentTarget.select()}
            onChange={(event) => handleChange(index, event)}
            onKeyDown={(event) => handleKeyDown(index, event)}
          />
        ))}
      </CodeFields>
    </CodeContainer>
  );
};

const CodeContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const CodeFields = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0.625rem;
  padding: 0 1rem;
`;

const CodeInput = styled.input`
  width: 100%;
  height: 42px;
  border: none;
  border-bottom: 1px solid ${COLORS.gray.gray400};
  background: transparent;
  color: ${COLORS.text.black};
  ${TEXT_STYLE.body.md};
  text-align: center;
  outline: none;

  &:focus {
    border-bottom-color: ${COLORS.main.main};
  }
`;
