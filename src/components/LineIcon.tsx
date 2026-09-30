import type { ReactNode, SVGProps } from "react";

export type IconName = "personal" | "foreigner" | "wedding" | "business" | "education" | "calculator" | "arrow" | "pin" | "phone" | "mail" | "clock" | "shield" | "check" | "menu" | "close";
const paths: Record<IconName, ReactNode> = {
  personal: <><path d="M3 10.5 12 3l9 7.5V21H3Z"/><path d="M9 21v-7h6v7M7 10h.01M17 10h.01"/></>,
  foreigner: <><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><path d="M3 12h18M5 6.5h14M5 17.5h14"/></>,
  wedding: <><circle cx="8" cy="15" r="6"/><circle cx="16" cy="15" r="6"/><path d="m12 7-3-3 1.5-2h3L15 4Z"/></>,
  business: <><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V3h8v4M3 12a24 24 0 0 0 18 0M10 13h4v3h-4Z"/></>,
  education: <><path d="m2 8 10-5 10 5-10 5ZM6 10v7c3 3 9 3 12 0v-7M22 8v9"/></>,
  calculator: <><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 5h8v4H8ZM8 13h1m6 0h1m-8 4h1m3-4h.01M12 17h.01M16 17v2"/></>,
  arrow: <path d="M4 12h16m-6-6 6 6-6 6"/>,
  pin: <><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
  phone: <path d="M7 3H3c0 10 8 18 18 18v-4l-5-2-2 2a16 16 0 0 1-7-7l2-2Z"/>,
  mail: <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 5 10 8L22 5"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></>,
  shield: <><path d="m12 2 9 4v6c0 6-9 10-9 10S3 18 3 12V6Z"/><path d="m8 12 3 3 5-6"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  menu: <path d="M4 6h16M4 12h16M4 18h16"/>,
  close: <path d="m6 6 12 12M18 6 6 18"/>,
};
export function LineIcon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>{paths[name]}</svg>;
}
