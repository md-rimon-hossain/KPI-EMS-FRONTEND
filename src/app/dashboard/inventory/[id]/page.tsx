"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useRouter, useParams } from "next/navigation";
import { usePermission } from "@/hooks/usePermission";
import { Permission, UserRole } from "@/lib/permissions";
import { useAppSelector } from "@/store/hooks";
import {
  useGetInventoryItemQuery,
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
} from "@/store/inventoryApi";
import { useGetAllDepartmentsQuery } from "@/store/departmentApi";
import { useGetLabsByDepartmentQuery } from "@/store/labApi";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Card from "@/components/Card";
import Loading from "@/components/Loading";
import {
  ArrowLeftIcon,
  PhotoIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function InventoryFormPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const { can } = usePermission();
  const { user } = useAppSelector((state) => state.auth);
  const isEdit = params?.id && params.id !== "create";
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if user can select department
  const canSelectDepartment =
    user?.role === UserRole.SUPER_ADMIN ||
    user?.role === UserRole.REGISTRAR_HEAD;

  const { data: item, isLoading: itemLoading } = useGetInventoryItemQuery(
    params?.id as string,
    {
      skip: !isEdit,
    }
  );

  const [formData, setFormData] = useState({
    quantity: "",
    condition: "good",
    status: "available",
    department: "",
    lab: "",
    description: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const { data: departmentsData } = useGetAllDepartmentsQuery();
  const { data: labsData } = useGetLabsByDepartmentQuery(formData.department, {
    skip: !formData.department,
  });
  const [createItem, { isLoading: isCreating }] =
    useCreateInventoryItemMutation();
  const [updateItem, { isLoading: isUpdating }] =
    useUpdateInventoryItemMutation();

  // Auto-select department for Chief Instructor and General Head
  useEffect(() => {
    if (!isEdit && user && !canSelectDepartment) {
      setFormData((prev) => ({
        ...prev,
        department: user.department?._id || "",
      }));
    }
  }, [user, canSelectDepartment, isEdit]);

  useEffect(() => {
    if (item && isEdit) {
      setFormData({
        quantity: item.quantity?.toString() || "",
        condition: item.condition || "good",
        status: item.status || "available",
        department: item.department?._id || "",
        lab: item.lab?._id || "",
        description: item.description || "",
      });
      if (item.image) {
        setImagePreview(item.image);
      }
    }
  }, [item, isEdit]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(t("inventory.imageSizeError"));
        return;
      }

      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validTypes.includes(file.type)) {
        alert(t("inventory.imageTypeError"));
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate department
    if (!formData.department) {
      alert(t("inventory.departmentRequired") || "Department is required");
      return;
    }

    // Validate lab
    if (!formData.lab) {
      alert(t("inventory.labRequired") || "Lab is required");
      return;
    }

    // Validate quantity
    if (!formData.quantity || parseInt(formData.quantity) <= 0) {
      alert(t("inventory.quantityRequired") || "Valid quantity is required");
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("quantity", formData.quantity);
      formDataToSend.append("condition", formData.condition);
      formDataToSend.append("status", formData.status);
      formDataToSend.append("department", formData.department);
      formDataToSend.append("lab", formData.lab);
      formDataToSend.append("description", formData.description);

      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      if (isEdit) {
        await updateItem({
          id: params?.id as string,
          formData: formDataToSend,
        }).unwrap();
      } else {
        await createItem(formDataToSend).unwrap();
      }
      router.push("/dashboard/inventory");
    } catch (error) {
      console.error("Failed to save inventory item:", error);
    }
  };

  if (isEdit && itemLoading) {
    return <Loading />;
  }

  if (
    isEdit ? !can(Permission.EDIT_INVENTORY) : !can(Permission.CREATE_INVENTORY)
  ) {
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
            {isEdit ? t("inventory.editItem") : t("inventory.addItem")}
          </h1>
        </div>
      </div>

      {/* Warning if user has no department */}
      {!canSelectDepartment && !user?.department && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                {t("inventory.noDepartmentTitle") || "Department Not Assigned"}
              </h3>
              <p className="mt-1 text-sm text-red-700">
                {t("inventory.noDepartmentMessage") ||
                  "You must be assigned to a department to create inventory items. Please contact an administrator."}
              </p>
            </div>
          </div>
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("inventory.itemImage")}
            </label>
            <div className="space-y-4">
              {/* Image Preview */}
              {imagePreview && (
                <div className="relative w-full max-w-md">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Upload Button */}
              {!imagePreview && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
                >
                  <PhotoIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600 mb-1">
                    {t("inventory.uploadImage")}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t("inventory.imageInstructions")}
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />

              {imagePreview && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {t("inventory.changeImage")}
                </Button>
              )}
            </div>
          </div>

          {/* Auto-generated Info */}
          {isEdit && item && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">
                {t("inventory.autoGenerated")}
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-blue-700">
                    {t("inventory.itemName")}:
                  </span>
                  <span className="ml-2 font-medium text-blue-900">
                    {item.name}
                  </span>
                </div>
                <div>
                  <span className="text-blue-700">
                    {t("inventory.serialNumber")}:
                  </span>
                  <span className="ml-2 font-medium text-blue-900">
                    {item.serialNumber}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t("inventory.basicInfo")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t("inventory.quantity")}
                name="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("inventory.condition")}
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="excellent">
                    {t("inventory.conditions.excellent")}
                  </option>
                  <option value="good">{t("inventory.conditions.good")}</option>
                  <option value="fair">{t("inventory.conditions.fair")}</option>
                  <option value="poor">{t("inventory.conditions.poor")}</option>
                  <option value="damaged">
                    {t("inventory.conditions.damaged")}
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("inventory.status")}
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="available">
                    {t("inventory.statuses.available")}
                  </option>
                  <option value="loaned">
                    {t("inventory.statuses.loaned")}
                  </option>
                  <option value="maintenance">
                    {t("inventory.statuses.maintenance")}
                  </option>
                  <option value="retired">
                    {t("inventory.statuses.retired")}
                  </option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("inventory.department")} *
                </label>
                {canSelectDepartment ? (
                  <select
                    name="department"
                    value={formData.department}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        department: e.target.value,
                        lab: "",
                      });
                    }}
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
                ) : (
                  <div className="px-4 py-2 border border-gray-200 rounded-lg bg-gray-50">
                    <span className="text-gray-900 font-medium">
                      {user?.department?.name || t("common.notAssigned")}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {t("inventory.departmentAutoSelected")}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("inventory.lab")} *
                </label>
                <select
                  name="lab"
                  value={formData.lab}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={!formData.department}
                >
                  <option value="">
                    {formData.department
                      ? t("common.select")
                      : t("inventory.selectDepartmentFirst")}
                  </option>
                  {labsData?.labs?.map((lab: any) => (
                    <option key={lab._id} value={lab._id}>
                      {lab.name} ({lab.labCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("inventory.description")}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t("inventory.descriptionPlaceholder")}
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
              disabled={
                isCreating ||
                isUpdating ||
                (!canSelectDepartment && !user?.department)
              }
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
