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
    primary: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-cyan-100 text-cyan-800",
    gray: "bg-gray-100 text-gray-800",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center font-medium rounded-full",
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
