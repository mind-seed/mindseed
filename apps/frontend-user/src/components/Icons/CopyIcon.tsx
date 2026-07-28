import type { SVGProps } from "react";
export const CopyIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    {...props}
  >
    <rect
      x="9"
      y="3"
      width="11"
      height="15"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M15 21H5C4.448 21 4 20.552 4 20V7"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);
