"use client";

import { useState } from "react";
import { useForgotPasswordMutation } from "@/store/authApi";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      const result = await forgotPassword({ email }).unwrap();
      toast.success(
        result.message || "Password reset link sent to your email!"
      );
      setEmailSent(true);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || "Failed to send reset link. Please try again.";
      toast.error(errorMessage);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Check Your Email
            </h2>
            <p className="text-gray-600 mb-6">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-8">
              If you don't see the email, check your spam folder or try again.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setEmailSent(false)}
                className="w-full btn-secondary py-2"
              >
                Send Again
              </button>
              <Link
                href="/login"
                className="block w-full text-center py-2 text-primary-600 hover:text-primary-500 font-medium"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Forgot Password?
          </h1>
          <p className="text-gray-600">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              className="input-field"
              placeholder="admin@college.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-3 text-lg font-semibold"
          >
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>

          <div className="text-center">
            <Link
              href="/login"
              className="text-sm text-primary-600 hover:text-primary-500 font-medium"
            >
              ← Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
