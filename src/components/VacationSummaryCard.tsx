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
import { useTranslation } from "react-i18next";

interface VacationSummaryCardProps {
  userId?: string;
}

export default function VacationSummaryCard({
  userId,
}: VacationSummaryCardProps) {
  const { t } = useTranslation();
  const { data, isLoading, error } = useGetVacationSummaryQuery(userId);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 sm:p-3 lg:p-4 animate-pulse">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="h-5 sm:h-6 bg-gray-200 rounded w-32 sm:w-40"></div>
          <div className="h-8 sm:h-10 bg-gray-200 rounded w-24 sm:w-32"></div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="h-20 sm:h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-20 sm:h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-20 sm:h-24 bg-gray-200 rounded-lg"></div>
          <div className="h-20 sm:h-24 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="h-16 sm:h-20 bg-gray-200 rounded-lg"></div>
          <div className="h-16 sm:h-20 bg-gray-200 rounded-lg"></div>
          <div className="h-16 sm:h-20 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-2 sm:p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <XCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
          <p className="text-xs sm:text-sm text-red-600 font-semibold">
            {t("vacationSummary.unableToLoad")}
          </p>
        </div>
      </div>
    );
  }

  const summary = data.data.summary;
  const annualPercentage = (summary.annualVacationBalance / 21) * 100;
  const isLowBalance = summary.annualVacationBalance < 5;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 p-2 sm:p-3 lg:p-4">
      {/* Ultra-Compact Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
            <CalendarDaysIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <h2 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900">
            {t("vacationSummary.myBalance")}
          </h2>
        </div>
        <Link
          href="/dashboard/vacations/apply"
          className="tap-target px-2 py-1.5 sm:px-3 sm:py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-[10px] sm:text-xs font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 active:scale-95 transition-all duration-200 flex items-center gap-1 shadow-sm whitespace-nowrap"
        >
          <CalendarDaysIcon className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">
            {t("vacationSummary.requestTimeOff")}
          </span>
          <span className="sm:hidden">{t("vacationSummary.request")}</span>
        </Link>
      </div>

      {/* Ultra-Compact Balance Display */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4">
        {/* Annual Balance */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-2 sm:p-3 border border-blue-200 hover:border-blue-300 transition-colors">
          <div className="flex items-center gap-1 sm:gap-1.5 mb-1">
            <CalendarDaysIcon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
            <p className="text-[10px] sm:text-xs font-semibold text-blue-900 truncate">
              {t("vacationSummary.annualDays")}
            </p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">
            {summary.annualVacationBalance}
          </p>
          <div className="w-full bg-blue-200 rounded-full h-1">
            <div
              className="bg-blue-600 h-1 rounded-full transition-all duration-500"
              style={{ width: `${annualPercentage}%` }}
            ></div>
          </div>
          <p className="text-[10px] sm:text-xs text-gray-600 mt-1">
            {21 - summary.annualVacationBalance} {t("vacationSummary.usedOf")}{" "}
            21
          </p>
          {isLowBalance && (
            <div className="flex items-center gap-1 mt-1.5 text-[10px] sm:text-xs text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded">
              <ExclamationTriangleIcon className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">
                {t("vacationSummary.runningLow")}
              </span>
            </div>
          )}
        </div>

        {/* Reward Balance */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-2 sm:p-3 border border-amber-200 hover:border-amber-300 transition-colors">
          <div className="flex items-center gap-1 sm:gap-1.5 mb-1">
            <GiftIcon className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600 flex-shrink-0" />
            <p className="text-[10px] sm:text-xs font-semibold text-amber-900 truncate">
              {t("vacationSummary.rewardDays")}
            </p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-amber-600 mb-1">
            {summary.rewardVacationBalance}
          </p>
          <p className="text-[10px] sm:text-xs text-gray-600 mt-2 line-clamp-2">
            {summary.rewardVacationBalance > 0
              ? t("vacationSummary.bonusDaysEarned")
              : t("vacationSummary.noBonus")}
          </p>
        </div>

        {/* Total Available */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-2 sm:p-3 border border-green-200 hover:border-green-300 transition-colors">
          <div className="flex items-center gap-1 sm:gap-1.5 mb-1">
            <ChartBarIcon className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
            <p className="text-[10px] sm:text-xs font-semibold text-green-900 truncate">
              {t("vacationSummary.totalDays")}
            </p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-green-600 mb-1">
            {summary.totalAvailableBalance}
          </p>
          <p className="text-[10px] sm:text-xs text-gray-600 mt-2 line-clamp-2">
            {t("vacationSummary.availableToRequest")}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-2 sm:p-3 border border-purple-200 hover:border-purple-300 transition-colors">
          <div className="flex items-center gap-1 sm:gap-1.5 mb-1">
            <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 flex-shrink-0" />
            <p className="text-[10px] sm:text-xs font-semibold text-purple-900 truncate">
              {t("vacationSummary.thisYear")}
            </p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-purple-600 mb-1">
            {summary.thisYearUsage.total}
          </p>
          <p className="text-[10px] sm:text-xs text-gray-600 mt-2 line-clamp-2">
            {t("vacationSummary.daysUsedSoFar")}
          </p>
        </div>
      </div>

      {/* Request Status - Ultra-Compact Grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-2 sm:p-2.5 border border-green-200 text-center hover:border-green-300 transition-colors">
          <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mx-auto mb-0.5 sm:mb-1" />
          <div className="text-lg sm:text-xl font-bold text-green-600">
            {summary.totalApproved}
          </div>
          <div className="text-[10px] sm:text-xs text-gray-600 font-semibold truncate">
            {t("vacationSummary.approved")}
          </div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-2 sm:p-2.5 border border-yellow-200 text-center hover:border-yellow-300 transition-colors">
          <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 mx-auto mb-0.5 sm:mb-1" />
          <div className="text-lg sm:text-xl font-bold text-yellow-600">
            {summary.totalPending}
          </div>
          <div className="text-[10px] sm:text-xs text-gray-600 font-semibold truncate">
            {t("vacationSummary.pendingReview")}
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-2 sm:p-2.5 border border-red-200 text-center hover:border-red-300 transition-colors">
          <XCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mx-auto mb-0.5 sm:mb-1" />
          <div className="text-lg sm:text-xl font-bold text-red-600">
            {summary.totalRejected}
          </div>
          <div className="text-[10px] sm:text-xs text-gray-600 font-semibold truncate">
            {t("vacationSummary.notApproved")}
          </div>
        </div>
      </div>

      {/* Important Information Bar - Ultra-Compact */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-2 sm:p-2.5 border border-blue-200">
        <div className="flex items-start gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-700">
          <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5 sm:space-y-1 flex-1 min-w-0">
            <p className="truncate sm:whitespace-normal">
              <span className="font-semibold text-gray-900">
                {t("vacationSummary.balanceResets")}:
              </span>{" "}
              <span className="text-gray-700">
                {new Date(summary.nextAnnualVacationReset).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }
                )}
              </span>
            </p>
            <p className="truncate sm:whitespace-normal">
              <span className="font-semibold text-gray-900">
                {t("vacationSummary.rewardBonus")}:
              </span>{" "}
              <span className="text-gray-700">
                {t("vacationSummary.earnPerMonth")}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
