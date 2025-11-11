"use client";

import { useEffect } from "react";
import {
  CheckCircleIcon,
  XMarkIcon,
  CalendarDaysIcon,
  ClockIcon,
  InformationCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { Vacation } from "@/store/vacationApi";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

interface VacationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  vacation: Vacation;
}

export default function VacationSuccessModal({
  isOpen,
  onClose,
  vacation,
}: VacationSuccessModalProps) {
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleViewStatus = () => {
    router.push(`/dashboard/vacations/status/${vacation._id}`);
  };

  const handleViewMyVacations = () => {
    router.push("/dashboard/vacations/my-vacations");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all animate-scale-in">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>

          {/* Success Header with Animation */}
          <div className="bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 px-8 py-12 text-center relative overflow-hidden">
            {/* Animated Background Circles */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-white opacity-10 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full animate-pulse delay-75"></div>
            </div>

            <div className="relative z-10">
              {/* Success Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-white rounded-full shadow-lg animate-bounce">
                <CheckCircleIcon className="w-12 h-12 text-green-600" />
              </div>

              <h3 className="text-3xl font-bold text-white mb-2">
                Request Submitted Successfully! 🎉
              </h3>
              <p className="text-green-50 text-lg">
                Your vacation request is now in the approval queue
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-6">
            {/* Request Details */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
                Vacation Details
              </h4>
              <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Type</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {vacation.isRewardVacation ? "Reward" : "Annual"} Vacation
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Duration</p>
                  <p className="font-semibold text-gray-900">
                    {vacation.workingDays}{" "}
                    {vacation.workingDays === 1 ? "day" : "days"}
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
              </div>
            </div>

            {/* Request ID */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-600 mb-1">Request ID</p>
              <p className="font-mono font-bold text-lg text-gray-900">
                {vacation._id.slice(-12).toUpperCase()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Use this ID to track your request
              </p>
            </div>

            {/* Approval Process Info */}
            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-start gap-3">
                <InformationCircleIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-blue-900 mb-2">
                    What happens next?
                  </h5>
                  <ol className="space-y-2 text-sm text-blue-800">
                    <li className="flex items-start gap-2">
                      <span className="font-bold min-w-[20px]">1.</span>
                      <span>
                        Your <strong>Department Chief</strong> will review and
                        approve your request
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold min-w-[20px]">2.</span>
                      <span>
                        Once approved by the chief, it will be sent to the{" "}
                        <strong>Principal</strong> for final approval
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold min-w-[20px]">3.</span>
                      <span>
                        After final approval, you can{" "}
                        <strong>download the PDF</strong> approval letter
                      </span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Estimated Time */}
            <div className="mb-6 flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <ClockIcon className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">Estimated approval time:</span>{" "}
                24-48 hours for each stage
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleViewStatus}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
              >
                Track Status
                <ArrowRightIcon className="w-5 h-5" />
              </button>
              <button
                onClick={handleViewMyVacations}
                className="flex-1 px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold"
              >
                View All Requests
              </button>
            </div>

            {/* Notification Note */}
            <p className="text-xs text-gray-500 text-center mt-4">
              You'll receive email notifications at each approval stage
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
