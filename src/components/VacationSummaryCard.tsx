"use client";

import { useGetVacationSummaryQuery } from "@/store/vacationApi";
import {
  CalendarDaysIcon,
  GiftIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

interface VacationSummaryCardProps {
  userId?: string;
}

export default function VacationSummaryCard({
  userId,
}: VacationSummaryCardProps) {
  const { data, isLoading, error } = useGetVacationSummaryQuery(userId);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-200 rounded w-40"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-24 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="h-20 bg-gray-200 rounded-lg"></div>
          <div className="h-20 bg-gray-200 rounded-lg"></div>
          <div className="h-20 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <XCircleIcon className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-600 font-medium">
            Unable to load vacation data
          </p>
        </div>
      </div>
    );
  }

  const summary = data.data.summary;
  const annualPercentage = (summary.annualVacationBalance / 21) * 100;
  const isLowBalance = summary.annualVacationBalance < 5;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">
            My Vacation Balance
          </h2>
        </div>
        <Link
          href="/dashboard/vacations/apply"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5"
        >
          <CalendarDaysIcon className="w-4 h-4" />
          Request Time Off
        </Link>
      </div>

      {/* Compact Balance Display */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        {/* Annual Balance */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <CalendarDaysIcon className="w-4 h-4 text-blue-600" />
            <p className="text-xs font-medium text-blue-900">Annual Days</p>
          </div>
          <p className="text-2xl font-bold text-blue-600 mb-1">
            {summary.annualVacationBalance}
          </p>
          <div className="w-full bg-blue-200 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${annualPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {21 - summary.annualVacationBalance} used of 21
          </p>
          {isLowBalance && (
            <div className="flex items-center gap-1 mt-2 text-xs text-orange-700 bg-orange-50 px-2 py-1 rounded">
              <ExclamationTriangleIcon className="w-3 h-3" />
              <span>Running low</span>
            </div>
          )}
        </div>

        {/* Reward Balance */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
          <div className="flex items-center gap-2 mb-1">
            <GiftIcon className="w-4 h-4 text-amber-600" />
            <p className="text-xs font-medium text-amber-900">Reward Days</p>
          </div>
          <p className="text-2xl font-bold text-amber-600 mb-1">
            {summary.rewardVacationBalance}
          </p>
          <p className="text-xs text-gray-600 mt-3">
            {summary.rewardVacationBalance > 0
              ? "Bonus days earned"
              : "No bonus yet"}
          </p>
          {summary.rewardVacationBalance === 0 && (
            <p className="text-xs text-amber-700 mt-1">
              Earn by perfect attendance
            </p>
          )}
        </div>

        {/* Total Available */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <ChartBarIcon className="w-4 h-4 text-green-600" />
            <p className="text-xs font-medium text-green-900">Total Days</p>
          </div>
          <p className="text-2xl font-bold text-green-600 mb-1">
            {summary.totalAvailableBalance}
          </p>
          <p className="text-xs text-gray-600 mt-3">Available to request</p>
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center gap-2 mb-1">
            <ClockIcon className="w-4 h-4 text-purple-600" />
            <p className="text-xs font-medium text-purple-900">This Year</p>
          </div>
          <p className="text-2xl font-bold text-purple-600 mb-1">
            {summary.thisYearUsage.total}
          </p>
          <p className="text-xs text-gray-600 mt-3">Days used so far</p>
        </div>
      </div>

      {/* Request Status - Compact Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 rounded-lg p-3 border border-green-200 text-center">
          <CheckCircleIcon className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <div className="text-xl font-bold text-green-600">
            {summary.totalApproved}
          </div>
          <div className="text-xs text-gray-600 font-medium">Approved</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200 text-center">
          <ClockIcon className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
          <div className="text-xl font-bold text-yellow-600">
            {summary.totalPending}
          </div>
          <div className="text-xs text-gray-600 font-medium">
            Pending Review
          </div>
        </div>
        <div className="bg-red-50 rounded-lg p-3 border border-red-200 text-center">
          <XCircleIcon className="w-5 h-5 text-red-600 mx-auto mb-1" />
          <div className="text-xl font-bold text-red-600">
            {summary.totalRejected}
          </div>
          <div className="text-xs text-gray-600 font-medium">Not Approved</div>
        </div>
      </div>

      {/* Important Information Bar */}
      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
        <div className="flex items-start gap-2 text-xs text-gray-700">
          <ClockIcon className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p>
              <span className="font-semibold text-gray-900">
                Balance resets:
              </span>{" "}
              {new Date(summary.nextAnnualVacationReset).toLocaleDateString(
                "en-US",
                {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }
              )}
            </p>
            <p>
              <span className="font-semibold text-gray-900">Reward bonus:</span>{" "}
              Earn 1 day per month with perfect attendance
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
