"use client";

import React from "react";
import clsx from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "success" | "warning" | "danger" | "info" | "gray";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Badge({
  children,
  variant = "primary",
  size = "md",
  className,
}: BadgeProps) {
  const variants = {
    primary: "bg-blue-100 text-blue-800 border border-blue-200",
    success: "bg-green-100 text-green-800 border border-green-200",
    warning: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    danger: "bg-red-100 text-red-800 border border-red-200",
    info: "bg-cyan-100 text-cyan-800 border border-cyan-200",
    gray: "bg-gray-100 text-gray-800 border border-gray-200",
  };

  const sizes = {
    sm: "px-1.5 py-0.5 text-[10px] sm:text-xs",
    md: "px-2 py-0.5 sm:px-2.5 sm:py-1 text-xs sm:text-sm",
    lg: "px-2.5 py-1 sm:px-3 sm:py-1.5 text-sm sm:text-base",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center font-semibold rounded-full whitespace-nowrap",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}

// Helper function to get badge variant based on status
export function getStatusBadgeVariant(
  status: string
): "success" | "warning" | "danger" | "info" | "gray" {
  const statusMap: Record<
    string,
    "success" | "warning" | "danger" | "info" | "gray"
  > = {
    pending: "warning",
    approved_by_chief: "info",
    approved: "success",
    rejected: "danger",
    active: "success",
    inactive: "gray",
  };

  return statusMap[status.toLowerCase()] || "gray";
}
