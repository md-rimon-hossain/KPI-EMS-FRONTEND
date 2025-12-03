"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store/hooks";
import { useGetVacationsByDepartmentQuery } from "@/store/vacationApi";
import { Permission } from "@/lib/permissions";
import {
  PermissionGuard,
  InfoTooltip,
} from "@/components/PermissionComponents";
import Card from "@/components/Card";
import Table from "@/components/Table";
import Loading from "@/components/Loading";
import Badge from "@/components/Badge";
import { FunnelIcon } from "@heroicons/react/24/outline";

export default function DepartmentVacationsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: vacationsData, isLoading } = useGetVacationsByDepartmentQuery(
    user?.department?._id || "",
    { skip: !user?.department?._id }
  );

  const vacations = vacationsData?.data?.vacations || [];

  // Filter vacations (exclude pending)
  const filteredVacations = vacations.filter((vacation: any) => {
    // Exclude pending vacations
    if (vacation.status === "pending") return false;

    // Status filter
    if (statusFilter !== "all" && vacation.status !== statusFilter) {
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
      key: "reviewedBy",
      header: "Reviewed By",
      render: (vacation: any) => (
        <div className="text-sm">
          {vacation.status === "approved" && vacation.reviewedByPrincipal && (
            <p className="text-green-600">
              ✓ Principal: {vacation.reviewedByPrincipal.name}
            </p>
          )}
          {vacation.reviewedByChief && (
            <p className="text-blue-600">
              ✓ Chief: {vacation.reviewedByChief.name}
            </p>
          )}
        </div>
      ),
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
    <PermissionGuard permission={Permission.VIEW_DEPARTMENT_VACATIONS}>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-start gap-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t("nav.departmentVacations")}
              </h1>
              <p className="text-gray-600 mt-1">
                View all vacation requests (Approved & Rejected) in your
                department
              </p>
              {user?.department && (
                <p className="text-sm text-blue-600 mt-1">
                  Department: {user.department.name}
                </p>
              )}
            </div>
            <InfoTooltip text="View and track all vacation requests in your department" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {t("vacation.labels.totalRequests")}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {filteredVacations.length}
                </p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {t("vacation.labels.approved")}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {approvedCount}
                </p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {t("vacation.statuses.rejected")}
                </p>
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
            <h3 className="text-lg font-semibold text-gray-900">
              Filter by Status
            </h3>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">{t("vacation.labels.allStatus")}</option>
            <option value="approved">{t("vacation.labels.approved")}</option>
            <option value="approved_by_chief">
              {t("vacation.labels.approvedByChief")}
            </option>
            <option value="rejected">{t("vacation.statuses.rejected")}</option>
          </select>
        </Card>

        {/* Vacation Requests Table */}
        <Card padding="none">
          <Table
            data={filteredVacations}
            columns={columns}
            onRowClick={(vacation) =>
              router.push(`/dashboard/vacations/${vacation._id}`)
            }
            emptyMessage="No vacation requests found in your department"
          />
        </Card>
      </div>
    </PermissionGuard>
  );
}
