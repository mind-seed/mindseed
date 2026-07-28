import type { SVGProps } from "react";

export const EyeIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
    {...props}
  >
    <path
      d="M0.666672 8C0.666672 8 3.33334 2.66667 8.00001 2.66667C12.6667 2.66667 15.3333 8 15.3333 8C15.3333 8 12.6667 13.3333 8.00001 13.3333C3.33334 13.3333 0.666672 8 0.666672 8Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

export const EyeOffIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
    {...props}
  >
    <path
      d="M6.6 2.82667C7.05889 2.71926 7.52871 2.66557 8 2.66667C12.6667 2.66667 15.3333 8 15.3333 8C14.9286 8.75707 14.446 9.46982 13.8933 10.1267M9.41333 9.41333C9.23024 9.60983 9.00943 9.76743 8.7641 9.87675C8.51877 9.98606 8.25394 10.0448 7.9854 10.0496C7.71685 10.0543 7.45011 10.0049 7.20107 9.90432C6.95204 9.80373 6.72582 9.65402 6.5359 9.4641M11.96 11.96C10.8204 12.8287 9.43274 13.3099 8 13.3333C3.33333 13.3333 0.666667 8 0.666667 8C1.49593 6.45459 2.64609 5.1044 4.04 4.04L11.96 11.96Z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M0.666667 0.666667L15.3333 15.3333"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);
