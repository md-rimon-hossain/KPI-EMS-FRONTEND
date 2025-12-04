"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  useCreateDepartmentMutation,
  useGetAllDepartmentsQuery,
} from "@/store/departmentApi";
import { useGetAllUsersQuery } from "@/store/userApi";
import { Permission } from "@/lib/permissions";
import {
  PermissionGuard,
  InfoTooltip,
} from "@/components/PermissionComponents";
import Card from "@/components/Card";
import Input from "@/components/Input";
import Button from "@/components/Button";
import toast from "react-hot-toast";

export default function CreateDepartmentPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [createDepartment, { isLoading }] = useCreateDepartmentMutation();
  const { data: usersData } = useGetAllUsersQuery();
  const users = usersData?.data?.users || [];

  const chiefInstructors = users.filter(
    (user: any) =>
      user.role === "chief_instructor" || user.role === "general_head"
  );

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    chiefInstructor: "",
    description: "",
  });

  const [errors, setErrors] = useState<any>({});

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validate = () => {
    const newErrors: any = {};

    if (!formData.name.trim())
      newErrors.name = t("department.departmentName") + " is required";
    if (!formData.code.trim()) newErrors.code = "Department code is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const payload: any = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
      };

      if (formData.chiefInstructor) {
        payload.chiefInstructor = formData.chiefInstructor;
      }

      if (formData.description.trim()) {
        payload.description = formData.description.trim();
      }

      await createDepartment(payload).unwrap();
      toast.success(t("department.createSuccess"));
      router.push("/dashboard/departments");
    } catch (error: any) {
      toast.error(error?.data?.message || t("department.createError"));
    }
  };

  return (
    <PermissionGuard permission={Permission.CREATE_DEPARTMENT}>
      <div>
        <div className="mb-6 flex items-start gap-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t("department.create")}
            </h1>
            <p className="text-gray-600 mt-1">
              {t("department.createSubtitle") ||
                "Add a new department to the organization"}
            </p>
          </div>
          <InfoTooltip
            text={
              t("department.createTooltip") ||
              "Create a new organizational department with a chief instructor"
            }
          />
        </div>

        <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t("department.departmentName")}
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder={t("department.namePlaceholder")}
              required
            />

            <Input
              label={t("department.departmentCode", "Code")}
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              error={errors.code}
              placeholder="CST"
              helperText="Short code"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("roles.chief_instructor")}
              </label>
              <select
                name="chiefInstructor"
                value={formData.chiefInstructor}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">
                  {t("common.select")} {t("roles.chief_instructor")}
                </option>
                {chiefInstructors?.map((user: any) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("department.description")}
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t("department.descriptionPlaceholder")}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                variant="primary"
                loading={isLoading}
                fullWidth
              >
                {t("common.create")}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/dashboard/departments")}
                fullWidth
              >
                {t("common.cancel")}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </PermissionGuard>
  );
}
