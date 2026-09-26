"use client";

import type { AnchorHTMLAttributes } from "react";
import { navigate } from "./router";

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string; scroll?: boolean };

export default function Link({ href, onClick, scroll, ...rest }: Props) {
  return (
    <a
      href={`#${href}`}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        e.preventDefault();
        navigate(href, { scroll });
      }}
      {...rest}
    />
  );
}
