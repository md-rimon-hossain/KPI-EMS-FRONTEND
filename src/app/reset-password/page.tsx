"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useResetPasswordMutation } from "@/store/authApi";
import toast from "react-hot-toast";
import Link from "next/link";
import { GlobeAltIcon } from "@heroicons/react/24/outline";

function ResetPasswordContent() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const [token, setToken] = useState("");
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordReset, setPasswordReset] = useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "bn" : "en";
    i18n.changeLanguage(newLang);
  };

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      toast.error(t("auth.invalidToken"));
    }
  }, [searchParams, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error(t("auth.invalidToken"));
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error(t("auth.passwordsDoNotMatch"));
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error(t("auth.passwordMinLength"));
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
        <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8 relative">
          <button
            onClick={toggleLanguage}
            className="absolute top-4 right-4 p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            title={
              i18n.language === "en" ? "Switch to Bangla" : "Switch to English"
            }
          >
            <GlobeAltIcon className="w-6 h-6" />
          </button>
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
              {t("auth.passwordResetSuccess")}
            </h2>
            <p className="text-gray-600 mb-6">
              {t("auth.passwordResetSuccess")}
            </p>
            <p className="text-sm text-gray-500 mb-8">{t("common.loading")}</p>
            <Link href="/login" className="inline-block btn-primary px-6 py-2">
              {t("auth.backToLogin")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8 relative">
        <button
          onClick={toggleLanguage}
          className="absolute top-4 right-4 p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
          title={
            i18n.language === "en" ? "Switch to Bangla" : "Switch to English"
          }
        >
          <GlobeAltIcon className="w-6 h-6" />
        </button>
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t("auth.resetPasswordTitle")}
          </h1>
          <p className="text-gray-600">{t("auth.enterNewPassword")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t("auth.newPassword")}
            </label>
            <input
              id="newPassword"
              type="password"
              required
              className="input-field"
              placeholder={t("auth.enterNewPassword")}
              value={formData.newPassword}
              onChange={(e) =>
                setFormData({ ...formData, newPassword: e.target.value })
              }
              autoFocus
              minLength={6}
            />
            <p className="mt-1 text-xs text-gray-500">
              {t("auth.passwordMinLength")}
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              {t("auth.confirmPassword")}
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700">
          <div className="text-white text-xl">Loading...</div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
