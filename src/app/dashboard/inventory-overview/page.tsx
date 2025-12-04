"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useGetDashboardStatsQuery } from "@/store/inventoryApi";
import { useGetAllDepartmentsQuery } from "@/store/departmentApi";
import { useAppSelector } from "@/store/hooks";
import { usePermission } from "@/hooks/usePermission";
import { Permission, UserRole } from "@/lib/permissions";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import {
  CubeIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
  ArchiveBoxXMarkIcon,
  PlusIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";

export default function InventoryDashboardPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const { can } = usePermission();
  const [selectedDepartment, setSelectedDepartment] = useState("");

  // Determine department filter based on role
  const getDepartmentFilter = () => {
    if (
      user?.role === UserRole.CHIEF_INSTRUCTOR ||
      user?.role === UserRole.GENERAL_HEAD
    ) {
      return user?.department?._id || "";
    }
    return selectedDepartment;
  };

  const { data: statsData, isLoading } = useGetDashboardStatsQuery({
    department: getDepartmentFilter() || undefined,
  });

  const { data: departmentsData } = useGetAllDepartmentsQuery();

  // Show department filter only for admin and registrar_head
  const canSelectDepartment =
    user?.role === UserRole.SUPER_ADMIN ||
    user?.role === UserRole.REGISTRAR_HEAD;

  const stats = statsData?.overview;
  const byStatus = statsData?.byStatus || {};
  const byCondition = statsData?.byCondition || {};
  const recentItems = statsData?.recentItems || [];
  const departmentStats = statsData?.departmentStats || [];

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

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("inventory.dashboard")}
          </h1>
          <p className="text-gray-600 mt-1">
            {t("inventory.dashboardSubtitle")}
          </p>
        </div>
        <div className="flex gap-3">
          {can(Permission.VIEW_INVENTORY) && (
            <Button
              variant="outline"
              onClick={() => router.push("/dashboard/inventory")}
              className="flex items-center gap-2"
            >
              <ListBulletIcon className="w-5 h-5" />
              {t("inventory.viewAll")}
            </Button>
          )}
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
      </div>

      {/* Department Filter (Admin & Registrar Head only) */}
      {canSelectDepartment && (
        <Card>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              {t("common.filterBy")} {t("inventory.department")}:
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">{t("common.allDepartments")}</option>
              {departmentsData?.data?.departments.map((dept: any) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>
          </div>
        </Card>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">
                {t("inventory.totalItems")}
              </p>
              <p className="text-3xl font-bold text-blue-900 mt-2">
                {stats?.totalItems || 0}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                {stats?.totalQuantity || 0} {t("inventory.units")}
              </p>
            </div>
            <CubeIcon className="w-12 h-12 text-blue-600 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">
                {t("inventory.available")}
              </p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                {stats?.availableQuantity || 0}
              </p>
              <p className="text-xs text-green-700 mt-1">
                {t("inventory.inStock")}
              </p>
            </div>
            <CheckCircleIcon className="w-12 h-12 text-green-600 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">
                {t("inventory.loaned")}
              </p>
              <p className="text-3xl font-bold text-orange-900 mt-2">
                {stats?.loanedQuantity || 0}
              </p>
              <p className="text-xs text-orange-700 mt-1">
                {t("inventory.currentlyOut")}
              </p>
            </div>
            <ClockIcon className="w-12 h-12 text-orange-600 opacity-50" />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">
                {t("inventory.lowStock")}
              </p>
              <p className="text-3xl font-bold text-red-900 mt-2">
                {stats?.lowStockCount || 0}
              </p>
              <p className="text-xs text-red-700 mt-1">
                {stats?.outOfStockCount || 0} {t("inventory.outOfStock")}
              </p>
            </div>
            <ExclamationTriangleIcon className="w-12 h-12 text-red-600 opacity-50" />
          </div>
        </Card>
      </div>

      {/* Status & Condition Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* By Status */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t("inventory.byStatus")}
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">
                  {t("inventory.statuses.available")}
                </span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {byStatus.available || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-orange-600" />
                <span className="font-medium text-gray-900">
                  {t("inventory.statuses.loaned")}
                </span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {byStatus.loaned || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2">
                <WrenchScrewdriverIcon className="w-5 h-5 text-red-600" />
                <span className="font-medium text-gray-900">
                  {t("inventory.statuses.maintenance")}
                </span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {byStatus.maintenance || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <ArchiveBoxXMarkIcon className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">
                  {t("inventory.statuses.retired")}
                </span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {byStatus.retired || 0}
              </span>
            </div>
          </div>
        </Card>

        {/* By Condition */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t("inventory.byCondition")}
          </h3>
          <div className="space-y-3">
            {["excellent", "good", "fair", "poor", "damaged"].map(
              (condition) => (
                <div
                  key={condition}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <span className="font-medium text-gray-900 capitalize">
                    {t(`inventory.conditions.${condition}`)}
                  </span>
                  <Badge variant={getConditionColor(condition)}>
                    {byCondition[condition] || 0}
                  </Badge>
                </div>
              )
            )}
          </div>
        </Card>
      </div>

      {/* Department Statistics (Admin & Registrar Head only) */}
      {canSelectDepartment &&
        !selectedDepartment &&
        departmentStats.length > 0 && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {t("inventory.byDepartment")}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      {t("inventory.department")}
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                      {t("inventory.items")}
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                      {t("inventory.quantity")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {departmentStats.map((dept) => (
                    <tr key={dept._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-gray-900">
                            {dept.departmentName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {dept.departmentCode}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {dept.count}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {dept.totalQuantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

      {/* Recent Items */}
      {recentItems.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t("inventory.recentItems")}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/inventory")}
            >
              {t("common.viewAll")}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentItems.slice(0, 6).map((item: any) => (
              <div
                key={item._id}
                onClick={() => router.push(`/dashboard/inventory/${item._id}`)}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <CubeIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {item.itemName}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">
                      {item.name} • {item.serialNumber}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge
                        variant={getConditionColor(item.condition)}
                        size="sm"
                      >
                        {t(`inventory.conditions.${item.condition}`)}
                      </Badge>
                      <Badge variant={getStatusColor(item.status)} size="sm">
                        {t(`inventory.statuses.${item.status}`)}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {item.department?.name}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
