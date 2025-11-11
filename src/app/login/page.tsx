"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLoginMutation } from "@/store/authApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCredentials } from "@/store/authSlice";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
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
      toast.success("Login successful!");
      router.push("/dashboard");
    } catch (error: any) {
      const errorMessage = error?.data?.message || "Login failed";
      toast.error(errorMessage);

      // Show additional info if email not verified
      if (error?.status === 403 && errorMessage.includes("verify")) {
        toast.error("Please check your email for the verification link.", {
          duration: 5000,
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Polytechnic EMS
          </h1>
          <p className="text-gray-600">Employee & Leave Management System</p>
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
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              className="input-field"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember"
                className="ml-2 block text-sm text-gray-700"
              >
                Remember me
              </label>
            </div>
            <a
              href="/forgot-password"
              className="text-sm text-primary-600 hover:text-primary-500"
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-3 text-lg font-semibold"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Default Super Admin:</p>
          <p className="font-mono mt-1">admin@college.com / admin123</p>
        </div>
      </div>
    </div>
  );
}
