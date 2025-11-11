"use client";

import { useEffect, useState } from "react";
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";

export type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

function ToastItem({ toast, onClose }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onClose(toast.id), 300);
    }, toast.duration || 3000);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const icons = {
    success: <CheckCircleIcon className="w-5 h-5 text-green-600" />,
    error: <XCircleIcon className="w-5 h-5 text-red-600" />,
    warning: <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />,
    info: <InformationCircleIcon className="w-5 h-5 text-blue-600" />,
  };

  const bgColors = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    warning: "bg-yellow-50 border-yellow-200",
    info: "bg-blue-50 border-blue-200",
  };

  return (
    <div
      className={`
        flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border-2 shadow-lg
        transition-all duration-300 gpu-accelerated
        ${bgColors[toast.type]}
        ${
          isExiting ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"
        }
      `}
    >
      <div className="flex-shrink-0">{icons[toast.type]}</div>
      <p className="flex-1 text-xs sm:text-sm font-semibold text-gray-900 min-w-0">
        {toast.message}
      </p>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => onClose(toast.id), 300);
        }}
        className="flex-shrink-0 tap-target p-1 hover:bg-white/50 rounded-lg transition-colors active:scale-95"
      >
        <XMarkIcon className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export default function ToastContainer({
  toasts,
  onClose,
}: ToastContainerProps) {
  return (
    <div className="fixed top-16 sm:top-20 right-2 sm:right-4 z-50 space-y-2 max-w-[calc(100vw-1rem)] sm:max-w-md pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
}

// Toast hook for easy usage
let toastId = 0;
let listeners: ((toasts: Toast[]) => void)[] = [];
let currentToasts: Toast[] = [];

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const updateToasts = (newToasts: Toast[]) => {
      setToasts(newToasts);
    };
    listeners.push(updateToasts);
    return () => {
      listeners = listeners.filter((l) => l !== updateToasts);
    };
  }, []);

  const showToast = (message: string, type: ToastType, duration = 3000) => {
    const id = `toast-${toastId++}`;
    const newToast = { id, message, type, duration };
    currentToasts = [...currentToasts, newToast];
    listeners.forEach((listener) => listener(currentToasts));
  };

  const closeToast = (id: string) => {
    currentToasts = currentToasts.filter((t) => t.id !== id);
    listeners.forEach((listener) => listener(currentToasts));
  };

  return {
    toasts,
    showToast,
    closeToast,
    success: (message: string, duration?: number) =>
      showToast(message, "success", duration),
    error: (message: string, duration?: number) =>
      showToast(message, "error", duration),
    warning: (message: string, duration?: number) =>
      showToast(message, "warning", duration),
    info: (message: string, duration?: number) =>
      showToast(message, "info", duration),
  };
}
