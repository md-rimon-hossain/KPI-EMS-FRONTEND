"use client";

import { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { useResendVerificationMutation } from "@/store/authApi";
import toast from "react-hot-toast";

export default function EmailVerificationBanner() {
  const { user } = useAppSelector((state) => state.auth);
  const [resendVerification, { isLoading }] = useResendVerificationMutation();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if user is verified or banner is dismissed
  if (!user || user.isEmailVerified || dismissed) {
    return null;
  }

  const handleResend = async () => {
    try {
      const result = await resendVerification().unwrap();
      toast.success(result.message || "Verification email sent successfully!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to send verification email");
    }
  };

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            Email Verification Required
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Your email address is not verified. Please check your inbox for
              the verification email. If you didn't receive it, you can request
              a new one.
            </p>
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={handleResend}
              disabled={isLoading}
              className="text-sm font-medium text-yellow-800 hover:text-yellow-600 underline disabled:opacity-50"
            >
              {isLoading ? "Sending..." : "Resend Verification Email"}
            </button>
          </div>
        </div>
        <div className="ml-auto pl-3">
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="inline-flex text-yellow-400 hover:text-yellow-600"
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
