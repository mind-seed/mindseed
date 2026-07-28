import type { SVGProps } from "react";

export const MissionIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    {...props}
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.8" />
    <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="2" />
  </svg>
);
