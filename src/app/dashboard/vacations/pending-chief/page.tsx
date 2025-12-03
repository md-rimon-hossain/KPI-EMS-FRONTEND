"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  useGetPendingForChiefQuery,
  useReviewByChiefMutation,
  Vacation,
} from "@/store/vacationApi";
import { Permission } from "@/lib/permissions";
import {
  PermissionGuard,
  InfoTooltip,
} from "@/components/PermissionComponents";
import Card from "@/components/Card";
import Table from "@/components/Table";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import { ConfirmModal } from "@/components/Modal";
import EditVacationDatesModal from "@/components/EditVacationDatesModal";
import {
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function PendingChiefPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { data: vacationsData, isLoading } = useGetPendingForChiefQuery();
  const vacations = vacationsData?.data?.vacations || [];
  const [reviewByChief, { isLoading: isReviewing }] =
    useReviewByChiefMutation();

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedVacation, setSelectedVacation] = useState<any>(null);
  const [reviewAction, setReviewAction] = useState<
    "approved_by_chief" | "rejected"
  >("approved_by_chief");
  const [remarks, setRemarks] = useState("");
  const [editingVacation, setEditingVacation] = useState<Vacation | null>(null);

  const handleReview = async () => {
    if (!selectedVacation) return;

    // Validate vacation ID
    if (!selectedVacation._id) {
      toast.error("Invalid vacation ID");
      console.error("Vacation object missing _id:", selectedVacation);
      return;
    }

    try {
      console.log("Reviewing vacation with ID:", selectedVacation._id);
      await reviewByChief({
        id: selectedVacation._id,
        status: reviewAction as any,
        remarks: remarks.trim() || undefined,
      }).unwrap();

      toast.success(
        `Vacation ${
          reviewAction === "approved_by_chief" ? "approved" : "rejected"
        } successfully`
      );
      setReviewModalOpen(false);
      setSelectedVacation(null);
      setRemarks("");
    } catch (error: any) {
      console.error("Review error:", error);
      toast.error(error?.data?.message || "Failed to review vacation");
    }
  };

  const openReviewModal = (
    vacation: any,
    action: "approved_by_chief" | "rejected"
  ) => {
    setSelectedVacation(vacation);
    setReviewAction(action);
    setRemarks("");
    setReviewModalOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusColors: any = {
      pending: "bg-yellow-100 text-yellow-800",
      approved_by_chief: "bg-blue-100 text-blue-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          statusColors[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status.replace(/_/g, " ").toUpperCase()}
      </span>
    );
  };

  const columns = [
    {
      key: "employee",
      header: "Employee",
      render: (vacation: any) => (
        <div>
          <p className="font-medium text-gray-900">
            {vacation.employee?.name || "N/A"}
          </p>
          <p className="text-sm text-gray-500">{vacation.employee?.email}</p>
        </div>
      ),
    },
    {
      key: "vacationType",
      header: "Vacation Type",
      render: (vacation: any) => (
        <span className="capitalize">
          {vacation.vacationType?.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      key: "dates",
      header: "Dates",
      render: (vacation: any) => (
        <div>
          <p className="text-sm text-gray-900">
            {new Date(vacation.startDate).toLocaleDateString()} -{" "}
            {new Date(vacation.endDate).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-500">{vacation.totalDays} days</p>
        </div>
      ),
    },
    {
      key: "reason",
      header: "Reason",
      render: (vacation: any) => (
        <p className="text-sm text-gray-600 max-w-xs truncate">
          {vacation.reason}
        </p>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (vacation: any) => getStatusBadge(vacation.status),
    },
    {
      key: "actions",
      header: "Actions",
      width: "220px",
      render: (vacation: any) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditingVacation(vacation);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Edit Dates"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openReviewModal(vacation, "approved_by_chief");
            }}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="Approve"
          >
            <CheckCircleIcon className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openReviewModal(vacation, "rejected");
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Reject"
          >
            <XCircleIcon className="w-5 h-5" />
          </button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <Loading fullScreen text="Loading pending vacations..." />;
  }

  return (
    <PermissionGuard permission={Permission.APPROVE_AS_CHIEF}>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-start gap-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t("vacation.pendingChiefTitle") ||
                  "Pending Vacation Approvals"}
              </h1>
              <p className="text-gray-600 mt-1">
                {t("vacation.pendingChiefDesc") ||
                  "Review and approve vacation requests from your department"}
              </p>
            </div>
            <InfoTooltip
              text={
                t("vacation.chiefApprovalTooltip") ||
                "Review department employee vacation requests as chief instructor"
              }
            />
          </div>
          <Button
            variant="secondary"
            onClick={() => router.push("/dashboard/vacations")}
          >
            {t("common.back")}
          </Button>
        </div>

        <Card padding="none">
          <Table
            data={vacations || []}
            columns={columns}
            onRowClick={(vacation) =>
              router.push(`/dashboard/vacations/${vacation._id}`)
            }
            emptyMessage="No pending vacation requests"
          />
        </Card>

        {/* Review Modal */}
        <ConfirmModal
          isOpen={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false);
            setSelectedVacation(null);
            setRemarks("");
          }}
          onConfirm={handleReview}
          title={`${
            reviewAction === "approved_by_chief" ? "Approve" : "Reject"
          } Vacation Request`}
          message={
            <div className="space-y-4">
              <p>
                {reviewAction === "approved_by_chief"
                  ? "Are you sure you want to approve this vacation request? It will be forwarded to the Principal for final approval."
                  : "Are you sure you want to reject this vacation request? The employee's vacation balance will be restored."}
              </p>
              <div>
                <p className="font-medium mb-2">
                  Employee: {selectedVacation?.employee?.name}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Vacation Type:{" "}
                  {selectedVacation?.vacationType
                    ?.replace(/_/g, " ")
                    .toUpperCase()}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Duration:{" "}
                  {new Date(selectedVacation?.startDate).toLocaleDateString()}{" "}
                  to {new Date(selectedVacation?.endDate).toLocaleDateString()}{" "}
                  ({selectedVacation?.totalDays} days)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks{" "}
                  {reviewAction === "rejected" && (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={
                    reviewAction === "approved_by_chief"
                      ? "Optional remarks for approval..."
                      : "Please provide a reason for rejection"
                  }
                  required={reviewAction === "rejected"}
                />
              </div>
            </div>
          }
          confirmText={
            reviewAction === "approved_by_chief"
              ? t("common.approve")
              : t("common.reject")
          }
        />
      </div>

      {/* Edit Vacation Dates Modal */}
      {editingVacation && (
        <EditVacationDatesModal
          isOpen={!!editingVacation}
          onClose={() => setEditingVacation(null)}
          vacation={editingVacation}
        />
      )}
    </PermissionGuard>
  );
}
