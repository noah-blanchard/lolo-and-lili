"use client";

import type { ReactNode } from "react";
import { Drawer } from "vaul";
import { cn } from "@/lib/utils";

interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  className?: string;
}

/** Mobile-native bottom sheet built on vaul, styled cute. */
export function Sheet({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  children,
  className,
}: SheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      {trigger ? <Drawer.Trigger asChild>{trigger}</Drawer.Trigger> : null}
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Drawer.Content
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 mt-24 flex flex-col rounded-t-[2rem] bg-background",
            "pb-safe outline-none",
            className,
          )}
        >
          <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-border" />
          <div className="flex flex-col gap-1 p-6">
            {title ? (
              <Drawer.Title className="font-display text-xl font-semibold">
                {title}
              </Drawer.Title>
            ) : null}
            {description ? (
              <Drawer.Description className="text-sm text-muted">
                {description}
              </Drawer.Description>
            ) : null}
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
