"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRouter, useParams } from "next/navigation";
import { usePermission } from "@/hooks/usePermission";
import { Permission } from "@/lib/permissions";
import {
  useGetLabQuery,
  useCreateLabMutation,
  useUpdateLabMutation,
} from "@/store/labApi";
import { useGetAllDepartmentsQuery } from "@/store/departmentApi";
import { useGetAllUsersQuery } from "@/store/userApi";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Card from "@/components/Card";
import Loading from "@/components/Loading";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function LabFormPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const { can } = usePermission();
  const isEdit = params?.id && params.id !== "create";

  const { data: lab, isLoading: labLoading } = useGetLabQuery(
    params?.id as string,
    {
      skip: !isEdit,
    }
  );

  const { data: departmentsData } = useGetAllDepartmentsQuery();
  const { data: usersData } = useGetAllUsersQuery();
  const [createLab, { isLoading: isCreating }] = useCreateLabMutation();
  const [updateLab, { isLoading: isUpdating }] = useUpdateLabMutation();

  const [formData, setFormData] = useState({
    name: "",
    labCode: "",
    department: "",
    labIncharge: "",
    location: "",
    capacity: "",
    description: "",
  });

  useEffect(() => {
    if (lab && isEdit) {
      setFormData({
        name: lab.name || "",
        labCode: lab.labCode || "",
        department: lab.department?._id || "",
        labIncharge: lab.labIncharge?._id || "",
        location: lab.location || "",
        capacity: lab.capacity?.toString() || "",
        description: lab.description || "",
      });
    }
  }, [lab, isEdit]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload: any = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        labIncharge: formData.labIncharge || undefined,
      };

      if (isEdit) {
        await updateLab({ id: params?.id as string, data: payload }).unwrap();
      } else {
        await createLab(payload).unwrap();
      }
      router.push("/dashboard/labs");
    } catch (error) {
      console.error("Failed to save lab:", error);
    }
  };

  if (isEdit && labLoading) {
    return <Loading />;
  }

  if (isEdit ? !can(Permission.EDIT_LAB) : !can(Permission.CREATE_LAB)) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t("common.noPermission")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          {t("common.back")}
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? t("lab.editLab") : t("lab.addLab")}
          </h1>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t("lab.labName")}
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <Input
              label={t("lab.labCode")}
              name="labCode"
              value={formData.labCode}
              onChange={handleChange}
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("lab.department")} *
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">{t("common.select")}</option>
                {departmentsData?.data?.departments?.map((dept: any) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("lab.labIncharge")}
              </label>
              <select
                name="labIncharge"
                value={formData.labIncharge}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{t("lab.selectIncharge")}</option>
                {usersData?.data?.users?.map((user: any) => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <Input
              label={t("lab.location")}
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
            <Input
              label={t("lab.capacity")}
              name="capacity"
              type="number"
              min="0"
              value={formData.capacity}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("lab.description")}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isCreating || isUpdating}
            >
              {isCreating || isUpdating
                ? t("common.loading")
                : isEdit
                ? t("common.update")
                : t("common.create")}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
