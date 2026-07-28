import { styled } from "styled-components";

type FilterButtonProps = {
  onClick: () => void;
};

export const FilterButton = ({ onClick }: FilterButtonProps) => {
  return (
    <Wrapper>
      <Button type="button" onClick={onClick}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16.6668 3.33331H3.3335L8.00016 9.55581C8.21653 9.84431 8.3335 10.1952 8.3335 10.5558V16.6666L11.6668 15V10.5558C11.6668 10.1952 11.7838 9.84431 12.0002 9.55581L16.6668 3.33331Z"
            stroke="black"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
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
