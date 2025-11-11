"use client";

import React from "react";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  text?: string;
}

export default function Loading({
  size = "md",
  fullScreen = false,
  text,
}: LoadingProps) {
  const sizes = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 ${sizes[size]}`}
      ></div>
      {text && <p className="text-gray-600 text-sm">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}

export function LoadingOverlay({ text }: { text?: string }) {
  return (
    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
      <Loading size="md" text={text} />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="border-b border-gray-200 py-4">
          <div className="flex gap-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/5"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
