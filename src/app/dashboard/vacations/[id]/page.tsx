"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  useGetVacationByIdQuery,
  useReviewByChiefMutation,
  useReviewByPrincipalMutation,
} from "@/store/vacationApi";
import { useAppSelector } from "@/store/hooks";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import { ConfirmModal } from "@/components/Modal";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function VacationDetailsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user } = useAppSelector((state) => state.auth);

  const { data: vacationData, isLoading } = useGetVacationByIdQuery(id);
  const vacation = vacationData?.data?.vacation;

  const [reviewByChief, { isLoading: isChiefReviewing }] =
    useReviewByChiefMutation();
  const [reviewByPrincipal, { isLoading: isPrincipalReviewing }] =
    useReviewByPrincipalMutation();

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<string>("");
  const [remarks, setRemarks] = useState("");

  const canReviewAsChief =
    (user?.role === "chief_instructor" || user?.role === "general_head") &&
    vacation?.status === "pending";
  const canReviewAsPrincipal =
    user?.role === "principal" &&
    (vacation?.status === "pending" ||
      vacation?.status === "approved_by_chief");

  const handleReview = async () => {
    if (!vacation) return;

    if (reviewAction === "rejected" && !remarks.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    // Validate vacation ID
    if (!vacation._id) {
      toast.error("Invalid vacation ID");
      console.error("Vacation object missing _id:", vacation);
      return;
    }

    try {
      console.log("Reviewing vacation with ID:", vacation._id);
      if (user?.role === "chief_instructor" || user?.role === "general_head") {
        await reviewByChief({
          id: vacation._id,
          status: reviewAction as any,
          remarks: remarks.trim() || undefined,
        }).unwrap();
      } else if (user?.role === "principal") {
        await reviewByPrincipal({
          id: vacation._id,
          status: reviewAction as any,
          remarks: remarks.trim() || undefined,
        }).unwrap();
      }

      toast.success(
        `Vacation ${
          reviewAction === "approved" || reviewAction === "approved_by_chief"
            ? "approved"
            : "rejected"
        } successfully`
      );
      setReviewModalOpen(false);
      setRemarks("");
      router.push(
        user?.role === "chief_instructor" || user?.role === "general_head"
          ? "/dashboard/vacations/pending-chief"
          : "/dashboard/vacations/pending-principal"
      );
    } catch (error: any) {
      console.error("Review error:", error);
      toast.error(error?.data?.message || "Failed to review vacation");
    }
  };

  const openReviewModal = (action: string) => {
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
        className={`px-3 py-1 rounded-full text-sm font-medium ${
          statusColors[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status.replace(/_/g, " ").toUpperCase()}
      </span>
    );
  };

  if (isLoading) {
    return <Loading fullScreen text="Loading vacation details..." />;
  }

  if (!vacation) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">{t("vacation.messages.notFound")}</p>
        <Button
          variant="primary"
          onClick={() => router.push("/dashboard/vacations")}
          className="mt-4"
        >
          Back to Vacations
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Button
          variant="secondary"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Vacation Request Details
            </h1>
            <p className="text-gray-600 mt-1">
              Submitted on {new Date(vacation.createdAt).toLocaleString()}
            </p>
          </div>
          <div>{getStatusBadge(vacation.status)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Employee Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Name
                </label>
                <p className="text-gray-900">
                  {typeof vacation.employee === "object"
                    ? vacation.employee.name
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Email
                </label>
                <p className="text-gray-900">
                  {typeof vacation.employee === "object"
                    ? vacation.employee.email
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Role
                </label>
                <p className="text-gray-900 capitalize">
                  {typeof vacation.employee === "object"
                    ? vacation.employee.role?.replace(/_/g, " ")
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Department
                </label>
                <p className="text-gray-900">
                  {typeof vacation.department === "object"
                    ? vacation.department.name
                    : "N/A"}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Vacation Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Vacation Type
                </label>
                <p className="text-gray-900 capitalize">
                  {vacation.vacationType?.replace(/_/g, " ")}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Start Date
                  </label>
                  <p className="text-gray-900">
                    {new Date(vacation.startDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    End Date
                  </label>
                  <p className="text-gray-900">
                    {new Date(vacation.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Total Days
                </label>
                <p className="text-gray-900 font-semibold">
                  {vacation.totalDays} days
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Reason
                </label>
                <p className="text-gray-900 whitespace-pre-wrap">
                  {vacation.reason}
                </p>
              </div>
            </div>
          </Card>

          {/* Review History */}
          {(vacation.reviewedByChief || vacation.reviewedByPrincipal) && (
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Review History
              </h2>
              <div className="space-y-4">
                {vacation.reviewedByChief && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-blue-900">
                        Chief Instructor Review
                      </p>
                      <p className="text-sm text-blue-600">
                        {vacation.chiefReviewDate &&
                          new Date(
                            vacation.chiefReviewDate
                          ).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-sm text-blue-800 mb-1">
                      Reviewed by:{" "}
                      {typeof vacation.reviewedByChief === "object"
                        ? vacation.reviewedByChief.name
                        : "N/A"}
                    </p>
                    {vacation.chiefRemarks && (
                      <p className="text-sm text-blue-700 mt-2">
                        <strong>Remarks:</strong> {vacation.chiefRemarks}
                      </p>
                    )}
                  </div>
                )}

                {vacation.reviewedByPrincipal && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-green-900">
                        Principal Review (Final)
                      </p>
                      <p className="text-sm text-green-600">
                        {vacation.principalReviewDate &&
                          new Date(
                            vacation.principalReviewDate
                          ).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-sm text-green-800 mb-1">
                      Reviewed by:{" "}
                      {typeof vacation.reviewedByPrincipal === "object"
                        ? vacation.reviewedByPrincipal.name
                        : "N/A"}
                    </p>
                    {vacation.principalRemarks && (
                      <p className="text-sm text-green-700 mt-2">
                        <strong>Remarks:</strong> {vacation.principalRemarks}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-6">
          {(canReviewAsChief || canReviewAsPrincipal) && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Review Actions
              </h2>
              <div className="space-y-3">
                <Button
                  variant="primary"
                  onClick={() =>
                    openReviewModal(
                      canReviewAsChief ? "approved_by_chief" : "approved"
                    )
                  }
                  fullWidth
                >
                  Approve Vacation
                </Button>
                <Button
                  variant="danger"
                  onClick={() => openReviewModal("rejected")}
                  fullWidth
                >
                  Reject Vacation
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                {canReviewAsChief &&
                  "Approved vacations will be forwarded to the Principal for final approval."}
                {canReviewAsPrincipal &&
                  "As Principal, your decision is final. Approved vacations will be granted immediately."}
              </p>
            </Card>
          )}

          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Vacation Information
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium">
                  {vacation.status.replace(/_/g, " ").toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Extension:</span>
                <span className="font-medium">
                  {vacation.isExtension ? "Yes" : "No"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Applied On:</span>
                <span className="font-medium">
                  {new Date(vacation.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Review Modal */}
      <ConfirmModal
        isOpen={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setRemarks("");
        }}
        onConfirm={handleReview}
        title={`${
          reviewAction === "approved" || reviewAction === "approved_by_chief"
            ? "Approve"
            : "Reject"
        } Vacation Request`}
        message={
          <div className="space-y-4">
            <p>
              {reviewAction === "approved" ||
              reviewAction === "approved_by_chief"
                ? `Are you sure you want to approve this vacation request?${
                    canReviewAsChief
                      ? " It will be forwarded to the Principal for final approval."
                      : " This is the final approval."
                  }`
                : "Are you sure you want to reject this vacation request? The employee's vacation balance will be restored."}
            </p>
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
                  reviewAction === "approved" ||
                  reviewAction === "approved_by_chief"
                    ? "Optional remarks..."
                    : "Please provide a reason for rejection (required)"
                }
                required={reviewAction === "rejected"}
              />
            </div>
          </div>
        }
        confirmText={
          reviewAction === "approved" || reviewAction === "approved_by_chief"
            ? "Approve"
            : "Reject"
        }
        variant={
          reviewAction === "approved" || reviewAction === "approved_by_chief"
            ? "info"
            : "danger"
        }
        loading={isChiefReviewing || isPrincipalReviewing}
      />
    </div>
  );
}
