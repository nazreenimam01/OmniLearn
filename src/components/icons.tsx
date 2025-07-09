import type {SVGProps} from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M4 19.5a2.5 2.5 0 0 1 5 0" />
      <path d="M6.5 12H20" />
      <path d="M6.5 12C6.5 8.68629 9.18629 6 12.5 6C15.8137 6 18.5 8.68629 18.5 12" />
      <path d="M12.5 6L14 3" />
      <path d="M11 3L9.5 6" />
      <path d="M18.5 12V19.5" />
    </svg>
  );
}
