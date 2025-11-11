"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useGetPendingForPrincipalQuery,
  useReviewByPrincipalMutation,
} from "@/store/vacationApi";
import Card from "@/components/Card";
import Table from "@/components/Table";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import { ConfirmModal } from "@/components/Modal";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function PendingPrincipalPage() {
  const router = useRouter();
  const { data: vacationsData, isLoading } = useGetPendingForPrincipalQuery();
  const vacations = vacationsData?.data?.vacations || [];
  const [reviewByPrincipal, { isLoading: isReviewing }] =
    useReviewByPrincipalMutation();

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedVacation, setSelectedVacation] = useState<any>(null);
  const [reviewAction, setReviewAction] = useState<"approved" | "rejected">(
    "approved"
  );
  const [remarks, setRemarks] = useState("");

  const handleReview = async () => {
    if (!selectedVacation) return;

    if (reviewAction === "rejected" && !remarks.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      await reviewByPrincipal({
        id: selectedVacation._id,
        status: reviewAction as any,
        remarks: remarks.trim() || undefined,
      }).unwrap();

      toast.success(
        `Vacation ${
          reviewAction === "approved" ? "approved" : "rejected"
        } successfully`
      );
      setReviewModalOpen(false);
      setSelectedVacation(null);
      setRemarks("");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to review vacation");
    }
  };

  const openReviewModal = (vacation: any, action: "approved" | "rejected") => {
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
      key: "department",
      header: "Department",
      render: (vacation: any) => (
        <span className="text-sm text-gray-700">
          {vacation.department?.name || "N/A"}
        </span>
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
      key: "status",
      header: "Status",
      render: (vacation: any) => (
        <div>
          {getStatusBadge(vacation.status)}
          {vacation.reviewedByChief && (
            <p className="text-xs text-gray-500 mt-1">
              Approved by: {vacation.reviewedByChief.name}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      width: "180px",
      render: (vacation: any) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openReviewModal(vacation, "approved");
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Principal - Vacation Final Approval
          </h1>
          <p className="text-gray-600 mt-1">
            Review and make final decision on vacation requests
          </p>
        </div>
        <Button variant="secondary" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
      </div>

      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> As Principal, you have the final authority to
          approve or reject vacation requests. Approved vacations will be
          granted immediately. Rejected requests will restore the employee's
          vacation balance.
        </p>
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
          reviewAction === "approved" ? "Approve" : "Reject"
        } Vacation Request (Final)`}
        message={
          <div className="space-y-4">
            <p>
              {reviewAction === "approved"
                ? "Are you sure you want to approve this vacation request? This is the final approval and the vacation will be granted immediately."
                : "Are you sure you want to reject this vacation request? The employee's vacation balance will be restored."}
            </p>
            <div>
              <p className="font-medium mb-2">
                Employee: {selectedVacation?.employee?.name}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Department: {selectedVacation?.department?.name}
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Vacation Type:{" "}
                {selectedVacation?.vacationType
                  ?.replace(/_/g, " ")
                  .toUpperCase()}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Duration:{" "}
                {new Date(selectedVacation?.startDate).toLocaleDateString()} to{" "}
                {new Date(selectedVacation?.endDate).toLocaleDateString()} (
                {selectedVacation?.totalDays} days)
              </p>
              {selectedVacation?.chiefRemarks && (
                <div className="bg-gray-50 p-3 rounded-lg mb-2">
                  <p className="text-xs font-medium text-gray-700 mb-1">
                    Chief Instructor Remarks:
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedVacation.chiefRemarks}
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Remarks{" "}
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
                  reviewAction === "approved"
                    ? "Optional remarks for approval..."
                    : "Please provide a reason for rejection (required)"
                }
                required={reviewAction === "rejected"}
              />
            </div>
          </div>
        }
        confirmText={reviewAction === "approved" ? "Approve (Final)" : "Reject"}
        variant={reviewAction === "approved" ? "info" : "danger"}
        loading={isReviewing}
      />
    </div>
  );
}
