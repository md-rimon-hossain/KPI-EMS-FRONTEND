"use client";

import { useState, useEffect } from "react";
import {
  useSendGmailVerificationCodeMutation,
  useVerifyGmailCodeMutation,
} from "@/store/userApi";
import Button from "@/components/Button";
import Input from "@/components/Input";
import toast from "react-hot-toast";

interface GmailVerificationProps {
  email: string;
  onVerified: () => void;
  onEmailChange?: (email: string) => void;
}

export default function GmailVerification({
  email,
  onVerified,
  onEmailChange,
}: GmailVerificationProps) {
  const [sendCode, { isLoading: isSending }] =
    useSendGmailVerificationCodeMutation();
  const [verifyCode, { isLoading: isVerifying }] = useVerifyGmailCodeMutation();

  const [verificationCode, setVerificationCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isVerified, setIsVerified] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeRemaining]);

  const handleSendCode = async () => {
    if (!email || !email.endsWith("@gmail.com")) {
      toast.error("Please enter a valid Gmail address");
      return;
    }

    try {
      const result = await sendCode({ email }).unwrap();
      setCodeSent(true);
      setTimeRemaining(result.data.expiresIn);
      toast.success(result.message || "Verification code sent to Gmail!");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to send verification code");
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error("Please enter the 6-digit verification code");
      return;
    }

    try {
      const result = await verifyCode({
        email,
        code: verificationCode,
      }).unwrap();
      setIsVerified(true);
      toast.success(result.message || "Gmail verified successfully!");
      onVerified();
    } catch (error: any) {
      toast.error(
        error?.data?.message || "Invalid or expired verification code"
      );
      setVerificationCode("");
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isVerified) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <div className="flex items-center">
          <svg
            className="h-5 w-5 text-green-600 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="text-green-800 font-medium">
            Gmail verified successfully!
          </span>
        </div>
        <p className="text-green-700 text-sm mt-1">{email}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Gmail Address <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <Input
            type="email"
            value={email}
            onChange={(e) => onEmailChange && onEmailChange(e.target.value)}
            placeholder="employee@gmail.com"
            disabled={codeSent}
            required
          />
          <Button
            type="button"
            onClick={handleSendCode}
            disabled={isSending || codeSent || !email}
            variant="secondary"
            className="whitespace-nowrap"
          >
            {isSending ? "Sending..." : codeSent ? "Code Sent" : "Send Code"}
          </Button>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Only Gmail addresses are allowed. A verification code will be sent to
          this address.
        </p>
      </div>

      {codeSent && !isVerified && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-start">
            <svg
              className="h-5 w-5 text-blue-600 mt-0.5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-blue-800 font-medium">
                Verification code sent!
              </p>
              <p className="text-blue-700 text-sm mt-1">
                Check the Gmail inbox for <strong>{email}</strong> and enter the
                6-digit code below.
              </p>
              {timeRemaining > 0 && (
                <p className="text-blue-600 text-sm mt-1">
                  Code expires in: <strong>{formatTime(timeRemaining)}</strong>
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Input
              type="text"
              value={verificationCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                setVerificationCode(value);
              }}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="text-center text-2xl font-mono tracking-widest"
            />
            <Button
              type="button"
              onClick={handleVerifyCode}
              disabled={isVerifying || verificationCode.length !== 6}
              variant="primary"
            >
              {isVerifying ? "Verifying..." : "Verify"}
            </Button>
          </div>

          {timeRemaining === 0 && (
            <button
              type="button"
              onClick={() => {
                setCodeSent(false);
                setVerificationCode("");
              }}
              className="text-blue-600 hover:text-blue-800 text-sm mt-2 underline"
            >
              Resend verification code
            </button>
          )}
        </div>
      )}
    </div>
  );
}
