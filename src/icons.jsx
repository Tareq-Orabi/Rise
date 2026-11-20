import React from 'react';

const paths = {
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.7 4.7" /></>,
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  users: <><circle cx="10" cy="8" r="3.3" /><path d="M3.5 20v-2c0-3 2.8-5 6.5-5s6.5 2 6.5 5v2M16 5c4-.5 5 5 .8 6M18 14c2.2.5 3.3 2 3.3 4v1" /></>,
  case: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M3 11c5 3 13 3 18 0m-9 1v3" /></>,
  checklist: <><path d="m3 6 1.5 1.5L7 4m-4 10 1.5 1.5L7 12m4-6h9m-9 8h9m-9 5h6" /></>,
  target: <><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r=".7" /></>,
  chevron: <path d="m14 6-6 6 6 6" />,

  arrow: (
    <>
      <path d="M19 12H5m6 6-6-6 6-6" />
    </>
  ),
  back: <path d="M5 12h14m-6-6 6 6-6 6" />,
  outward: <path d="M18 18 6 6m0 10V6h10" />,
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="2" />
      <path d="M7.5 3v4m9-4v4m-13 3h17m-12 5h2" />
    </>
  ),
  book: (
    <>
      <path d="M12 5c-2.8-2-6-2-9-1v14c3-1 6.2-1 9 1 2.8-2 6-2 9-1V4c-3-1-6.2-1-9 1Zm0 0v14" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5m-18 4 9 5 9-5" />
    </>
  ),
  board: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M7 9h4m-4 4h2m5-5v8" />
    </>
  ),
  screen: (
    <>
      <rect x="3" y="3.8" width="18" height="13" rx="2" />
      <path d="M12 17v3.3m-5 0h10M7 7.5h.1m2.8 0h.1" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="5.8" rx="8" ry="3.2" />
      <path d="M4 6v12c0 1.8 3.6 3.2 8 3.2s8-1.4 8-3.2V6M4 12c0 1.8 3.6 3.2 8 3.2s8-1.4 8-3.2" />
    </>
  ),
  spark: (
    <>
      <path d="m12 3 2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2L12 3Z" />
      <path d="M19 2v4m-2-2h4" />
    </>
  ),
  menu: <path d="M3 6h18M3 12h18M3 18h18" />,
  close: <path d="m5 5 14 14M19 5 5 19" />,
  moon: <path d="M20.2 15.6A8.5 8.5 0 0 1 8.4 3.8 8.5 8.5 0 1 0 20.2 15.6Z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  check: <path d="m4.5 12 5 5L20 6.5" />,
  document: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v5h4M9 12h6m-6 4h6" />
    </>
  ),
};
export function Icon({ name, size = 20, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
