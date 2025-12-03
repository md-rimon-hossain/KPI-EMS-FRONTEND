"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { usePermission } from "@/hooks/usePermission";
import { Permission } from "@/lib/permissions";
import { useCreateLoanMutation } from "@/store/loanApi";
import { useGetInventoryItemsQuery } from "@/store/inventoryApi";
import { useGetLabsQuery } from "@/store/labApi";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Card from "@/components/Card";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function LoanRequestPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { can } = usePermission();
  const { user } = useAppSelector((state) => state.auth);

  const [createLoan, { isLoading: isCreating }] = useCreateLoanMutation();
  const { data: inventoryData, isLoading: isLoadingInventory } =
    useGetInventoryItemsQuery({});
  const { data: labsData, isLoading: isLoadingLabs } = useGetLabsQuery({});

  // Debug: Log the data to check what's being returned
  console.log("=== LOAN REQUEST PAGE DEBUG ===");
  console.log("User Role:", user?.role);
  console.log("User Department:", user?.department);
  console.log("User Department ID:", user?.department?._id);
  console.log("Inventory Loading:", isLoadingInventory);
  console.log("Inventory Data:", inventoryData);
  console.log("Inventory Items Count:", inventoryData?.items?.length);
  console.log("Labs Loading:", isLoadingLabs);
  console.log("Labs Data:", labsData);
  console.log("Labs Count:", labsData?.labs?.length);
  console.log("==============================");

  const [formData, setFormData] = useState({
    inventoryItem: "",
    lab: "",
    quantity: "",
    purpose: "",
    expectedReturnDate: "",
    notes: "",
  });

  const [selectedItem, setSelectedItem] = useState<any>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "inventoryItem") {
      const item = inventoryData?.items?.find((i: any) => i._id === value);
      setSelectedItem(item);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        quantity: parseInt(formData.quantity),
        loanDate: new Date().toISOString(), // Default to current date
      };

      await createLoan(payload).unwrap();
      router.push("/dashboard/loans");
    } catch (error) {
      console.error("Failed to create loan request:", error);
    }
  };

  // Check if user has permission and is Chief Instructor or Craft Instructor
  const canRequestLoan =
    can(Permission.REQUEST_LOAN) &&
    (user?.role === "chief_instructor" || user?.role === "craft_instructor");

  if (!canRequestLoan) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <p className="text-gray-500 mb-2">{t("common.noPermission")}</p>
          <p className="text-sm text-gray-400">
            Only Chief Instructors and Craft Instructors can request inventory
            loans.
          </p>
        </div>
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
            {t("loan.requestLoan")}
          </h1>
        </div>
      </div>

      {/* Warning if user has no department */}
      {!user?.department && (
        <Card>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-800 font-medium mb-2">
              ⚠️ No Department Assigned
            </p>
            <p className="text-sm text-amber-700">
              Your account is not assigned to any department. Please contact the
              administrator to assign you to a department before you can request
              inventory loans.
            </p>
          </div>
        </Card>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("loan.inventoryItem")} *
              </label>
              <select
                name="inventoryItem"
                value={formData.inventoryItem}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isLoadingInventory}
              >
                <option value="">
                  {isLoadingInventory
                    ? t("common.loading")
                    : t("loan.selectItem")}
                </option>
                {inventoryData?.items
                  ?.filter((item: any) => item.availableQuantity > 0)
                  .map((item: any) => (
                    <option key={item._id} value={item._id}>
                      {item.name} ({item.serialNumber}) - Available:{" "}
                      {item.availableQuantity}
                    </option>
                  ))}
              </select>
              {!isLoadingInventory &&
                (!inventoryData?.items || inventoryData.items.length === 0) && (
                  <p className="mt-1 text-sm text-amber-600">
                    No inventory items available for your department
                  </p>
                )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("loan.lab")} *
              </label>
              <select
                name="lab"
                value={formData.lab}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isLoadingLabs}
              >
                <option value="">
                  {isLoadingLabs ? t("common.loading") : t("loan.selectLab")}
                </option>
                {labsData?.labs?.map((lab: any) => (
                  <option key={lab._id} value={lab._id}>
                    {lab.name} ({lab.labCode}) - {lab.department?.name}
                  </option>
                ))}
              </select>
              {!isLoadingLabs &&
                (!labsData?.labs || labsData.labs.length === 0) && (
                  <p className="mt-1 text-sm text-amber-600">
                    No labs available for your department
                  </p>
                )}
            </div>

            <Input
              label={t("loan.quantity")}
              name="quantity"
              type="number"
              min="1"
              max={selectedItem?.availableQuantity || 999}
              value={formData.quantity}
              onChange={handleChange}
              required
              placeholder={t("loan.enterQuantity")}
            />

            <Input
              label={t("loan.expectedReturn")}
              name="expectedReturnDate"
              type="date"
              min={new Date().toISOString().split("T")[0]}
              value={formData.expectedReturnDate}
              onChange={handleChange}
              required
            />
          </div>

          {selectedItem && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">
                {t("inventory.itemDetails")}
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">
                    {t("inventory.itemName")}:
                  </span>{" "}
                  <span className="font-medium">{selectedItem.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">
                    {t("inventory.available")}:
                  </span>{" "}
                  <span className="font-medium">
                    {selectedItem.availableQuantity}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">
                    {t("inventory.condition")}:
                  </span>{" "}
                  <span className="font-medium">
                    {t(`inventory.conditions.${selectedItem.condition}`)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">
                    {t("inventory.department")}:
                  </span>{" "}
                  <span className="font-medium">
                    {selectedItem.department?.name}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("loan.purpose")} *
            </label>
            <textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              placeholder={t("loan.enterPurpose")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("loan.notes")}
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
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
            <Button type="submit" variant="primary" disabled={isCreating}>
              {isCreating ? t("common.loading") : t("common.submit")}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
