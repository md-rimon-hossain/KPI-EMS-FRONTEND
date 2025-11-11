"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGetMyVacationsQuery, VacationStatus } from "@/store/vacationApi";
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  CalendarDaysIcon,
  EyeIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";

export default function MyVacationsPage() {
  const router = useRouter();
  const { data, isLoading, error } = useGetMyVacationsQuery();
  const [filter, setFilter] = useState<VacationStatus | "all">("all");

  const vacations = data?.data?.vacations || [];

  const filteredVacations =
    filter === "all" ? vacations : vacations.filter((v) => v.status === filter);

  const getStatusBadge = (status: VacationStatus) => {
    switch (status) {
      case VacationStatus.PENDING:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200">
            <ClockIcon className="w-4 h-4" />
            Pending
          </span>
        );
      case VacationStatus.APPROVED_BY_CHIEF:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <CheckCircleIcon className="w-4 h-4" />
            Chief Approved
          </span>
        );
      case VacationStatus.APPROVED:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
            <CheckCircleIcon className="w-4 h-4" />
            Fully Approved
          </span>
        );
      case VacationStatus.REJECTED:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
            <XCircleIcon className="w-4 h-4" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const getStatusCount = (status: VacationStatus | "all") => {
    if (status === "all") return vacations.length;
    return vacations.filter((v) => v.status === status).length;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Failed to Load Vacations
            </h2>
            <p className="text-gray-600 mb-6">
              There was an error loading your vacation requests.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              My Vacation Requests
            </h1>
            <p className="text-gray-600 mt-1">
              Track and manage your vacation applications
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard/vacations/apply")}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg font-semibold"
          >
            <PlusIcon className="w-5 h-5" />
            New Request
          </button>
        </div>

        {/* Status Filter Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              filter === "all"
                ? "bg-gradient-to-br from-blue-50 to-purple-50 border-blue-300 shadow-md"
                : "bg-white border-gray-200 hover:border-gray-300"
            }`}
          >
            <p className="text-2xl font-bold text-gray-900">
              {getStatusCount("all")}
            </p>
            <p className="text-sm text-gray-600 mt-1">All Requests</p>
          </button>

          <button
            onClick={() => setFilter(VacationStatus.PENDING)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              filter === VacationStatus.PENDING
                ? "bg-yellow-50 border-yellow-300 shadow-md"
                : "bg-white border-gray-200 hover:border-gray-300"
            }`}
          >
            <p className="text-2xl font-bold text-yellow-800">
              {getStatusCount(VacationStatus.PENDING)}
            </p>
            <p className="text-sm text-gray-600 mt-1">Pending</p>
          </button>

          <button
            onClick={() => setFilter(VacationStatus.APPROVED_BY_CHIEF)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              filter === VacationStatus.APPROVED_BY_CHIEF
                ? "bg-blue-50 border-blue-300 shadow-md"
                : "bg-white border-gray-200 hover:border-gray-300"
            }`}
          >
            <p className="text-2xl font-bold text-blue-800">
              {getStatusCount(VacationStatus.APPROVED_BY_CHIEF)}
            </p>
            <p className="text-sm text-gray-600 mt-1">Chief Approved</p>
          </button>

          <button
            onClick={() => setFilter(VacationStatus.APPROVED)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              filter === VacationStatus.APPROVED
                ? "bg-green-50 border-green-300 shadow-md"
                : "bg-white border-gray-200 hover:border-gray-300"
            }`}
          >
            <p className="text-2xl font-bold text-green-800">
              {getStatusCount(VacationStatus.APPROVED)}
            </p>
            <p className="text-sm text-gray-600 mt-1">Fully Approved</p>
          </button>

          <button
            onClick={() => setFilter(VacationStatus.REJECTED)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 ${
              filter === VacationStatus.REJECTED
                ? "bg-red-50 border-red-300 shadow-md"
                : "bg-white border-gray-200 hover:border-gray-300"
            }`}
          >
            <p className="text-2xl font-bold text-red-800">
              {getStatusCount(VacationStatus.REJECTED)}
            </p>
            <p className="text-sm text-gray-600 mt-1">Rejected</p>
          </button>
        </div>

        {/* Vacation List */}
        {filteredVacations.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <CalendarDaysIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No vacation requests found
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === "all"
                ? "You haven't submitted any vacation requests yet."
                : `No ${filter.replace(/_/g, " ")} requests found.`}
            </p>
            <button
              onClick={() => router.push("/dashboard/vacations/apply")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Submit Your First Request
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVacations.map((vacation) => (
              <div
                key={vacation._id}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-6 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">
                        {vacation.isRewardVacation ? "Reward" : "Annual"}{" "}
                        Vacation
                      </h3>
                      {getStatusBadge(vacation.status)}
                    </div>
                    <p className="text-sm text-gray-600">
                      Request ID:{" "}
                      <span className="font-mono font-semibold">
                        {vacation._id.slice(-8).toUpperCase()}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      router.push(`/dashboard/vacations/status/${vacation._id}`)
                    }
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-semibold"
                  >
                    <EyeIcon className="w-4 h-4" />
                    View Details
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg">
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
                      {vacation.workingDays}{" "}
                      {vacation.workingDays === 1 ? "day" : "days"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Submitted</p>
                    <p className="font-semibold text-gray-900">
                      {format(new Date(vacation.createdAt), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>

                {vacation.reason && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-xs font-semibold text-blue-900 mb-1">
                      Reason:
                    </p>
                    <p className="text-sm text-gray-700">{vacation.reason}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
