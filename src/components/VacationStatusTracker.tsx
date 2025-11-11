"use client";

import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  UserIcon,
  BuildingOfficeIcon,
  DocumentCheckIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/solid";
import { Vacation, VacationStatus } from "@/store/vacationApi";
import { format } from "date-fns";

interface VacationStatusTrackerProps {
  vacation: Vacation;
  onDownloadPDF?: () => void;
}

export default function VacationStatusTracker({
  vacation,
  onDownloadPDF,
}: VacationStatusTrackerProps) {
  const getStatusStep = () => {
    switch (vacation.status) {
      case VacationStatus.PENDING:
        return 1;
      case VacationStatus.APPROVED_BY_CHIEF:
        return 2;
      case VacationStatus.APPROVED:
        return 3;
      case VacationStatus.REJECTED:
        return 0;
      default:
        return 0;
    }
  };

  const currentStep = getStatusStep();

  const steps = [
    {
      id: 1,
      name: "Request Submitted",
      description: "Your vacation request has been submitted",
      icon: DocumentCheckIcon,
      completed: currentStep >= 1,
      current: currentStep === 1 && vacation.status !== VacationStatus.REJECTED,
      date: vacation.createdAt,
      person: vacation.employee.name,
      role: vacation.employee.role,
    },
    {
      id: 2,
      name: "Department Chief Review",
      description: vacation.reviewedByChief
        ? `Reviewed by ${vacation.reviewedByChief.name}`
        : "Waiting for department chief approval",
      icon: BuildingOfficeIcon,
      completed: currentStep >= 2,
      current: currentStep === 2 && vacation.status !== VacationStatus.REJECTED,
      date: vacation.chiefReviewDate,
      person: vacation.reviewedByChief
        ? vacation.reviewedByChief.name
        : undefined,
      role: "Department Chief",
      remarks: vacation.chiefRemarks,
    },
    {
      id: 3,
      name: "Principal Approval",
      description: vacation.reviewedByPrincipal
        ? `Approved by ${vacation.reviewedByPrincipal.name}`
        : "Waiting for principal approval",
      icon: UserIcon,
      completed: currentStep >= 3,
      current: currentStep === 3,
      date: vacation.principalReviewDate,
      person: vacation.reviewedByPrincipal
        ? vacation.reviewedByPrincipal.name
        : undefined,
      role: "Principal",
      remarks: vacation.principalRemarks,
    },
  ];

  const isRejected = vacation.status === VacationStatus.REJECTED;
  const isFullyApproved = vacation.status === VacationStatus.APPROVED;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Vacation Request Status
          </h2>
          {isFullyApproved && onDownloadPDF && (
            <button
              onClick={onDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              Download PDF
            </button>
          )}
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-3">
          {isRejected ? (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-red-100 text-red-800 border border-red-200">
              <XCircleIcon className="w-5 h-5" />
              Rejected
            </span>
          ) : isFullyApproved ? (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-200">
              <CheckCircleIcon className="w-5 h-5" />
              Fully Approved
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
              <ClockIcon className="w-5 h-5" />
              In Progress
            </span>
          )}

          <span className="text-sm text-gray-600">
            Request ID:{" "}
            <span className="font-mono font-semibold">
              {vacation._id.slice(-8)}
            </span>
          </span>
        </div>
      </div>

      {/* Vacation Details Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100">
        <div>
          <p className="text-xs text-gray-600 mb-1">Vacation Type</p>
          <p className="font-semibold text-gray-900 capitalize">
            {vacation.isRewardVacation ? "Reward" : "Annual"} Vacation
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Start Date</p>
          <p className="font-semibold text-gray-900">
            {format(new Date(vacation.startDate), "MMM dd, yyyy")}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">End Date</p>
          <p className="font-semibold text-gray-900">
            {format(new Date(vacation.endDate), "MMM dd, yyyy")}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Working Days</p>
          <p className="font-semibold text-gray-900">
            {vacation.workingDays} {vacation.workingDays === 1 ? "day" : "days"}
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const showConnector = index < steps.length - 1;

            return (
              <div key={step.id} className="relative">
                {/* Step Container */}
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="relative z-10 flex-shrink-0">
                    {step.completed ? (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg ring-4 ring-green-50">
                        <CheckCircleIcon className="w-7 h-7 text-white" />
                      </div>
                    ) : step.current ? (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg ring-4 ring-blue-50 animate-pulse">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                    ) : isRejected && index === currentStep ? (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg ring-4 ring-red-50">
                        <XCircleIcon className="w-7 h-7 text-white" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <Icon className="w-7 h-7 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-8">
                    <div
                      className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                        step.completed
                          ? "bg-green-50 border-green-200"
                          : step.current
                          ? "bg-blue-50 border-blue-300 shadow-md"
                          : isRejected && index === currentStep
                          ? "bg-red-50 border-red-200"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      {/* Step Header */}
                      <div className="flex items-center justify-between mb-2">
                        <h3
                          className={`font-semibold text-lg ${
                            step.completed
                              ? "text-green-900"
                              : step.current
                              ? "text-blue-900"
                              : isRejected && index === currentStep
                              ? "text-red-900"
                              : "text-gray-600"
                          }`}
                        >
                          {step.name}
                        </h3>
                        {step.date && (
                          <span className="text-xs text-gray-600 font-medium">
                            {format(new Date(step.date), "MMM dd, hh:mm a")}
                          </span>
                        )}
                      </div>

                      {/* Step Description */}
                      <p
                        className={`text-sm mb-2 ${
                          step.completed || step.current
                            ? "text-gray-700"
                            : "text-gray-500"
                        }`}
                      >
                        {step.description}
                      </p>

                      {/* Person Info */}
                      {step.person && (
                        <div className="flex items-center gap-2 mt-2 p-2 bg-white rounded-lg border border-gray-200">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {step.person.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {step.person}
                            </p>
                            <p className="text-xs text-gray-600">{step.role}</p>
                          </div>
                        </div>
                      )}

                      {/* Remarks */}
                      {step.remarks && (
                        <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                          <p className="text-xs font-semibold text-gray-700 mb-1">
                            Remarks:
                          </p>
                          <p className="text-sm text-gray-600 italic">
                            "{step.remarks}"
                          </p>
                        </div>
                      )}

                      {/* Waiting Indicator */}
                      {step.current && !isRejected && (
                        <div className="mt-3 flex items-center gap-2 text-blue-700">
                          <ClockIcon className="w-4 h-4 animate-spin" />
                          <span className="text-sm font-medium">
                            Awaiting action...
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rejection Notice */}
      {isRejected && (
        <div className="mt-6 p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border-2 border-red-200">
          <div className="flex items-start gap-3">
            <XCircleIcon className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-red-900 mb-2">Request Rejected</h4>
              <p className="text-sm text-red-800 mb-3">
                Your vacation request has been rejected. Please contact your
                department chief or principal for more information.
              </p>
              {(vacation.chiefRemarks || vacation.principalRemarks) && (
                <div className="bg-white p-3 rounded-lg border border-red-200">
                  <p className="text-xs font-semibold text-red-900 mb-1">
                    Reason for Rejection:
                  </p>
                  <p className="text-sm text-gray-700 italic">
                    "{vacation.principalRemarks || vacation.chiefRemarks}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Success Notice */}
      {isFullyApproved && (
        <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl border-2 border-green-200">
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h4 className="font-bold text-green-900 mb-2">
                Vacation Approved! 🎉
              </h4>
              <p className="text-sm text-green-800 mb-3">
                Your vacation request has been fully approved by both the
                department chief and principal. You can now download the
                official approval letter.
              </p>
              <div className="flex flex-wrap gap-3">
                {onDownloadPDF && (
                  <button
                    onClick={onDownloadPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    Download Approval Letter (PDF)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
