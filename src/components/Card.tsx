"use client";

import React from "react";
import clsx from "clsx";

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  onClick?: () => void;
}

export default function Card({
  children,
  title,
  subtitle,
  className,
  padding = "md",
  onClick,
}: CardProps) {
  const paddingClasses = {
    none: "",
    sm: "p-2 sm:p-3",
    md: "p-3 sm:p-4 lg:p-6",
    lg: "p-4 sm:p-6 lg:p-8",
  };

  return (
    <div
      className={clsx(
        "bg-white rounded-lg shadow-sm border border-gray-200 transition-all duration-200",
        paddingClasses[padding],
        onClick &&
          "cursor-pointer hover:shadow-md active:shadow-sm active:scale-[0.99]",
        className
      )}
      onClick={onClick}
    >
      {(title || subtitle) && (
        <div className="mb-2 sm:mb-3">
          {title && (
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
              {subtitle}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
