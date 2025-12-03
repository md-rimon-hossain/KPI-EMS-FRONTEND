"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter, useParams } from "next/navigation";
import { usePermission } from "@/hooks/usePermission";
import { Permission } from "@/lib/permissions";
import {
  useGetLoanQuery,
  useApproveLoanMutation,
  useRejectLoanMutation,
  useReturnLoanMutation,
} from "@/store/loanApi";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Modal from "@/components/Modal";
import Loading from "@/components/Loading";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function LoanDetailPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const { can } = usePermission();

  const { data: loan, isLoading } = useGetLoanQuery(params?.id as string);
  const [approveLoan, { isLoading: isApproving }] = useApproveLoanMutation();
  const [rejectLoan, { isLoading: isRejecting }] = useRejectLoanMutation();
  const [returnLoan, { isLoading: isReturning }] = useReturnLoanMutation();

  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [returnModal, setReturnModal] = useState(false);
  const [notes, setNotes] = useState("");
  const [returnCondition, setReturnCondition] = useState<
    "excellent" | "good" | "fair" | "poor" | "damaged"
  >("good");

  const handleApprove = async () => {
    try {
      await approveLoan({ id: params?.id as string, notes }).unwrap();
      setApproveModal(false);
      setNotes("");
    } catch (error) {
      console.error("Failed to approve loan:", error);
    }
  };

  const handleReject = async () => {
    try {
      await rejectLoan({ id: params?.id as string, notes }).unwrap();
      setRejectModal(false);
      setNotes("");
    } catch (error) {
      console.error("Failed to reject loan:", error);
    }
  };

  const handleReturn = async () => {
    try {
      await returnLoan({
        id: params?.id as string,
        returnCondition,
        returnNotes: notes,
      }).unwrap();
      setReturnModal(false);
      setNotes("");
    } catch (error) {
      console.error("Failed to return loan:", error);
    }
  };

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

  if (isLoading) {
    return <Loading />;
  }

  if (!loan) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t("loan.noLoans")}</p>
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
            {t("loan.loanDetails")}
          </h1>
          <p className="text-gray-600">{loan.loanCode}</p>
        </div>
      </div>

      <Card>
        <div className="space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between pb-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              {t("loan.status")}
            </h2>
            <Badge variant={getStatusColor(loan.status)}>
              {t(`loan.statuses.${loan.status}`)}
            </Badge>
          </div>

          {/* Loan Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                {t("loan.inventoryItem")}
              </h3>
              <p className="text-gray-900 font-medium">
                {loan.inventoryItem.name} ({loan.inventoryItem.serialNumber})
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                {t("loan.lab")}
              </h3>
              <p className="text-gray-900 font-medium">
                {loan.lab.name} ({loan.lab.labCode})
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                {t("loan.requestedBy")}
              </h3>
              <p className="text-gray-900">{loan.requestedBy.name}</p>
              <p className="text-sm text-gray-500">{loan.requestedBy.email}</p>
            </div>
            {loan.approvedBy && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  {t("loan.approvedBy")}
                </h3>
                <p className="text-gray-900">{loan.approvedBy.name}</p>
                <p className="text-sm text-gray-500">{loan.approvedBy.email}</p>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                {t("loan.quantity")}
              </h3>
              <p className="text-gray-900 font-medium">{loan.quantity}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                {t("loan.expectedReturn")}
              </h3>
              <p className="text-gray-900">
                {new Date(loan.expectedReturnDate).toLocaleDateString()}
              </p>
            </div>
            {loan.actualReturnDate && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  {t("loan.actualReturn")}
                </h3>
                <p className="text-gray-900">
                  {new Date(loan.actualReturnDate).toLocaleDateString()}
                </p>
              </div>
            )}
            {loan.returnCondition && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  {t("loan.returnCondition")}
                </h3>
                <p className="text-gray-900">
                  {t(`inventory.conditions.${loan.returnCondition}`)}
                </p>
              </div>
            )}
          </div>

          {/* Purpose */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">
              {t("loan.purpose")}
            </h3>
            <p className="text-gray-900">{loan.purpose}</p>
          </div>

          {/* Notes */}
          {loan.notes && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                {t("loan.notes")}
              </h3>
              <p className="text-gray-900">{loan.notes}</p>
            </div>
          )}

          {/* Return Notes */}
          {loan.returnNotes && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                {t("loan.returnNotes")}
              </h3>
              <p className="text-gray-900">{loan.returnNotes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            {loan.status === "pending" && can(Permission.APPROVE_LOAN) && (
              <>
                <Button variant="outline" onClick={() => setRejectModal(true)}>
                  {t("loan.rejectLoan")}
                </Button>
                <Button variant="primary" onClick={() => setApproveModal(true)}>
                  {t("loan.approveLoan")}
                </Button>
              </>
            )}
            {(loan.status === "active" || loan.status === "overdue") &&
              can(Permission.RETURN_LOAN) && (
                <Button variant="primary" onClick={() => setReturnModal(true)}>
                  {t("loan.returnLoan")}
                </Button>
              )}
          </div>
        </div>
      </Card>

      {/* Approve Modal */}
      <Modal
        isOpen={approveModal}
        onClose={() => setApproveModal(false)}
        title={t("loan.approveLoan")}
      >
        <div className="space-y-4">
          <p className="text-gray-600">{t("loan.approveConfirm")}</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("loan.notes")}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setApproveModal(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={handleApprove}
              disabled={isApproving}
            >
              {isApproving ? t("common.loading") : t("common.approve")}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectModal}
        onClose={() => setRejectModal(false)}
        title={t("loan.rejectLoan")}
      >
        <div className="space-y-4">
          <p className="text-gray-600">{t("loan.rejectConfirm")}</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("loan.notes")}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setRejectModal(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={handleReject}
              disabled={isRejecting}
            >
              {isRejecting ? t("common.loading") : t("common.reject")}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Return Modal */}
      <Modal
        isOpen={returnModal}
        onClose={() => setReturnModal(false)}
        title={t("loan.returnLoan")}
      >
        <div className="space-y-4">
          <p className="text-gray-600">{t("loan.returnConfirm")}</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("loan.returnCondition")} *
            </label>
            <select
              value={returnCondition}
              onChange={(e) =>
                setReturnCondition(
                  e.target.value as
                    | "excellent"
                    | "good"
                    | "fair"
                    | "poor"
                    | "damaged"
                )
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="excellent">
                {t("inventory.conditions.excellent")}
              </option>
              <option value="good">{t("inventory.conditions.good")}</option>
              <option value="fair">{t("inventory.conditions.fair")}</option>
              <option value="poor">{t("inventory.conditions.poor")}</option>
              <option value="damaged">
                {t("inventory.conditions.damaged")}
              </option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("loan.returnNotes")}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setReturnModal(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={handleReturn}
              disabled={isReturning}
            >
              {isReturning ? t("common.loading") : t("loan.returnLoan")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
