"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { usePermission } from "@/hooks/usePermission";
import { Permission } from "@/lib/permissions";
import { useGetLoansQuery } from "@/store/loanApi";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Table from "@/components/Table";
import Badge from "@/components/Badge";
import Loading from "@/components/Loading";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

export default function LoansPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { can, role } = usePermission();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const { data: loansData, isLoading } = useGetLoansQuery({
    page,
    limit: 20,
    status: selectedStatus || undefined,
    search: search || undefined,
  });

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

  const columns = [
    {
      key: "loanCode",
      header: t("loan.loanCode"),
      render: (loan: any) => (
        <span className="font-medium text-gray-900">{loan.loanCode}</span>
      ),
    },
    {
      key: "inventoryItem",
      header: t("loan.inventoryItem"),
      render: (loan: any) => (
        <span className="text-gray-900">{loan.inventoryItem?.name}</span>
      ),
    },
    {
      key: "lab",
      header: t("loan.lab"),
      render: (loan: any) => (
        <span className="text-gray-600">{loan.lab?.name}</span>
      ),
    },
    {
      key: "requestedBy",
      header: t("loan.requestedBy"),
      render: (loan: any) => (
        <span className="text-gray-600">{loan.requestedBy?.name}</span>
      ),
    },
    {
      key: "quantity",
      header: t("loan.quantity"),
      render: (loan: any) => (
        <span className="text-gray-600">{loan.quantity}</span>
      ),
    },
    {
      key: "expectedReturn",
      header: t("loan.expectedReturn"),
      render: (loan: any) => (
        <span className="text-gray-600">
          {new Date(loan.expectedReturnDate).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "status",
      header: t("loan.status"),
      render: (loan: any) => (
        <Badge variant={getStatusColor(loan.status)}>
          {t(`loan.statuses.${loan.status}`)}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: t("common.actions"),
      render: (loan: any) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/loans/${loan._id}`)}
          >
            <EyeIcon className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (!can(Permission.VIEW_LOANS)) {
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
            {t("loan.title")}
          </h1>
          <p className="text-gray-600 mt-1">{t("loan.subtitle")}</p>
        </div>
        {can(Permission.REQUEST_LOAN) &&
          (role === "chief_instructor" || role === "craft_instructor") && (
            <Button
              onClick={() => router.push("/dashboard/loans/request")}
              className="flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              {t("loan.requestLoan")}
            </Button>
          )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder={t("common.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">
              {t("common.select")} {t("loan.status")}
            </option>
            <option value="pending">{t("loan.statuses.pending")}</option>
            <option value="approved">{t("loan.statuses.approved")}</option>
            <option value="active">{t("loan.statuses.active")}</option>
            <option value="returned">{t("loan.statuses.returned")}</option>
            <option value="overdue">{t("loan.statuses.overdue")}</option>
            <option value="rejected">{t("loan.statuses.rejected")}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <Loading />
      ) : loansData?.loans && loansData.loans.length > 0 ? (
        <>
          <Table columns={columns} data={loansData.loans} />
          {loansData.total > 20 && (
            <div className="mt-4 flex justify-center gap-2">
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
                {Math.ceil(loansData.total / 20)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage(Math.min(Math.ceil(loansData.total / 20), page + 1))
                }
                disabled={page >= Math.ceil(loansData.total / 20)}
              >
                {t("common.next")}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">{t("loan.noLoans")}</p>
        </div>
      )}
    </div>
  );
}
