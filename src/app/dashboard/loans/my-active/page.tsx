"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { usePermission } from "@/hooks/usePermission";
import { Permission } from "@/lib/permissions";
import { useGetMyActiveLoansQuery } from "@/store/loanApi";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Loading from "@/components/Loading";
import Table from "@/components/Table";

export default function MyActiveLoansPage() {
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

  const { data: loansData, isLoading } = useGetMyActiveLoansQuery();
  const loans = loansData?.loans || [];

  const getStatusColor = (status: string) => {
    const colors: Record<string, "success" | "warning" | "danger" | "gray"> = {
      pending: "warning",
      approved: "gray",
      active: "success",
      returned: "gray",
      overdue: "danger",
      rejected: "danger",
    };
    return colors[status] || "gray";
  };

  const getDaysRemaining = (expectedReturnDate: string) => {
    const today = new Date();
    const returnDate = new Date(expectedReturnDate);
    const diffTime = returnDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
          <div className="font-medium">{loan.inventoryItem.name}</div>
          <div className="text-sm text-gray-500">
            {loan.inventoryItem.serialNumber}
          </div>
        </div>
      ),
    },
    {
      header: t("loan.lab"),
      key: "lab" as const,
      render: (loan: any) => (
        <div>
          <div>{loan.lab.name}</div>
          <div className="text-sm text-gray-500">
            {loan.lab.labCode}
            {loan.lab.department && ` - ${loan.lab.department.name}`}
          </div>
        </div>
      ),
    },
    {
      header: t("loan.quantity"),
      key: "quantity" as const,
    },
    {
      header: t("loan.expectedReturn"),
      key: "expectedReturnDate" as const,
      render: (loan: any) => {
        const daysRemaining = getDaysRemaining(loan.expectedReturnDate);
        const isOverdue = daysRemaining < 0;
        return (
          <div>
            <div
              className={
                isOverdue ? "text-red-600 font-medium" : "text-gray-900"
              }
            >
              {new Date(loan.expectedReturnDate).toLocaleDateString()}
            </div>
            <div
              className={`text-sm ${
                isOverdue ? "text-red-500" : "text-gray-500"
              }`}
            >
              {isOverdue
                ? `${Math.abs(daysRemaining)} ${t("loan.daysOverdue")}`
                : daysRemaining === 0
                ? t("loan.dueToday")
                : `${daysRemaining} ${t("loan.daysRemaining")}`}
            </div>
          </div>
        );
      },
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
          onClick={() => router.push(`/dashboard/loans/${loan.id}`)}
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
            {t("loan.myActiveLoans")}
          </h1>
          <p className="text-gray-600">{t("loan.myActiveLoansSubtitle")}</p>
        </div>
        {can(Permission.REQUEST_LOAN) && (
          <Button
            variant="primary"
            onClick={() => router.push("/dashboard/loans/request")}
          >
            {t("loan.requestLoan")}
          </Button>
        )}
      </div>

      <Card>
        {loans && loans.length > 0 ? (
          <Table columns={columns} data={loans} />
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">{t("loan.noActiveLoans")}</p>
            {can(Permission.REQUEST_LOAN) && (
              <Button
                variant="primary"
                onClick={() => router.push("/dashboard/loans/request")}
                className="mt-4"
              >
                {t("loan.requestLoan")}
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
