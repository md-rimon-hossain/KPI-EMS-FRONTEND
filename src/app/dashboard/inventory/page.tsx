"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { usePermission } from "@/hooks/usePermission";
import { Permission } from "@/lib/permissions";
import {
  useGetInventoryItemsQuery,
  useDeleteInventoryItemMutation,
} from "@/store/inventoryApi";
import { useGetAllDepartmentsQuery } from "@/store/departmentApi";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import Loading from "@/components/Loading";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

export default function InventoryPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { can, role } = usePermission();
  const { user } = useAppSelector((state) => state.auth);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const { data: inventoryData, isLoading } = useGetInventoryItemsQuery({
    page,
    limit: 20,
    department: selectedDepartment || undefined,
    status: selectedStatus || undefined,
    condition: selectedCondition || undefined,
    search: search || undefined,
  });

  // Debug logging
  React.useEffect(() => {
    console.log("=== INVENTORY PAGE DEBUG ===");
    console.log("User Role:", user?.role);
    console.log("User Department:", user?.department);
    console.log("Inventory Data:", inventoryData);
    console.log("Items Count:", inventoryData?.items?.length);
    console.log("Is Loading:", isLoading);
  }, [user, inventoryData, isLoading]);

  const { data: departmentsData } = useGetAllDepartmentsQuery();
  const [deleteItem, { isLoading: isDeleting }] =
    useDeleteInventoryItemMutation();

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteItem(itemToDelete).unwrap();
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  const getConditionColor = (condition: string) => {
    const colors: Record<string, "success" | "warning" | "danger" | "gray"> = {
      excellent: "success",
      good: "success",
      fair: "warning",
      poor: "warning",
      damaged: "danger",
    };
    return colors[condition] || "gray";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, "success" | "warning" | "danger" | "gray"> = {
      available: "success",
      loaned: "warning",
      maintenance: "danger",
      retired: "gray",
    };
    return colors[status] || "gray";
  };

  if (!can(Permission.VIEW_INVENTORY)) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t("common.noPermission")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("inventory.title")}
          </h1>
          <p className="text-gray-600 mt-1">{t("inventory.subtitle")}</p>
        </div>
        {can(Permission.CREATE_INVENTORY) && (
          <Button
            onClick={() => router.push("/dashboard/inventory/create")}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            {t("inventory.addItem")}
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder={t("inventory.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Hide department filter for Chief Instructor, General Head, and Craft Instructor */}
          {role !== "chief_instructor" &&
            role !== "general_head" &&
            role !== "craft_instructor" && (
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">
                  {t("common.select")} {t("inventory.department")}
                </option>
                {departmentsData?.data?.departments.map((dept: any) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            )}

          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">{t("inventory.allConditions")}</option>
            <option value="excellent">
              {t("inventory.conditions.excellent")}
            </option>
            <option value="good">{t("inventory.conditions.good")}</option>
            <option value="fair">{t("inventory.conditions.fair")}</option>
            <option value="poor">{t("inventory.conditions.poor")}</option>
            <option value="damaged">{t("inventory.conditions.damaged")}</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">{t("inventory.allStatuses")}</option>
            <option value="available">
              {t("inventory.statuses.available")}
            </option>
            <option value="loaned">{t("inventory.statuses.loaned")}</option>
            <option value="maintenance">
              {t("inventory.statuses.maintenance")}
            </option>
            <option value="retired">{t("inventory.statuses.retired")}</option>
          </select>
        </div>
      </div>

      {/* Card Grid */}
      {isLoading ? (
        <Loading />
      ) : inventoryData?.items && inventoryData.items.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {inventoryData.items.map((item: any) => (
              <div
                key={item._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col"
              >
                {/* Item Image */}
                <div className="relative h-48 bg-gray-100">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <svg
                          className="w-16 h-16 mx-auto mb-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                          />
                        </svg>
                        <p className="text-sm">No Image</p>
                      </div>
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-2 right-2">
                    <Badge variant={getStatusColor(item.status)}>
                      {t(`inventory.statuses.${item.status}`)}
                    </Badge>
                  </div>
                </div>

                {/* Item Details */}
                <div className="p-4 flex-1 flex flex-col">
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500">{item.serialNumber}</p>
                  </div>

                  <div className="space-y-2 mb-4 flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {t("inventory.department")}:
                      </span>
                      <span className="font-medium text-gray-900">
                        {item.department?.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {t("inventory.lab")}:
                      </span>
                      <span className="font-medium text-gray-900">
                        {item.lab?.name || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {t("inventory.condition")}:
                      </span>
                      <Badge
                        variant={getConditionColor(item.condition)}
                        size="sm"
                      >
                        {t(`inventory.conditions.${item.condition}`)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {t("inventory.quantity")}:
                      </span>
                      <span className="font-medium text-gray-900">
                        {item.availableQuantity} / {item.quantity}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-gray-200">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(`/dashboard/inventory/${item._id}`)
                      }
                      className="flex-1"
                    >
                      <PencilIcon className="w-4 h-4 mr-1" />
                      {t("common.edit")}
                    </Button>
                    {can(Permission.DELETE_INVENTORY) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setItemToDelete(item._id);
                          setDeleteModalOpen(true);
                        }}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {inventoryData.total > 20 && (
            <div className="mt-6 flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                {t("common.previous")}
              </Button>
              <span className="px-4 py-2 text-sm text-gray-700">
                {t("common.page")} {page} {t("common.of")}{" "}
                {Math.ceil(inventoryData.total / 20)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage(
                    Math.min(Math.ceil(inventoryData.total / 20), page + 1)
                  )
                }
                disabled={page >= Math.ceil(inventoryData.total / 20)}
              >
                {t("common.next")}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">{t("inventory.noItems")}</p>
        </div>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        title={t("inventory.deleteItem")}
      >
        <p className="text-gray-600 mb-6">{t("inventory.deleteConfirm")}</p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => {
              setDeleteModalOpen(false);
              setItemToDelete(null);
            }}
          >
            {t("common.cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? t("common.loading") : t("common.delete")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
