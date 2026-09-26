import { CalendarCheck2, LayoutGrid, ReceiptText, Users, Zap, type LucideIcon } from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV: NavItem[] = [
  { href: "/", label: "ראשי", icon: LayoutGrid },
  { href: "/activity", label: "פעילות", icon: Zap },
  { href: "/instructors", label: "מדריכים", icon: Users },
  { href: "/receipts", label: "קבלות", icon: ReceiptText },
  { href: "/close", label: "סגירת חודש", icon: CalendarCheck2 },
];

export const isActive = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href);
