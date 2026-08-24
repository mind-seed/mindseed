import type { SVGProps } from "react";
export const SearchIcon = (props: SVGProps<SVGSVGElement>) => {
  const numericWidth = Number.isNaN(Number(props.width))
    ? 16
    : Number(props.width);
  const computedStrokeWidth = numericWidth > 20 ? 1.8 : 1.4;
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M6.66667 11.6667C9.244 11.6667 11.3333 9.57733 11.3333 7C11.3333 4.42267 9.244 2.33334 6.66667 2.33334C4.08934 2.33334 2 4.42267 2 7C2 9.57733 4.08934 11.6667 6.66667 11.6667Z"
        stroke="currentColor"
        strokeWidth={computedStrokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.0001 14L10.6667 10.6667"
        stroke="currentColor"
        strokeWidth={computedStrokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
