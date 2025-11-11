"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useChangePasswordMutation } from "@/store/authApi";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Input from "@/components/Input";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const router = useRouter();
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<any>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validate = () => {
    const newErrors: any = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }
    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      }).unwrap();

      toast.success("Password changed successfully");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to change password");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Change Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Current Password"
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            error={errors.currentPassword}
            required
          />

          <Input
            label="New Password"
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            error={errors.newPassword}
            helperText="Minimum 6 characters"
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            required
          />

          <div className="pt-4">
            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              fullWidth
            >
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      <Card className="mt-6 bg-yellow-50 border-yellow-200">
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">
          Security Tips
        </h3>
        <ul className="list-disc list-inside space-y-2 text-sm text-yellow-700">
          <li>Use a strong password with at least 8 characters</li>
          <li>Include numbers, letters, and special characters</li>
          <li>Don't reuse passwords from other accounts</li>
          <li>Change your password regularly</li>
          <li>Never share your password with anyone</li>
        </ul>
      </Card>
    </div>
  );
}
