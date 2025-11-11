"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useResetPasswordMutation } from "@/store/authApi";
import toast from "react-hot-toast";
import Link from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const [token, setToken] = useState("");
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordReset, setPasswordReset] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      toast.error("Invalid reset link");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error("Invalid reset token");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      const result = await resetPassword({
        token,
        newPassword: formData.newPassword,
      }).unwrap();
      toast.success(result.message || "Password reset successfully!");
      setPasswordReset(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || "Failed to reset password. Please try again.";
      toast.error(errorMessage);
    }
  };

  if (passwordReset) {
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Password Reset Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Your password has been reset successfully. You can now login with
              your new password.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Redirecting to login page...
            </p>
            <Link href="/login" className="inline-block btn-primary px-6 py-2">
              Go to Login
            </Link>
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
            Reset Password
          </h1>
          <p className="text-gray-600">Enter your new password below.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              required
              className="input-field"
              placeholder="Enter new password"
              value={formData.newPassword}
              onChange={(e) =>
                setFormData({ ...formData, newPassword: e.target.value })
              }
              autoFocus
              minLength={6}
            />
            <p className="mt-1 text-xs text-gray-500">
              Must be at least 6 characters long
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              className="input-field"
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
              minLength={6}
            />
          </div>

          {formData.newPassword &&
            formData.confirmPassword &&
            formData.newPassword !== formData.confirmPassword && (
              <p className="text-sm text-red-600">Passwords do not match</p>
            )}

          <button
            type="submit"
            disabled={isLoading || !token}
            className="w-full btn-primary py-3 text-lg font-semibold"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
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
