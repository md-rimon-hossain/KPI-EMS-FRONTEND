"use client";

import React, { useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <>
      {/* Backdrop with fade-in animation */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 overflow-y-auto pointer-events-none">
        {/* Modal - Desktop: Centered, Mobile: Bottom Sheet */}
        <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
          <div
            className={clsx(
              "relative bg-white shadow-2xl w-full modal-transition gpu-accelerated pointer-events-auto",
              "rounded-t-2xl sm:rounded-lg",
              "max-h-[90vh] overflow-hidden",
              sizes[size]
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Swipe Indicator */}
            <div className="swipe-indicator sm:hidden" />

            {/* Header - Compact on Mobile */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between p-3 sm:p-4 lg:p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                {title && (
                  <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate pr-2">
                    {title}
                  </h3>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="tap-target p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all active:scale-95"
                  >
                    <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                )}
              </div>
            )}

            {/* Content - Compact on Mobile with Smooth Scroll */}
            <div className="p-3 sm:p-4 lg:p-6 overflow-y-auto smooth-scroll max-h-[calc(90vh-120px)]">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Confirmation Modal Component
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  loading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
}: ConfirmModalProps) {
  const variantClasses = {
    danger: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    warning: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
    info: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="text-center">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
          {title}
        </h3>
        <div className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
          {message}
        </div>
        <div className="flex gap-2 sm:gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={loading}
            className="tap-target flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm sm:text-base text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-lg font-semibold transition-all active:scale-95 disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={clsx(
              "tap-target flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm sm:text-base text-white rounded-lg font-semibold transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 shadow-sm",
              variantClasses[variant]
            )}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
