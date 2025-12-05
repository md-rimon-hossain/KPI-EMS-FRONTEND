"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useChangePasswordMutation } from "@/store/authApi";
import { Permission } from "@/lib/permissions";
import {
  PermissionGuard,
  InfoTooltip,
} from "@/components/PermissionComponents";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Input from "@/components/Input";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { t } = useTranslation();
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
      newErrors.currentPassword = t("settings.currentPasswordRequired");
    }
    if (!formData.newPassword) {
      newErrors.newPassword = t("settings.newPasswordRequired");
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = t("settings.passwordMinLength");
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t("settings.confirmPasswordRequired");
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = t("settings.passwordMismatch");
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

      toast.success(t("settings.passwordChangeSuccess"));
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      toast.error(error?.data?.message || t("settings.passwordChangeError"));
    }
  };

  return (
    <PermissionGuard permission={Permission.CHANGE_PASSWORD}>
      <div className="max-w-2xl mx-auto px-3 sm:px-4">
        <div className="mb-3 sm:mb-4 flex items-start gap-1.5 sm:gap-2">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
              {t("settings.title")}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
              {t("settings.subtitle")}
            </p>
          </div>
          <InfoTooltip
            text={
              t("settings.changePasswordTooltip") ||
              "Change your account password for security"
            }
          />
        </div>

        <Card padding="sm">
          <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4">
            {t("settings.changePassword")}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <Input
              label={t("settings.currentPassword")}
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              error={errors.currentPassword}
              required
            />

            <Input
              label={t("settings.newPassword")}
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              error={errors.newPassword}
              helperText={t("settings.minCharacters")}
              required
            />

            <Input
              label={t("settings.confirmNewPassword")}
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
            />

            <div className="pt-2 sm:pt-3">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={isLoading}
                fullWidth
                className="tap-target"
              >
                {t("settings.updatePassword")}
              </Button>
            </div>
          </form>
        </Card>

        <Card
          padding="sm"
          className="mt-3 sm:mt-4 bg-yellow-50 border-yellow-200"
        >
          <h3 className="text-sm sm:text-base font-bold text-yellow-900 mb-2">
            {t("settings.securityTips")}
          </h3>
          <ul className="list-disc list-inside space-y-1 sm:space-y-1.5 text-xs sm:text-sm text-yellow-700">
            <li>{t("settings.tip1")}</li>
            <li>{t("settings.tip2")}</li>
            <li>{t("settings.tip3")}</li>
            <li>{t("settings.tip4")}</li>
            <li>{t("settings.tip5")}</li>
          </ul>
        </Card>
      </div>
    </PermissionGuard>
  );
}
