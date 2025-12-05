"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useLoginMutation } from "@/store/authApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCredentials } from "@/store/authSlice";
import toast from "react-hot-toast";
import {
  GlobeAltIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  BeakerIcon,
  CheckCircleIcon,
  LockClosedIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/outline";

export default function LoginPage() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [login, { isLoading }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);

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
      const errorMessage = error?.data?.message || t("auth.loginError");
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

  const features = [
    {
      icon: UserGroupIcon,
      title: "Employee Management",
      desc: "Complete HR system with role-based access control",
    },
    {
      icon: CalendarDaysIcon,
      title: "Vacation Tracking",
      desc: "Automated leave requests & approval workflow",
    },
    {
      icon: BeakerIcon,
      title: "Inventory & Labs",
      desc: "Track equipment, manage labs & loan requests",
    },
    {
      icon: ChartBarIcon,
      title: "KPI Dashboard",
      desc: "Real-time analytics & performance insights",
    },
  ];

  const securityFeatures = [
    "JWT-based Authentication",
    "Role-Based Access Control",
    "Email Verification",
    "Secure Password Reset",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        {/* Left Side - Information Panel */}
        <div
          className={`lg:w-1/2 p-4 sm:p-6 lg:p-8 flex flex-col justify-center text-white ${
            showLoginForm ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="max-w-xl mx-auto w-full">
            {/* Top Bar - Language & Login Button */}
            <div className="mb-3 sm:mb-4 flex items-center justify-between gap-3">
              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition-all active:scale-95 border border-white/20"
              >
                <GlobeAltIcon className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {i18n.language === "en" ? "বাংলা" : "English"}
                </span>
              </button>

              {/* Login Button - Mobile Only (Top) */}
              <button
                onClick={() => setShowLoginForm(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-xl transition-all active:scale-95 border border-blue-400 shadow-lg"
              >
                <LockClosedIcon className="w-5 h-5" />
                <span className="text-sm font-bold">
                  {i18n.language === "en" ? "Login" : "লগইন"}
                </span>
              </button>
            </div>

            {/* Logo & Title */}
            <div className="mb-4 sm:mb-6">
              <div className="inline-flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-2xl shadow-2xl mb-3 sm:mb-4 p-2 sm:p-3">
                <img
                  src="/images/logo.png"
                  alt="KPI EMS Logo"
                  className="h-12 sm:h-16 lg:h-20 w-auto object-contain"
                />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3">
                {i18n.language === "en"
                  ? "KPI Employee Management System"
                  : "কেপিআই কর্মচারী ব্যবস্থাপনা সিস্টেম"}
              </h1>
              <p className="text-base sm:text-lg text-blue-200 mb-4 sm:mb-5">
                {i18n.language === "en"
                  ? "Complete HR, Vacation & Inventory Management for Polytechnic Institutes"
                  : "পলিটেকনিক ইনস্টিটিউটের জন্য সম্পূর্ণ এইচআর, ছুটি এবং ইনভেন্টরি ব্যবস্থাপনা"}
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-5">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 hover:bg-white/20 transition-all"
                >
                  <feature.icon className="w-6 h-6 mb-1 text-blue-300" />
                  <h3 className="font-semibold mb-1 text-xs sm:text-sm">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-blue-200">{feature.desc}</p>
                </div>
              ))}
            </div>

            {/* Security Features */}
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 sm:p-4 border border-white/10 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheckIcon className="w-5 h-5 text-green-400" />
                <h3 className="font-semibold text-sm sm:text-base">
                  {i18n.language === "en"
                    ? "Enterprise Security"
                    : "এন্টারপ্রাইজ নিরাপত্তা"}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {securityFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-xs sm:text-sm text-blue-200">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div
          className={`lg:w-1/2 flex items-center justify-center ${
            showLoginForm
              ? "flex fixed inset-0 z-50 p-0 m-0 bg-white overflow-y-auto"
              : "hidden lg:flex p-4 sm:p-6 lg:p-8"
          }`}
        >
          <div
            className={`w-full ${
              showLoginForm
                ? "min-h-screen flex items-start justify-center py-0"
                : "max-w-md"
            }`}
          >
            <div
              className={`bg-white w-full ${
                showLoginForm
                  ? "min-h-screen p-6"
                  : "rounded-2xl shadow-2xl p-5 sm:p-6 lg:p-8"
              }`}
            >
              {/* Mobile Header - Back Button & Language */}
              <div className="lg:hidden mb-4 flex items-center justify-between">
                <button
                  onClick={() => setShowLoginForm(false)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-all"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  <span className="text-sm font-medium">
                    {i18n.language === "en" ? "Back" : "ফিরুন"}
                  </span>
                </button>
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all text-sm font-medium text-gray-700"
                >
                  <GlobeAltIcon className="w-4 h-4" />
                  {i18n.language === "en" ? "বাংলা" : "English"}
                </button>
              </div>

              {/* Form Header */}
              <div className="text-center mb-5 sm:mb-6">
                <div className="hidden lg:inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mb-3">
                  <LockClosedIcon className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  {i18n.language === "en" ? "Welcome Back" : "স্বাগতম"}
                </h2>
                <p className="text-sm text-gray-600 mb-3">
                  {i18n.language === "en"
                    ? "Sign in to access your dashboard"
                    : "আপনার ড্যাশবোর্ড অ্যাক্সেস করতে সাইন ইন করুন"}
                </p>
                {/* Role Detection Message */}
                
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    {t("auth.email")}
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    {t("auth.password")}
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      autoComplete="current-password"
                      className="w-full px-3 py-2.5 text-sm border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10"
                      placeholder={t("auth.passwordPlaceholder")}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <input
                      id="remember"
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="remember"
                      className="ml-2 text-gray-700 font-medium"
                    >
                      {t("auth.rememberMe")}
                    </label>
                  </div>
                  <a
                    href="/forgot-password"
                    className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-all"
                  >
                    {t("auth.forgotPassword")}
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-base font-bold rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      {i18n.language === "en"
                        ? "Signing in..."
                        : "সাইন ইন করা হচ্ছে..."}
                    </>
                  ) : (
                    t("auth.loginButton")
                  )}
                </button>
              </form>

              {/* System Info */}
              <div className="mt-4 space-y-2">
                <div className="text-center text-xs text-gray-500">
                  <p>
                    {i18n.language === "en"
                      ? "🔒 Secure • 🚀 Fast • 📱 Mobile Ready"
                      : "🔒 নিরাপদ • 🚀 দ্রুত • 📱 মোবাইল রেডি"}
                  </p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-2.5 text-center">
                  <p className="text-xs text-gray-700">
                    <span className="font-semibold text-green-700">
                      {i18n.language === "en"
                        ? "✓ Auto Role Detection"
                        : "✓ স্বয়ংক্রিয় ভূমিকা সনাক্তকরণ"}
                    </span>
                    <br />
                    <span className="text-gray-600">
                      {i18n.language === "en"
                        ? "Your permissions are automatically assigned based on your role"
                        : "আপনার অনুমতিগুলি আপনার ভূমিকার উপর ভিত্তি করে স্বয়ংক্রিয়ভাবে নির্ধারিত হয়"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
