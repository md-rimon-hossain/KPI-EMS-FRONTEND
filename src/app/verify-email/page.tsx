"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useVerifyEmailMutation } from "@/store/authApi";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import { GlobeAltIcon } from "@heroicons/react/24/outline";

function VerifyEmailContent() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const [message, setMessage] = useState("");

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "bn" : "en";
    i18n.changeLanguage(newLang);
  };

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage(t("auth.invalidToken"));
        return;
      }

      try {
        const response = await verifyEmail({ token }).unwrap();
        setStatus("success");
        setMessage(response.message || t("auth.emailVerified"));
      } catch (error: any) {
        setStatus("error");
        setMessage(error?.data?.message || t("auth.emailVerificationFailed"));
      }
    };

    verify();
  }, [token, verifyEmail, t]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <div className="relative">
            <button
              onClick={toggleLanguage}
              className="absolute top-0 right-0 p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              title={
                i18n.language === "en"
                  ? "Switch to Bangla"
                  : "Switch to English"
              }
            >
              <GlobeAltIcon className="w-6 h-6" />
            </button>
            <div className="text-center pt-8">
              {status === "verifying" && (
                <>
                  <div className="flex justify-center mb-4">
                    <Loading size="lg" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {t("auth.verifying")}
                  </h2>
                  <p className="text-gray-600">{t("common.loading")}</p>
                </>
              )}

              {status === "success" && (
                <>
                  <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-green-100 p-3">
                      <svg
                        className="h-12 w-12 text-green-600"
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
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {t("auth.emailVerified")}
                  </h2>
                  <p className="text-gray-600 mb-6">{message}</p>
                  <Button
                    onClick={() => router.push("/login")}
                    variant="primary"
                    fullWidth
                  >
                    {t("auth.backToLogin")}
                  </Button>
                </>
              )}

              {status === "error" && (
                <>
                  <div className="flex justify-center mb-4">
                    <div className="rounded-full bg-red-100 p-3">
                      <svg
                        className="h-12 w-12 text-red-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {t("auth.emailVerificationFailed")}
                  </h2>
                  <p className="text-gray-600 mb-6">{message}</p>
                  <div className="space-y-3">
                    <Button
                      onClick={() => router.push("/login")}
                      variant="primary"
                      fullWidth
                    >
                      {t("auth.backToLogin")}
                    </Button>
                    <Button
                      onClick={() => router.push("/dashboard")}
                      variant="secondary"
                      fullWidth
                    >
                      {t("common.back")}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<Loading />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
