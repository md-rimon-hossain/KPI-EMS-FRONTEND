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
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-start gap-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t("nav.allVacations")}
              </h1>
              <p className="text-gray-600 mt-1">
                View all vacation requests (Approved & Rejected) across all
                departments
              </p>
            </div>
            <InfoTooltip text="View and track all vacation requests across the organization" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredVacations.length}
                </p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {approvedCount}
                </p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {rejectedCount}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <FunnelIcon className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="approved">Approved</option>
                <option value="approved_by_chief">Approved by Chief</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Departments</option>
                {departments.map((dept: any) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Vacation Requests Table */}
        <Card padding="none">
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
