import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";

type IconButtonProps = Omit<ComponentProps<typeof Button>, "aria-label" | "size"> & {
  "aria-label": string;
  size?: "icon" | "icon-xs" | "icon-sm" | "icon-lg";
};

export function IconButton({ children, size = "icon", ...props }: IconButtonProps) {
  return (
    <Button size={size} {...props}>
      {children}
    </Button>
  );
}
