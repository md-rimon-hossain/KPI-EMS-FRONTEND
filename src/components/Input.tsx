"use client";

import React from "react";
import clsx from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export default function Input({
  label,
  error,
  helperText,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1"
        >
          {label}
          {props.required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={clsx(
          "w-full px-2.5 py-2 sm:px-3 sm:py-2.5 text-sm sm:text-base border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 min-h-[40px] sm:min-h-[44px]",
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
            : "border-gray-300 focus:border-blue-500",
          props.disabled && "bg-gray-100 cursor-not-allowed opacity-60",
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs sm:text-sm text-red-600 font-medium">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-xs sm:text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}
