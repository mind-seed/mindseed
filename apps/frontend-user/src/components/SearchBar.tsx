import { styled, css } from "styled-components";
import { COLORS } from "../style/colors";
import { TEXT_STYLE } from "../style/typography";

type SearchBarProps = {
  name?: string;
  value: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch?: (value: string) => void;
};

export const SearchBar = ({
  name,
  value,
  placeholder = "검색어를 입력해주세요",
  onChange,
  onSearch,
}: SearchBarProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch?.(value);
  };

  return (
    <SearchBox>
      <SearchForm action="submit" onSubmit={handleSubmit}>
        <Input
          name={name}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
        />
        <SearchButton type="submit" onClick={() => onSearch?.(value)}>
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6.66667 11.6667C9.244 11.6667 11.3333 9.57737 11.3333 7.00004C11.3333 4.42271 9.244 2.33337 6.66667 2.33337C4.08934 2.33337 2 4.42271 2 7.00004C2 9.57737 4.08934 11.6667 6.66667 11.6667Z"
              stroke="black"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M14 14L10.6667 10.6666"
              stroke="black"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </SearchButton>
      </SearchForm>
    </SearchBox>
  );
};

const SearchBox = styled.div`
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 50px;
  background: ${COLORS.gray.gray100};
`;

const SearchForm = styled.form`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
`;

const Input = styled.input`
  flex: 1;
  border: none;
  background: none;
  ${TEXT_STYLE.body.sm};
  color: ${COLORS.text.black};
  outline: none;
  &::placeholder {
    color: ${COLORS.gray.gray600};
  }
`;

const SearchButton = styled.button`
  width: 1rem;
  height: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  background: none;
  cursor: pointer;
`;
