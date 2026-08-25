import { styled } from "styled-components";
import { COLORS } from "../style/colors";
import { TEXT_STYLE } from "../style/typography";
import { SearchIcon } from "./Icons/SearchIcon";

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
  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing && onSearch) {
      onSearch(value);
    }
  };
  return (
    <SearchBox>
      <Input
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onKeyDown={handleEnter}
      />
      <SearchButton type="button" onClick={() => onSearch?.(value)}>
        <SearchIcon color={COLORS.text.black} />
      </SearchButton>
    </SearchBox>
  );
};

const SearchBox = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  padding: 0.75rem 1rem;
  border-radius: 50px;
  background: ${COLORS.gray.gray100};
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
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
`;
