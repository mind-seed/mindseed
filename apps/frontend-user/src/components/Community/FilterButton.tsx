import { styled } from "styled-components";
import { FilterIcon } from "../Icons/FilterIcon";

type FilterButtonProps = {
  onClick: () => void;
};

export const FilterButton = ({ onClick }: FilterButtonProps) => {
  return (
    <Wrapper>
      <Button type="button" onClick={onClick} aria-label="필터">
        <FilterIcon />
      </Button>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Button = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  background: none;
  cursor: pointer;
`;
