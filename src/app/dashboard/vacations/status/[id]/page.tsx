"use client";

import { useParams, useRouter } from "next/navigation";
import { useGetVacationByIdQuery } from "@/store/vacationApi";
import { useAppSelector } from "@/store/hooks";
import VacationStatusTracker from "@/components/VacationStatusTracker";
import VacationStatusFlow from "@/components/VacationStatusFlow";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  ClockIcon,
  DocumentTextIcon,
  UserIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

export default function VacationStatusPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const vacationId = params.id as string;

  const { data, isLoading, error } = useGetVacationByIdQuery(vacationId);

  const handleDownloadPDF = async () => {
    try {
      toast.success("Generating PDF...");

      // TODO: Implement actual PDF generation
      // For now, we'll create a simple download
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/vacations/${vacationId}/pdf`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to download PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vacation-approval-${vacationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("PDF downloaded successfully!");
    } catch (err) {
      toast.error("Failed to download PDF. Feature coming soon!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.data?.vacation) {
    console.error("Vacation fetch error:", error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Vacation Request Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The vacation request you're looking for doesn't exist or you don't
              have permission to view it.
            </p>
            <button
              onClick={() => router.push("/dashboard/vacations/my-vacations")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to My Vacations
            </button>
          </div>
        </div>
      </div>
    );
  }

  const vacation = data.data.vacation;

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      pending: { variant: "warning", label: "Pending" },
      approved_by_chief: { variant: "info", label: "Approved by Chief" },
      approved: { variant: "success", label: "Fully Approved" },
      rejected: { variant: "danger", label: "Rejected" },
    };
    const config = statusConfig[status] || {
      variant: "default",
      label: status,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Determine if chief review is required
  const isChiefRequired =
    vacation.employee?.role !== "principal" &&
    vacation.employee?.role !== "chief_instructor";

  // Calculate remaining balance
  const currentBalance = vacation.isRewardVacation
    ? user?.rewardVacationBalance || 0
    : user?.vacationBalance || 0;
  const remainingBalance = currentBalance - vacation.workingDays;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back
          </button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Vacation Request Details
              </h1>
              <p className="text-gray-600 mt-1">
                Request ID:{" "}
                <span className="font-mono font-semibold">
                  {vacation._id.slice(-8).toUpperCase()}
                </span>
              </p>
            </div>
            {getStatusBadge(vacation.status)}
          </div>
        </div>

        {/* Status Flow */}
        <Card className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ClockIcon className="w-6 h-6 text-blue-600" />
            Request Progress
          </h2>
          <VacationStatusFlow
            status={vacation.status}
            reviewedByChief={
              vacation.reviewedByChief
                ? {
                    name: vacation.reviewedByChief.name,
                    reviewedAt:
                      vacation.chiefReviewDate ||
                      vacation.reviewedByChief.reviewedAt ||
                      "",
                  }
                : null
            }
            reviewedByPrincipal={
              vacation.reviewedByPrincipal
                ? {
                    name: vacation.reviewedByPrincipal.name,
                    reviewedAt:
                      vacation.principalReviewDate ||
                      vacation.reviewedByPrincipal.reviewedAt ||
                      "",
                  }
                : null
            }
            chiefReviewComment={vacation.chiefRemarks}
            principalReviewComment={vacation.principalRemarks}
            isChiefRequired={isChiefRequired}
          />
        </Card>

        {/* Vacation Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Basic Information */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <DocumentTextIcon className="w-5 h-5 text-blue-600" />
              Vacation Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-600">
                  {t("vacation.labels.vacationType")}
                </p>
                <p className="font-semibold text-gray-900">
                  {vacation.isRewardVacation
                    ? "Reward Vacation"
                    : "Annual Vacation"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">
                  {t("vacation.labels.startDate")}
                </p>
                <p className="font-semibold text-gray-900">
                  {format(new Date(vacation.startDate), "MMMM dd, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">
                  {t("vacation.labels.endDate")}
                </p>
                <p className="font-semibold text-gray-900">
                  {format(new Date(vacation.endDate), "MMMM dd, yyyy")}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">
                  {t("vacation.labels.workingDays")}
                </p>
                <p className="font-semibold text-gray-900">
                  {vacation.workingDays}{" "}
                  {vacation.workingDays === 1 ? "day" : "days"}
                </p>
              </div>
              {vacation.reason && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">
                    {t("vacation.labels.reason")}
                  </p>
                  <p className="text-sm text-gray-700 p-3 bg-gray-50 rounded-lg">
                    {vacation.reason}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Applicant & Balance Info */}
          <Card>
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-blue-600" />
              Applicant Information
            </h3>
            <div className="space-y-3 mb-6">
              <div>
                <p className="text-xs text-gray-600">
                  {t("vacation.labels.name")}
                </p>
                <p className="font-semibold text-gray-900">
                  {vacation.employee?.name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">
                  {t("vacation.labels.role")}
                </p>
                <p className="font-semibold text-gray-900 capitalize">
                  {vacation.employee?.role?.replace(/_/g, " ") || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">
                  {t("vacation.labels.department")}
                </p>
                <p className="font-semibold text-gray-900">
                  {vacation.employee?.department?.name || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">
                  {t("vacation.labels.appliedOn")}
                </p>
                <p className="font-semibold text-gray-900">
                  {format(new Date(vacation.createdAt), "MMMM dd, yyyy")}
                </p>
              </div>
            </div>

            {/* Balance Info */}
            <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Vacation Balance Impact
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-600">
                    {t("vacation.labels.currentBalance")}
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {currentBalance} days
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-600">
                    {t("vacation.labels.daysRequested")}
                  </p>
                  <p className="text-lg font-bold text-orange-600">
                    -{vacation.workingDays} days
                  </p>
                </div>
                <div className="h-px bg-gray-300 my-2"></div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-600 font-semibold">
                    {vacation.status === "approved"
                      ? "Remaining Balance"
                      : "Balance After Approval"}
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {remainingBalance} days
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Review Comments */}
        {(vacation.chiefRemarks || vacation.principalRemarks) && (
          <Card className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Review Comments
            </h3>
            <div className="space-y-4">
              {vacation.chiefRemarks && vacation.reviewedByChief && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-900">
                          Chief Instructor Review
                        </p>
                        <p className="text-xs text-gray-600">
                          {format(
                            new Date(
                              vacation.chiefReviewDate ||
                                vacation.reviewedByChief.reviewedAt ||
                                vacation.updatedAt
                            ),
                            "MMM dd, yyyy"
                          )}
                        </p>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {vacation.chiefRemarks}
                      </p>
                      <p className="text-xs text-gray-600">
                        by {vacation.reviewedByChief.name}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {vacation.principalRemarks && vacation.reviewedByPrincipal && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold text-gray-900">
                          Principal Review
                        </p>
                        <p className="text-xs text-gray-600">
                          {format(
                            new Date(
                              vacation.principalReviewDate ||
                                vacation.reviewedByPrincipal.reviewedAt ||
                                vacation.updatedAt
                            ),
                            "MMM dd, yyyy"
                          )}
                        </p>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {vacation.principalRemarks}
                      </p>
                      <p className="text-xs text-gray-600">
                        by {vacation.reviewedByPrincipal.name}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Additional Actions */}
        <div className="flex gap-4">
          <button
            onClick={() => router.push("/dashboard/vacations/my-vacations")}
            className="flex-1 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold shadow-sm"
          >
            View All My Requests
          </button>
          <button
            onClick={() => router.push("/dashboard/vacations/apply")}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
          >
            Submit New Request
          </button>
          {vacation.status === "approved" && (
            <button
              onClick={handleDownloadPDF}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Download PDF
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
