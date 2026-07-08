import type { AnchorHTMLAttributes, ReactNode } from "react";

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

/** Storybook-only stand-in for next-intl's `Link` (which needs the Next router). */
export function Link({ href, children, ...rest }: LinkProps) {
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}

export function redirect(_href: string): never {
  throw new Error("redirect is not available in Storybook");
}

export function usePathname(): string {
  return "/";
}

export function useRouter() {
  return { push() {}, replace() {}, back() {}, forward() {}, refresh() {} };
}

export function getPathname(_params?: { href: string }): string {
  return "/";
}

export type { ReactNode };
