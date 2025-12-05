"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useGetAllVacationsQuery } from "@/store/vacationApi";
import { useGetAllDepartmentsQuery } from "@/store/departmentApi";
import { Permission } from "@/lib/permissions";
import {
  PermissionGuard,
  InfoTooltip,
} from "@/components/PermissionComponents";
import Card from "@/components/Card";
import Table from "@/components/Table";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import Badge from "@/components/Badge";
import { FunnelIcon } from "@heroicons/react/24/outline";

export default function AllVacationsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  const { data: vacationsData, isLoading } = useGetAllVacationsQuery();
  const { data: departmentsData } = useGetAllDepartmentsQuery();

  const vacations = vacationsData?.data?.vacations || [];
  const departments = departmentsData?.data?.departments || [];

  // Filter vacations (exclude pending)
  const filteredVacations = vacations.filter((vacation: any) => {
    // Exclude pending vacations
    if (vacation.status === "pending") return false;

    // Status filter
    if (statusFilter !== "all" && vacation.status !== statusFilter) {
      return false;
    }

    // Department filter
    if (
      departmentFilter !== "all" &&
      vacation.department?._id !== departmentFilter
    ) {
      return false;
    }

    return true;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      approved_by_chief: { variant: "info", label: "Approved by Chief" },
      approved: { variant: "success", label: "Approved" },
      rejected: { variant: "danger", label: "Rejected" },
    };

    const config = statusConfig[status] || {
      variant: "default",
      label: status,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const columns = [
    {
      key: "employee",
      header: t("vacation.employee"),
      render: (vacation: any) => (
        <div>
          <p className="font-medium text-gray-900">
            {vacation.employee?.name || "N/A"}
          </p>
          <p className="text-sm text-gray-500">
            {vacation.employee?.role?.replace(/_/g, " ")}
          </p>
        </div>
      ),
    },
    {
      key: "department",
      header: t("user.department"),
      render: (vacation: any) => (
        <span className="text-sm text-gray-700">
          {vacation.department?.name || "N/A"}
        </span>
      ),
    },
    {
      key: "vacationType",
      header: t("vacation.vacationType"),
      render: (vacation: any) => (
        <span className="capitalize text-sm">
          {vacation.vacationType?.replace(/_/g, " ")}
          {vacation.isRewardVacation && (
            <Badge variant="success" size="sm" className="ml-2">
              Reward
            </Badge>
          )}
        </span>
      ),
    },
    {
      key: "dates",
      header: t("vacation.dates"),
      render: (vacation: any) => (
        <div>
          <p className="text-sm text-gray-900">
            {new Date(vacation.startDate).toLocaleDateString()} -{" "}
            {new Date(vacation.endDate).toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-500">
            {vacation.workingDays} {t("vacation.workingDays").toLowerCase()}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: t("vacation.status"),
      render: (vacation: any) => getStatusBadge(vacation.status),
    },
    {
      key: "appliedDate",
      header: "Applied Date",
      render: (vacation: any) => (
        <span className="text-sm text-gray-600">
          {new Date(vacation.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return <Loading fullScreen text={t("common.loading")} />;
  }

  const approvedCount = filteredVacations.filter(
    (v: any) => v.status === "approved"
  ).length;
  const rejectedCount = filteredVacations.filter(
    (v: any) => v.status === "rejected"
  ).length;

  return (
    <PermissionGuard permission={Permission.VIEW_ALL_VACATIONS}>
      <div className="px-2 sm:px-0">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-start gap-1.5 sm:gap-2">
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                {t("nav.allVacations")}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                View all vacation requests (Approved & Rejected) across all
                departments
              </p>
            </div>
            <InfoTooltip text="View and track all vacation requests across the organization" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-3 mb-3 sm:mb-4">
          <Card padding="sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-gray-600 leading-tight">
                  {t("vacation.labels.totalRequests")}
                </p>
                <p className="text-base sm:text-xl md:text-2xl font-bold text-gray-900 mt-0.5">
                  {filteredVacations.length}
                </p>
              </div>
            </div>
          </Card>
          <Card padding="sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-gray-600 leading-tight">
                  {t("vacation.labels.approved")}
                </p>
                <p className="text-base sm:text-xl md:text-2xl font-bold text-green-600 mt-0.5">
                  {approvedCount}
                </p>
              </div>
            </div>
          </Card>
          <Card padding="sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] sm:text-xs text-gray-600 leading-tight">
                  {t("vacation.statuses.rejected")}
                </p>
                <p className="text-base sm:text-xl md:text-2xl font-bold text-red-600 mt-0.5">
                  {rejectedCount}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card padding="sm" className="mb-3 sm:mb-4">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
            <FunnelIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            <h3 className="text-sm sm:text-base font-bold text-gray-900">
              {t("vacation.labels.filters")}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-2.5 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 tap-target"
              >
                <option value="all">{t("vacation.labels.allStatus")}</option>
                <option value="approved">
                  {t("vacation.labels.approved")}
                </option>
                <option value="approved_by_chief">
                  {t("vacation.labels.approvedByChief")}
                </option>
                <option value="rejected">
                  {t("vacation.statuses.rejected")}
                </option>
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                Department
              </label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-2.5 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 tap-target"
              >
                <option value="all">
                  {t("vacation.labels.allDepartments")}
                </option>
                {departments.map((dept: any) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-2">
          {filteredVacations.length === 0 ? (
            <Card padding="sm">
              <p className="text-center text-xs sm:text-sm text-gray-500 py-4">
                No vacation requests found
              </p>
            </Card>
          ) : (
            filteredVacations.map((vacation: any) => (
              <Card
                key={vacation._id}
                padding="sm"
                className="cursor-pointer hover:shadow-md transition-shadow active:scale-[0.98]"
                onClick={() =>
                  router.push(`/dashboard/vacations/${vacation._id}`)
                }
              >
                <div className="space-y-1.5">
                  {/* Employee Info */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                        {vacation.employee?.name || "N/A"}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                        {vacation.employee?.role?.replace(/_/g, " ")}
                      </p>
                    </div>
                    {getStatusBadge(vacation.status)}
                  </div>

                  {/* Department & Type */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] sm:text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                      {vacation.department?.name || "N/A"}
                    </span>
                    <span className="text-[10px] sm:text-xs text-gray-600 bg-blue-50 px-2 py-0.5 rounded capitalize">
                      {vacation.vacationType?.replace(/_/g, " ")}
                    </span>
                    {vacation.isRewardVacation && (
                      <Badge variant="success" size="sm">
                        Reward
                      </Badge>
                    )}
                  </div>

                  {/* Dates */}
                  <div className="text-[10px] sm:text-xs text-gray-600 pt-1 border-t border-gray-100">
                    <span className="font-medium">
                      {new Date(vacation.startDate).toLocaleDateString()} -{" "}
                      {new Date(vacation.endDate).toLocaleDateString()}
                    </span>
                    <span className="text-gray-500 ml-2">
                      ({vacation.workingDays}{" "}
                      {t("vacation.workingDays").toLowerCase()})
                    </span>
                  </div>

                  {/* Applied Date */}
                  <div className="text-[10px] text-gray-400">
                    Applied: {new Date(vacation.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <Card padding="none" className="hidden lg:block">
          <Table
            data={filteredVacations}
            columns={columns}
            onRowClick={(vacation) =>
              router.push(`/dashboard/vacations/${vacation._id}`)
            }
            emptyMessage="No vacation requests found"
          />
        </Card>
      </div>
    </PermissionGuard>
  );
}
