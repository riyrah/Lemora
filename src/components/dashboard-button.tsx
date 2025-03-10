"use client";

import { Button } from "@heroui/react";
import { forwardRef } from "react";
import type { ButtonProps } from "@heroui/react";

export const DashboardButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, color = "primary", ...props }, ref) => {
    return (
      <Button
        {...props}
        ref={ref}
        color={color}
        className={className}
        classNames={{
          base: "font-medium transition-colors focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
          solid: {
            primary: "!bg-[#6D28D9] !text-white hover:!bg-[#5B21B6]",
            secondary: "!bg-[#4F46E5] !text-white hover:!bg-[#4338CA]",
          },
          bordered: {
            primary: "!border-2 !border-[#6D28D9] !text-[#6D28D9] hover:!bg-[#6D28D9]/10",
          },
          light: {
            primary: "!bg-[#6D28D9]/10 !text-[#6D28D9] hover:!bg-[#6D28D9]/20",
          },
          button: "!bg-[#6D28D9] !text-white"
        }}
      />
    );
  }
);

DashboardButton.displayName = "DashboardButton"; 