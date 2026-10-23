import type { SVGProps } from "react";
export const CheckIcon = ({
  width = 16,
  ...props
}: SVGProps<SVGSVGElement>) => {
  const numericWidth = Number(width) || 16;
  const computedStrokeWidth = numericWidth > 20 ? 1.8 : 1.4;
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M20 7L10 17L5 12"
        stroke="currentColor"
        strokeWidth={computedStrokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
