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

/** Storybook-only mutable pathname so nav components can show an active tab. */
let mockPathname = "/";
export function setMockPathname(value: string): void {
  mockPathname = value;
}

export function usePathname(): string {
  return mockPathname;
}

export function useRouter() {
  return {
    push(_href: string, _opts?: unknown) {},
    replace(_href: string, _opts?: unknown) {},
    back() {},
    forward() {},
    refresh() {},
    prefetch() {},
  };
}

export function getPathname(_params?: { href: string }): string {
  return "/";
}

export type { ReactNode };
