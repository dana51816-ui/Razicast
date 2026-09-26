/* Stroke icons drawn for this product; 24×24, currentColor. */
type P = { className?: string; strokeWidth?: number };
const base = (p: P) => ({
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: p.strokeWidth ?? 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: p.className,
  "aria-hidden": true,
});

export const IconHome = (p: P) => (<svg {...base(p)}><path d="M4 16h16M4 10h10M4 4h16M4 22h7" /></svg>);
export const IconTeam = (p: P) => (<svg {...base(p)}><circle cx="8" cy="9" r="4" /><circle cx="17" cy="15" r="3" /></svg>);
export const IconMonth = (p: P) => (<svg {...base(p)}><rect x="4" y="5" width="16" height="16" rx="3" /><path d="M4 10h16M9 3v4M15 3v4" /></svg>);
export const IconPlus = (p: P) => (<svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>);
export const IconClose = (p: P) => (<svg {...base(p)}><path d="M6 6l12 12M18 6L6 18" /></svg>);
export const IconBack = (p: P) => (<svg {...base(p)}><path d="M9 6l6 6-6 6" /></svg>);
export const IconNext = (p: P) => (<svg {...base(p)}><path d="M15 6l-6 6 6 6" /></svg>);
export const IconCheck = (p: P) => (<svg {...base(p)}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>);
export const IconChevronDown = (p: P) => (<svg {...base(p)}><path d="M6 9l6 6 6-6" /></svg>);
export const IconActivity = (p: P) => (<svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>);
export const IconPersonAdd = (p: P) => (<svg {...base(p)}><circle cx="11" cy="9" r="4" /><path d="M4 20c1.4-3.4 3.8-5 7-5 1.6 0 3 .4 4.2 1.2M18 15v6M15 18h6" /></svg>);
export const IconFramework = (p: P) => (<svg {...base(p)}><path d="M4 20V9l8-5 8 5v11" /><path d="M9 20v-6h6v6" /></svg>);
export const IconLock = (p: P) => (<svg {...base(p)}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>);
export const IconMinus = (p: P) => (<svg {...base(p)}><path d="M5 12h14" /></svg>);
