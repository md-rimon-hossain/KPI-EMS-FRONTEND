"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useLoginMutation } from "@/store/authApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCredentials } from "@/store/authSlice";
import toast from "react-hot-toast";
import { GlobeAltIcon } from "@heroicons/react/24/outline";

export default function LoginPage() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [login, { isLoading }] = useLoginMutation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await login(formData).unwrap();
      dispatch(
        setCredentials({
          user: result.data.user,
          accessToken: result.data.accessToken,
          refreshToken: result.data.refreshToken,
        })
      );
      toast.success(t("auth.loginSuccess"));
      router.push("/dashboard");
    } catch (error: any) {
      const errorMessage = error?.data?.message || t("auth.loginButton");
      toast.error(errorMessage);

      // Show additional info if email not verified
      if (error?.status === 403 && errorMessage.includes("verify")) {
        toast.error(t("auth.verifyEmail"), {
          duration: 5000,
        });
      }
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "bn" : "en";
    i18n.changeLanguage(newLang);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 px-3 sm:px-4 py-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 relative fade-in">
        {/* Language Switcher - Mobile Optimized */}
        <button
          onClick={toggleLanguage}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 tap-target p-1.5 sm:p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-95"
          title={
            i18n.language === "en" ? "Switch to Bangla" : "Switch to English"
          }
        >
          <GlobeAltIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Header - Compact Mobile */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg mb-3 sm:mb-4">
            <span className="text-2xl sm:text-3xl font-bold text-white">
              EMS
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            {t("dashboard.title")}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600">
            {t("dashboard.subtitle")}
          </p>
        </div>

        {/* Form - Mobile Optimized */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2"
            >
              {t("auth.email")}
            </label>
            <input
              id="email"
              type="email"
              required
              className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder={t("auth.emailPlaceholder")}
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1.5 sm:mb-2"
            >
              {t("auth.password")}
            </label>
            <input
              id="password"
              type="password"
              required
              className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder={t("auth.passwordPlaceholder")}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          {/* Remember & Forgot - Compact Mobile */}
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember"
                className="ml-1.5 sm:ml-2 text-gray-700 font-medium"
              >
                {t("auth.rememberMe")}
              </label>
            </div>
            <a
              href="/forgot-password"
              className="text-blue-600 hover:text-blue-700 font-semibold active:scale-95 transition-all"
            >
              {t("auth.forgotPassword")}
            </a>
          </div>

          {/* Login Button - Mobile Optimized */}
          <button
            type="submit"
            disabled={isLoading}
            className="tap-target w-full px-4 py-3 sm:py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm sm:text-base lg:text-lg font-bold rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? `${t("auth.loginButton")}...` : t("auth.loginButton")}
          </button>
        </form>

        {/* Demo Credentials - Compact */}
        <div className="mt-4 sm:mt-6 text-center">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200">
            <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-1">
              Default Super Admin:
            </p>
            <p className="text-xs sm:text-sm font-mono text-blue-600 font-semibold">
              admin@college.com
            </p>
            <p className="text-xs sm:text-sm font-mono text-blue-600 font-semibold">
              admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
