export const NAV = [
  { href: "/", label: "ראשי" },
  { href: "/team", label: "צוות" },
  { href: "/month", label: "חודש" },
] as const;

export function activeHref(pathname: string) {
  if (pathname.startsWith("/team") || pathname.startsWith("/instructor")) return "/team";
  if (pathname.startsWith("/month")) return "/month";
  return "/";
}
