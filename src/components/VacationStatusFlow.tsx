"use client";

import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";

interface VacationStatusFlowProps {
  status: string;
  reviewedByChief?: { name: string; reviewedAt: string } | null;
  reviewedByPrincipal?: { name: string; reviewedAt: string } | null;
  chiefReviewComment?: string;
  principalReviewComment?: string;
  isChiefRequired?: boolean; // If false, skip chief step
}

export default function VacationStatusFlow({
  status,
  reviewedByChief,
  reviewedByPrincipal,
  chiefReviewComment,
  principalReviewComment,
  isChiefRequired = true,
}: VacationStatusFlowProps) {
  const steps = [];

  // Step 1: Submitted
  steps.push({
    label: "Submitted",
    completed: true,
    active: status === "pending" && !reviewedByChief,
    icon: CheckCircleIcon,
    color: "text-green-500",
  });

  // Step 2: Chief Review (if required)
  if (isChiefRequired) {
    steps.push({
      label: "Chief Instructor Review",
      completed:
        !!reviewedByChief ||
        status === "approved_by_chief" ||
        status === "approved",
      active: status === "pending" && !reviewedByChief,
      rejected:
        status === "rejected" && reviewedByChief && !reviewedByPrincipal,
      icon: reviewedByChief ? CheckCircleIcon : ClockIcon,
      color: reviewedByChief ? "text-blue-500" : "text-yellow-500",
      reviewer: reviewedByChief?.name,
      reviewedAt: reviewedByChief?.reviewedAt,
      comment: chiefReviewComment,
    });
  }

  // Step 3: Principal Review
  steps.push({
    label: "Principal Approval",
    completed: status === "approved",
    active:
      status === "approved_by_chief" ||
      (status === "pending" && !isChiefRequired),
    rejected: status === "rejected" && reviewedByPrincipal,
    icon: reviewedByPrincipal ? CheckCircleIcon : ClockIcon,
    color: reviewedByPrincipal ? "text-green-500" : "text-yellow-500",
    reviewer: reviewedByPrincipal?.name,
    reviewedAt: reviewedByPrincipal?.reviewedAt,
    comment: principalReviewComment,
  });

  return (
    <div className="w-full py-4">
      <div className="relative">
        {/* Progress line */}
        <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200" />
        <div
          className="absolute top-5 left-0 h-0.5 bg-blue-500 transition-all duration-300"
          style={{
            width: `${
              (steps.filter((s) => s.completed).length / steps.length) * 100
            }%`,
          }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const Icon = step.rejected ? XCircleIcon : step.icon;
            const iconColor = step.rejected
              ? "text-red-500"
              : step.completed
              ? "text-green-500"
              : step.active
              ? "text-yellow-500"
              : "text-gray-300";

            return (
              <div key={index} className="flex flex-col items-center flex-1">
                {/* Icon */}
                <div
                  className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${
                    step.completed || step.active ? "bg-white" : "bg-gray-100"
                  } border-2 ${
                    step.rejected
                      ? "border-red-500"
                      : step.completed
                      ? "border-green-500"
                      : step.active
                      ? "border-yellow-500"
                      : "border-gray-300"
                  }`}
                >
                  <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>

                {/* Label */}
                <div className="mt-2 text-center">
                  <p
                    className={`text-sm font-medium ${
                      step.completed || step.active
                        ? "text-gray-900"
                        : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </p>
                  {step.reviewer && (
                    <p className="text-xs text-gray-600 mt-1">
                      by {step.reviewer}
                    </p>
                  )}
                  {step.reviewedAt && (
                    <p className="text-xs text-gray-500">
                      {new Date(step.reviewedAt).toLocaleDateString()}
                    </p>
                  )}
                  {step.comment && (
                    <p className="text-xs text-gray-600 mt-1 italic max-w-[150px]">
                      "{step.comment}"
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Status Message */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm font-medium text-gray-700">Current Status:</p>
        <p className="text-sm text-gray-600 mt-1">
          {status === "pending" &&
            !reviewedByChief &&
            isChiefRequired &&
            "Your vacation request is waiting for Chief Instructor review."}
          {status === "pending" &&
            !reviewedByChief &&
            !isChiefRequired &&
            "Your vacation request is waiting for Principal approval."}
          {status === "approved_by_chief" &&
            "Your vacation request has been approved by Chief Instructor and is now waiting for Principal approval."}
          {status === "approved" &&
            "✅ Your vacation request has been fully approved!"}
          {status === "rejected" &&
            "❌ Your vacation request has been rejected."}
        </p>
      </div>
    </div>
  );
}
