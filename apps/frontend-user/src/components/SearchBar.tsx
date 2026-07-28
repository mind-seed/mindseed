import { styled } from "styled-components";
import { COLORS } from "../style/colors";
import { TEXT_STYLE } from "../style/typography";
import { SearchIcon } from "./Icons/SearchIcon";

type SearchBarProps = {
  name?: string;
  value: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearch: (value: string) => void;
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
    onSearch(value);
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
        <SearchButton type="submit" aria-label="검색">
          <SearchIcon width="100%" height="100%" />
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
