"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  useGetMyVacationsQuery,
  useDownloadVacationPDFMutation,
} from "@/store/vacationApi";
import { useAppSelector } from "@/store/hooks";
import { usePermission } from "@/hooks/usePermission";
import { Permission } from "@/lib/permissions";
import {
  Can,
  PermissionGuard,
  InfoTooltip,
} from "@/components/PermissionComponents";
import Card from "@/components/Card";
import Table from "@/components/Table";
import Button from "@/components/Button";
import Badge, { getStatusBadgeVariant } from "@/components/Badge";
import Loading from "@/components/Loading";
import VacationSummaryCard from "@/components/VacationSummaryCard";
import {
  PlusIcon,
  GiftIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function VacationsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const { can } = usePermission();
  const { data: vacationsData, isLoading } = useGetMyVacationsQuery();
  const [downloadPDF, { isLoading: isDownloading }] =
    useDownloadVacationPDFMutation();
  const vacations = vacationsData?.data?.vacations || [];

  const handleDownloadPDF = async (vacationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const blob = await downloadPDF(vacationId).unwrap();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `vacation-approval-${vacationId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success(t("vacation.messages.downloadSuccess"));
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to download PDF");
    }
  };

  const columns = [
    {
      key: "vacationType",
      header: t("vacation.type"),
      render: (vacation: any) => (
        <span className="capitalize">
          {vacation.vacationType.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      key: "dates",
      header: t("vacation.dates"),
      render: (vacation: any) => (
        <div>
          <p className="text-sm">
            {new Date(vacation.startDate).toLocaleDateString()} -{" "}
            {new Date(vacation.endDate).toLocaleDateString()}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-gray-500">
              {vacation.workingDays} {t("vacation.workingDays").toLowerCase()}
            </p>
            {vacation.isRewardVacation && (
              <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                <GiftIcon className="w-3 h-3" />
                {t("vacationStatus.reward")}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "reason",
      header: t("vacation.reason"),
      render: (vacation: any) => (
        <p className="max-w-xs truncate">{vacation.reason}</p>
      ),
    },
    {
      key: "status",
      header: t("vacation.status"),
      render: (vacation: any) => (
        <Badge variant={getStatusBadgeVariant(vacation.status)}>
          {vacation.status.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      key: "appliedOn",
      header: t("vacation.startDate"),
      render: (vacation: any) =>
        new Date(vacation.createdAt).toLocaleDateString(),
    },
    {
      key: "actions",
      header: t("common.actions"),
      render: (vacation: any) => (
        <div className="flex gap-2">
          {vacation.status === "approved" && (
            <Can permission={Permission.DOWNLOAD_VACATION_PDF}>
              <button
                onClick={(e) => handleDownloadPDF(vacation._id, e)}
                className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                disabled={isDownloading}
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                {t("vacation.downloadPDF")}
              </button>
            </Can>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <Loading fullScreen text={t("common.loading")} />;
  }

  return (
    <PermissionGuard permission={Permission.VIEW_OWN_VACATIONS}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div className="flex items-start gap-2">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                {t("vacation.myVacations")}
              </h1>
              <p className="text-gray-600 mt-2">
                {t("vacation.applySubtitle")}
              </p>
            </div>
            <InfoTooltip
              text={
                t("vacation.myVacationsTooltip") ||
                "View and manage your vacation requests"
              }
            />
          </div>
          <Can permission={Permission.APPLY_VACATION}>
            <Button
              variant="primary"
              onClick={() => router.push("/dashboard/vacations/apply")}
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              {t("vacation.apply")}
            </Button>
          </Can>
        </div>

        {/* Vacation Summary Card */}
        <div className="mb-6">
          <VacationSummaryCard />
        </div>

        {/* Vacation Requests Table */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {t("vacation.myVacations")}
          </h2>
        </div>

        <Card padding="none">
          <Table
            data={vacations || []}
            columns={columns}
            onRowClick={(vacation) =>
              router.push(`/dashboard/vacations/${vacation._id}`)
            }
            emptyMessage={t("vacation.noVacations")}
          />
        </Card>

        {/* Pending Vacations for Chief/Principal */}
        <Can permission={Permission.APPROVE_AS_CHIEF}>
          <div className="mt-6">
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t("roles.chief_instructor")} - {t("vacation.pendingApprovals")}
              </h2>
              <p className="text-gray-600 mb-4">{t("approval.noRequests")}</p>
              <Button
                variant="primary"
                onClick={() =>
                  router.push("/dashboard/vacations/pending-chief")
                }
                fullWidth
              >
                {t("approval.viewDetails")}
              </Button>
            </Card>
          </div>
        </Can>

        <Can permission={Permission.APPROVE_AS_PRINCIPAL}>
          <div className="mt-6">
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t("roles.principal")} - {t("common.approve")}
              </h2>
              <p className="text-gray-600 mb-4">{t("approval.noRequests")}</p>
              <Button
                variant="primary"
                onClick={() =>
                  router.push("/dashboard/vacations/pending-principal")
                }
                fullWidth
              >
                {t("approval.viewDetails")}
              </Button>
            </Card>
          </div>
        </Can>
      </div>
    </PermissionGuard>
  );
}
