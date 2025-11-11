"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  useGetDepartmentByIdQuery,
  useUpdateDepartmentMutation,
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
import Loading from "@/components/Loading";
import toast from "react-hot-toast";

export default function EditDepartmentPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useParams();
  const id = params.id as string;

  const { data: departmentData, isLoading: isLoadingDept } =
    useGetDepartmentByIdQuery(id);
  const department = departmentData?.data?.department;

  const [updateDepartment, { isLoading }] = useUpdateDepartmentMutation();
  const { data: usersData } = useGetAllUsersQuery();
  const users = usersData?.data?.users || [];

  const chiefInstructors = users.filter(
    (user: any) => user.role === "chief_instructor"
  );

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    chiefInstructor: "",
    description: "",
    isActive: true,
  });

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name || "",
        code: department.code || "",
        chiefInstructor:
          typeof department.chiefInstructor === "string"
            ? department.chiefInstructor
            : department.chiefInstructor?._id || "",
        description: department.description || "",
        isActive: department.isActive ?? true,
      });
    }
  }, [department]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validate = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) newErrors.name = "Department name is required";
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
        isActive: formData.isActive,
      };

      if (formData.chiefInstructor) {
        payload.chiefInstructor = formData.chiefInstructor;
      }

      if (formData.description.trim()) {
        payload.description = formData.description.trim();
      }

      await updateDepartment({ id, data: payload }).unwrap();
      toast.success(t("department.updateSuccess"));
      router.push("/dashboard/departments");
    } catch (error: any) {
      toast.error(error?.data?.message || t("department.updateError"));
    }
  };

  if (isLoadingDept) {
    return <Loading fullScreen text={t("common.loading")} />;
  }

  if (!department) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">{t("department.noDepartments")}</p>
        <Button
          variant="primary"
          onClick={() => router.push("/dashboard/departments")}
          className="mt-4"
        >
          {t("common.back")}
        </Button>
      </div>
    );
  }

  return (
    <PermissionGuard permission={Permission.EDIT_DEPARTMENT}>
      <div>
        <div className="mb-6 flex items-start gap-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t("department.edit")}
            </h1>
            <p className="text-gray-600 mt-1">
              {t("department.editSubtitle") || "Update department information"}
            </p>
          </div>
          <InfoTooltip
            text={
              t("department.editTooltip") ||
              "Edit department details and assign chief instructor"
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
              placeholder="e.g., Computer Science & Technology"
              required
            />

            <Input
              label="Department Code"
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              error={errors.code}
              placeholder="e.g., CST"
              helperText="Short code for the department (will be converted to uppercase)"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chief Instructor
              </label>
              <select
                name="chiefInstructor"
                value={formData.chiefInstructor}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Chief Instructor (Optional)</option>
                {chiefInstructors?.map((user: any) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              {chiefInstructors.length === 0 && (
                <p className="mt-1 text-sm text-gray-500">
                  No chief instructors available. Create a user with Chief
                  Instructor role first.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description about the department..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="isActive"
                className="ml-2 text-sm font-medium text-gray-700"
              >
                Active Department
              </label>
              <p className="ml-2 text-sm text-gray-500">
                (Inactive departments won't appear in dropdowns)
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                variant="primary"
                loading={isLoading}
                fullWidth
              >
                Update Department
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
