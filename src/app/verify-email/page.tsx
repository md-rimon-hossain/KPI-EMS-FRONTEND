"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useVerifyEmailMutation } from "@/store/authApi";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Loading from "@/components/Loading";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link. No token provided.");
        return;
      }

      try {
        const response = await verifyEmail({ token }).unwrap();
        setStatus("success");
        setMessage(
          response.message ||
            "Email verified successfully! You can now login to the system."
        );
      } catch (error: any) {
        setStatus("error");
        setMessage(
          error?.data?.message ||
            "Email verification failed. The link may be invalid or expired."
        );
      }
    };

    verify();
  }, [token, verifyEmail]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <Card>
          <div className="text-center">
            {status === "verifying" && (
              <>
                <div className="flex justify-center mb-4">
                  <Loading size="lg" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Verifying Email...
                </h2>
                <p className="text-gray-600">
                  Please wait while we verify your email address.
                </p>
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
                  Email Verified!
                </h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <Button
                  onClick={() => router.push("/login")}
                  variant="primary"
                  fullWidth
                >
                  Go to Login
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
                  Verification Failed
                </h2>
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="space-y-3">
                  <Button
                    onClick={() => router.push("/login")}
                    variant="primary"
                    fullWidth
                  >
                    Back to Login
                  </Button>
                  <Button
                    onClick={() => router.push("/dashboard")}
                    variant="secondary"
                    fullWidth
                  >
                    Contact Support
                  </Button>
                </div>
              </>
            )}
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
