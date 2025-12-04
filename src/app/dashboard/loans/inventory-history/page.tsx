"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { usePermission } from "@/hooks/usePermission";
import { Permission } from "@/lib/permissions";
import { useGetMyLoanHistoryQuery } from "@/store/loanApi";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Loading from "@/components/Loading";
import Table from "@/components/Table";

export default function InventoryLoansHistoryPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { can } = usePermission();

  if (!can(Permission.VIEW_OWN_LOANS)) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{t("common.permissionDenied")}</p>
      </div>
    );
  }

  const { data: loansData, isLoading } = useGetMyLoanHistoryQuery();
  const loans = loansData?.loans || [];

  const getStatusColor = (status: string) => {
    const colors: Record<string, "success" | "warning" | "danger" | "gray"> = {
      pending: "warning",
      approved: "gray",
      active: "success",
      returned: "success",
      overdue: "danger",
      rejected: "danger",
    };
    return colors[status] || "gray";
  };

  const columns = [
    {
      header: t("loan.loanCode"),
      key: "loanCode" as const,
    },
    {
      header: t("loan.inventoryItem"),
      key: "inventoryItem" as const,
      render: (loan: any) => (
        <div>
          <div className="font-medium">{loan.inventoryItem?.name}</div>
          <div className="text-sm text-gray-500">
            {loan.inventoryItem?.serialNumber}
          </div>
        </div>
      ),
    },
    {
      header: t("loan.sourceLab"),
      key: "sourceLab" as const,
      render: (loan: any) => (
        <div>
          <div>{loan.sourceLab?.name}</div>
          <div className="text-sm text-gray-500">{loan.sourceLab?.labCode}</div>
        </div>
      ),
    },
    {
      header: t("loan.destinationLab"),
      key: "destinationLab" as const,
      render: (loan: any) => (
        <div>
          <div>{loan.destinationLab?.name}</div>
          <div className="text-sm text-gray-500">
            {loan.destinationLab?.labCode}
          </div>
        </div>
      ),
    },
    {
      header: t("loan.quantity"),
      key: "quantity" as const,
    },
    {
      header: t("loan.loanDate"),
      key: "loanDate" as const,
      render: (loan: any) => (
        <div>{new Date(loan.loanDate).toLocaleDateString()}</div>
      ),
    },
    {
      header: t("loan.returnDate"),
      key: "actualReturnDate" as const,
      render: (loan: any) => (
        <div>
          {loan.actualReturnDate ? (
            <span className="text-green-600">
              {new Date(loan.actualReturnDate).toLocaleDateString()}
            </span>
          ) : (
            <span className="text-gray-400">—</span>
          )}
        </div>
      ),
    },
    {
      header: t("loan.status"),
      key: "status" as const,
      render: (loan: any) => (
        <Badge variant={getStatusColor(loan.status)}>
          {t(`loan.statuses.${loan.status}`)}
        </Badge>
      ),
    },
    {
      header: t("common.actions"),
      key: "id" as const,
      render: (loan: any) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/dashboard/loans/${loan._id}`)}
        >
          {t("common.viewDetails")}
        </Button>
      ),
    },
  ];

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("loan.inventoryLoansHistory")}
          </h1>
          <p className="text-gray-600">
            {t("loan.inventoryLoansHistorySubtitle")}
          </p>
        </div>
      </div>

      <Card>
        {loans && loans.length > 0 ? (
          <Table columns={columns} data={loans} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">{t("loan.noLoanHistory")}</p>
          </div>
        )}
      </Card>
    </div>
  );
}
