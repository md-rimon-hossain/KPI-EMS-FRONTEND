"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  useApplyVacationMutation,
  useGetVacationSummaryQuery,
  Vacation,
} from "@/store/vacationApi";
import { useAppSelector } from "@/store/hooks";
import { Permission } from "@/lib/permissions";
import {
  PermissionGuard,
  InfoTooltip,
} from "@/components/PermissionComponents";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Input from "@/components/Input";
import VacationSuccessModal from "@/components/VacationSuccessModal";
import toast from "react-hot-toast";
import {
  GiftIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

// Helper functions for date validation
const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 5 || day === 6; // Friday = 5, Saturday = 6
};

const calculateWorkingDays = (startDate: string, endDate: string): number => {
  if (!startDate || !endDate) return 0;

  const start = new Date(startDate);
  const end = new Date(endDate);
  let workingDays = 0;
  let current = new Date(start);

  while (current <= end) {
    if (!isWeekend(current)) {
      workingDays++;
    }
    current.setDate(current.getDate() + 1);
  }

  return workingDays;
};

const getMinDate = (): string => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

export default function ApplyVacationPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const [applyVacation, { isLoading }] = useApplyVacationMutation();
  const { data: summaryData } = useGetVacationSummaryQuery();
  const summary = summaryData?.data?.summary;

  const [formData, setFormData] = useState({
    vacationType: "annual",
    startDate: "",
    endDate: "",
    reason: "",
    isRewardVacation: false,
  });

  const [errors, setErrors] = useState<any>({});
  const [workingDays, setWorkingDays] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedVacation, setSubmittedVacation] = useState<Vacation | null>(
    null
  );
  const [dateRangeBreakdown, setDateRangeBreakdown] = useState<{
    totalDays: number;
    weekdays: number;
    weekends: number;
  }>({ totalDays: 0, weekdays: 0, weekends: 0 });

  // Get available balance based on vacation type
  const getAvailableBalance = () => {
    if (!summary) return 0;
    return formData.isRewardVacation
      ? summary.rewardVacationBalance || 0
      : summary.annualVacationBalance || 0;
  };

  const availableBalance = getAvailableBalance();
  const remainingBalance = availableBalance - workingDays;

  // Calculate working days and breakdown whenever dates change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      let totalDays = 0;
      let weekdays = 0;
      let weekends = 0;
      let current = new Date(start);

      while (current <= end) {
        totalDays++;
        if (isWeekend(current)) {
          weekends++;
        } else {
          weekdays++;
        }
        current.setDate(current.getDate() + 1);
      }

      setWorkingDays(weekdays);
      setDateRangeBreakdown({ totalDays, weekdays, weekends });
    } else {
      setWorkingDays(0);
      setDateRangeBreakdown({ totalDays: 0, weekdays: 0, weekends: 0 });
    }
  }, [formData.startDate, formData.endDate]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validate = () => {
    const newErrors: any = {};

    if (!formData.vacationType)
      newErrors.vacationType = t("vacation.vacationType") + " is required";
    if (!formData.startDate)
      newErrors.startDate = t("vacation.startDateRequired");
    if (!formData.endDate) newErrors.endDate = t("vacation.endDateRequired");
    if (!formData.reason.trim())
      newErrors.reason = t("vacation.reasonRequired");

    // Check if user has department
    if (!user?.department) {
      toast.error(t("vacation.departmentMissing"));
      return false;
    }

    // Date validations
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if start date is in the past
      if (start < today) {
        newErrors.startDate = t("vacation.startDateRequired");
      }

      // Check if start date is a weekend
      if (isWeekend(start)) {
        newErrors.startDate = t("vacation.calculationNote");
      }

      // Check if end date is before start date
      if (end < start) {
        newErrors.endDate = t("vacation.endDateBeforeStart");
      }

      // Check if end date is a weekend
      if (isWeekend(end)) {
        newErrors.endDate = t("vacation.calculationNote");
      }
    }

    // Balance validation
    if (workingDays > 0 && summary) {
      const balanceToCheck = formData.isRewardVacation
        ? summary.rewardVacationBalance || 0
        : summary.annualVacationBalance || 0;

      if (workingDays > balanceToCheck) {
        newErrors.endDate =
          t("vacation.insufficientBalance") +
          ` (${t("vacation.availableBalance")}: ${balanceToCheck} ${t(
            "common.days"
          )}, ${t("vacation.workingDays")}: ${workingDays} ${t(
            "common.days"
          )})`;
      }

      if (workingDays === 0) {
        newErrors.endDate = t("vacation.calculationNote");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    // Get department ID from user
    const departmentId =
      typeof user?.department === "string"
        ? user.department
        : user?.department?._id;

    if (!departmentId) {
      toast.error(t("vacation.departmentMissing"));
      return;
    }

    try {
      const response = await applyVacation({
        vacationType: formData.vacationType as any,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
        departmentId: departmentId,
        isRewardVacation: formData.isRewardVacation,
      }).unwrap();

      // Set the submitted vacation data and show success modal
      setSubmittedVacation(response.data.vacation);
      setShowSuccessModal(true);

      // Reset form
      setFormData({
        vacationType: "annual",
        startDate: "",
        endDate: "",
        reason: "",
        isRewardVacation: false,
      });
      setErrors({});
    } catch (error: any) {
      toast.error(error?.data?.message || t("vacation.applyError"));
    }
  };

  return (
    <PermissionGuard permission={Permission.APPLY_VACATION}>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-start gap-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t("vacation.apply")}
            </h1>
            <p className="text-gray-600 mt-1">{t("vacation.applySubtitle")}</p>
          </div>
          <InfoTooltip
            text={
              t("vacation.applyTooltip") ||
              "Submit a new vacation request for approval"
            }
          />
        </div>

        {/* Enhanced Balance Overview */}
        {summary && (
          <div className="mb-6">
            {/* Main Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Annual Vacation Card */}
              <Card>
                <div className="relative overflow-hidden">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 text-blue-600">
                      <CalendarDaysIcon className="w-6 h-6" />
                      <span className="text-sm font-semibold">
                        {t("vacation.annualVacation")}
                      </span>
                    </div>
                    {!formData.isRewardVacation && workingDays > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                        {t("vacation.selected")}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-gray-900">
                        {summary.annualVacationBalance}
                      </p>
                      <span className="text-sm text-gray-500">
                        / 21 {t("common.days")}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            (summary.annualVacationBalance / 21) * 100
                          }%`,
                        }}
                      ></div>
                    </div>
                    {!formData.isRewardVacation &&
                      workingDays > 0 &&
                      summary && (
                        <div className="pt-2 border-t border-blue-100">
                          <p className="text-xs text-gray-600 flex justify-between">
                            <span>{t("vacation.afterThisRequest")}</span>
                            <span
                              className={`font-bold ${
                                (summary.annualVacationBalance || 0) -
                                  workingDays >=
                                0
                                  ? "text-blue-700"
                                  : "text-red-600"
                              }`}
                            >
                              {(summary.annualVacationBalance || 0) -
                                workingDays}{" "}
                              {t("common.days")}
                            </span>
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              </Card>

              {/* Reward Days Card */}
              <Card>
                <div className="relative overflow-hidden">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 text-amber-600">
                      <GiftIcon className="w-6 h-6" />
                      <span className="text-sm font-semibold">
                        {t("vacation.rewardDays")}
                      </span>
                    </div>
                    {formData.isRewardVacation && workingDays > 0 && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                        {t("vacation.selected")}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-gray-900">
                        {summary.rewardVacationBalance}
                      </p>
                      <span className="text-sm text-gray-500">
                        {t("vacation.daysEarned")}
                      </span>
                    </div>
                    {summary.rewardVacationBalance > 0 ? (
                      <div className="flex gap-1">
                        {[
                          ...Array(Math.min(summary.rewardVacationBalance, 12)),
                        ].map((_, i) => (
                          <GiftIcon
                            key={i}
                            className="w-4 h-4 text-amber-500"
                          />
                        ))}
                        {summary.rewardVacationBalance > 12 && (
                          <span className="text-xs text-amber-600 font-medium ml-1">
                            +{summary.rewardVacationBalance - 12}
                          </span>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 italic">
                        {t("vacation.earnRewardInfo")}
                      </p>
                    )}
                    {formData.isRewardVacation &&
                      workingDays > 0 &&
                      summary && (
                        <div className="pt-2 border-t border-amber-100">
                          <p className="text-xs text-gray-600 flex justify-between">
                            <span>{t("vacation.afterThisRequest")}</span>
                            <span
                              className={`font-bold ${
                                (summary.rewardVacationBalance || 0) -
                                  workingDays >=
                                0
                                  ? "text-amber-700"
                                  : "text-red-600"
                              }`}
                            >
                              {(summary.rewardVacationBalance || 0) -
                                workingDays}{" "}
                              {t("common.days")}
                            </span>
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              </Card>

              {/* Total Available Card */}
              <Card>
                <div className="relative overflow-hidden">
                  <div className="flex items-center gap-2 text-purple-600 mb-3">
                    <CheckCircleIcon className="w-6 h-6" />
                    <span className="text-sm font-semibold">
                      {t("vacation.totalAvailable")}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-amber-600 bg-clip-text text-transparent">
                        {summary.totalAvailableBalance}
                      </p>
                      <span className="text-sm text-gray-500">
                        {t("vacation.daysTotal")}
                      </span>
                    </div>
                    <div className="text-xs space-y-1 text-gray-600">
                      <div className="flex justify-between">
                        <span>{t("vacation.annualBalance")}:</span>
                        <span className="font-medium text-blue-600">
                          {summary.annualVacationBalance}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>{t("vacation.rewardBalance")}:</span>
                        <span className="font-medium text-amber-600">
                          {summary.rewardVacationBalance}
                        </span>
                      </div>
                    </div>
                    {workingDays > 0 && summary && (
                      <div className="pt-2 border-t border-purple-100">
                        <p className="text-xs text-gray-600 flex justify-between">
                          <span>{t("vacation.afterThisRequest")}</span>
                          <span className="font-bold text-purple-700">
                            {(summary.totalAvailableBalance || 0) - workingDays}{" "}
                            {t("common.days")}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Info Banner */}
            <div className="bg-gradient-to-r from-blue-50 to-amber-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <InformationCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-700 space-y-1">
                  <p className="font-medium text-gray-900">
                    📋 How Vacation Balance Works:
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 ml-2 text-xs">
                    <li>
                      <strong className="text-blue-700">
                        Annual Vacation:
                      </strong>{" "}
                      21 days per year, resets on your anniversary
                    </li>
                    <li>
                      <strong className="text-amber-700">Reward Days:</strong>{" "}
                      Earn 1 day each month if you don't take annual vacation
                    </li>
                    <li>
                      Only working days count (Friday & Saturday excluded)
                    </li>
                    <li>
                      You cannot select more days than your available balance
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        <Card>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vacation Type Selection - Simplified */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
                Select Vacation Type
              </h3>

              <div className="space-y-4">
                {/* Annual Vacation Option */}
                <div
                  onClick={() =>
                    !formData.isRewardVacation &&
                    setFormData({
                      ...formData,
                      vacationType: "annual",
                      isRewardVacation: false,
                    })
                  }
                  className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                    !formData.isRewardVacation
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : "border-gray-200 bg-white hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          !formData.isRewardVacation
                            ? "border-blue-500"
                            : "border-gray-300"
                        }`}
                      >
                        {!formData.isRewardVacation && (
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Annual Vacation
                        </p>
                        <p className="text-sm text-gray-600">
                          Use your regular annual vacation days
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        {summary?.annualVacationBalance || 0}
                      </p>
                      <p className="text-xs text-gray-600">days available</p>
                    </div>
                  </div>
                </div>

                {/* Reward Vacation Option */}
                {summary && summary.rewardVacationBalance > 0 ? (
                  <div
                    onClick={() =>
                      setFormData({
                        ...formData,
                        vacationType: "annual",
                        isRewardVacation: true,
                      })
                    }
                    className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                      formData.isRewardVacation
                        ? "border-amber-500 bg-amber-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-amber-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            formData.isRewardVacation
                              ? "border-amber-500"
                              : "border-gray-300"
                          }`}
                        >
                          {formData.isRewardVacation && (
                            <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <GiftIcon className="w-5 h-5 text-amber-600" />
                            <p className="font-semibold text-gray-900">
                              Reward Vacation
                            </p>
                          </div>
                          <p className="text-sm text-gray-600">
                            Earned bonus vacation days
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-amber-600">
                          {summary.rewardVacationBalance}
                        </p>
                        <p className="text-xs text-gray-600">days available</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                        <div>
                          <div className="flex items-center gap-2">
                            <GiftIcon className="w-5 h-5 text-gray-400" />
                            <p className="font-semibold text-gray-500">
                              Reward Vacation
                            </p>
                          </div>
                          <p className="text-sm text-gray-500">
                            No reward days available
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-400">0</p>
                        <p className="text-xs text-gray-500">days available</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Input
              label={t("vacation.startDate")}
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              error={errors.startDate}
              required
              min={getMinDate()}
            />

            <Input
              label={t("vacation.endDate")}
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              error={errors.endDate}
              required
              min={formData.startDate || getMinDate()}
            />

            {/* Enhanced Working Days Calculation Display */}
            {formData.startDate && formData.endDate && (
              <div className="space-y-4">
                {/* Date Range Summary */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <CalendarDaysIcon className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-gray-900">
                      {t("vacation.dateRangeBreakdown")}
                    </h3>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-white rounded-lg p-3 text-center border border-gray-200">
                      <p className="text-2xl font-bold text-gray-900">
                        {dateRangeBreakdown.totalDays}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {t("vacation.totalDays")}
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
                      <p className="text-2xl font-bold text-green-700">
                        {dateRangeBreakdown.weekdays}
                      </p>
                      <p className="text-xs text-green-700 mt-1">
                        {t("vacation.workingDays")}
                      </p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3 text-center border border-red-200">
                      <p className="text-2xl font-bold text-red-700">
                        {dateRangeBreakdown.weekends}
                      </p>
                      <p className="text-xs text-red-700 mt-1">
                        {t("vacation.weekends")}
                      </p>
                    </div>
                  </div>

                  <div className="text-xs text-gray-600 bg-white rounded-lg p-3 border border-gray-200">
                    <p className="flex items-center gap-2 mb-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Working Days: Sunday, Monday, Tuesday, Wednesday, Thursday
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      Weekends (Excluded): Friday, Saturday
                    </p>
                  </div>
                </div>

                {/* Balance Impact Calculation */}
                {workingDays > 0 && (
                  <div
                    className={`rounded-xl p-5 border-2 transition-all duration-300 ${
                      formData.isRewardVacation
                        ? "bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300"
                        : "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          {formData.isRewardVacation ? (
                            <>
                              <GiftIcon className="w-5 h-5 text-amber-600" />
                              Using Reward Vacation
                            </>
                          ) : (
                            <>
                              <CalendarDaysIcon className="w-5 h-5 text-blue-600" />
                              Using Annual Vacation
                            </>
                          )}
                        </h3>
                        <p className="text-xs text-gray-600 mt-1">
                          Balance impact calculation
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-3xl font-bold ${
                            formData.isRewardVacation
                              ? "text-amber-600"
                              : "text-blue-600"
                          }`}
                        >
                          {workingDays}
                        </p>
                        <p className="text-xs text-gray-600">working days</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Current Balance */}
                      <div className="bg-white/80 rounded-lg p-3 flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">
                          Current Balance:
                        </span>
                        <span
                          className={`text-lg font-bold ${
                            formData.isRewardVacation
                              ? "text-amber-700"
                              : "text-blue-700"
                          }`}
                        >
                          {availableBalance} days
                        </span>
                      </div>

                      {/* Minus Sign */}
                      <div className="text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-gray-300 text-gray-600 font-bold">
                          −
                        </span>
                      </div>

                      {/* Requested Days */}
                      <div className="bg-white/80 rounded-lg p-3 flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">
                          Requested Days:
                        </span>
                        <span className="text-lg font-bold text-gray-900">
                          {workingDays} days
                        </span>
                      </div>

                      {/* Equals Sign */}
                      <div className="text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-gray-300 text-gray-600 font-bold">
                          =
                        </span>
                      </div>

                      {/* Remaining Balance */}
                      <div
                        className={`rounded-lg p-4 flex justify-between items-center border-2 ${
                          remainingBalance >= 0
                            ? formData.isRewardVacation
                              ? "bg-amber-100 border-amber-400"
                              : "bg-blue-100 border-blue-400"
                            : "bg-red-100 border-red-400"
                        }`}
                      >
                        <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          {remainingBalance >= 0 ? (
                            <>
                              <CheckCircleIcon className="w-5 h-5 text-green-600" />
                              Remaining Balance:
                            </>
                          ) : (
                            <>
                              <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                              Insufficient Balance:
                            </>
                          )}
                        </span>
                        <span
                          className={`text-2xl font-bold ${
                            remainingBalance >= 0
                              ? formData.isRewardVacation
                                ? "text-amber-700"
                                : "text-blue-700"
                              : "text-red-700"
                          }`}
                        >
                          {remainingBalance} days
                        </span>
                      </div>

                      {/* Status Message */}
                      {remainingBalance >= 0 ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
                          <CheckCircleIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-green-800">
                            <p className="font-semibold mb-1">
                              ✓ Balance Available
                            </p>
                            <p>
                              You have enough{" "}
                              {formData.isRewardVacation ? "reward" : "annual"}{" "}
                              vacation days for this request.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                          <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-red-800">
                            <p className="font-semibold mb-1">
                              ✗ Insufficient Balance
                            </p>
                            <p>
                              You need {workingDays} working days but only have{" "}
                              {availableBalance}{" "}
                              {formData.isRewardVacation ? "reward" : "annual"}{" "}
                              days available. Please adjust your dates.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("vacation.reason")} <span className="text-red-500">*</span>
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={t("vacation.reasonRequired")}
                required
              />
              {errors.reason && (
                <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
              )}
            </div>

            {/* Submit Section with Summary */}
            {summary &&
              formData.startDate &&
              formData.endDate &&
              formData.reason &&
              workingDays > 0 &&
              availableBalance >= workingDays && (
                <div className="bg-green-50 border-2 border-green-300 rounded-xl p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <CheckCircleIcon className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-900 mb-2">
                        Ready to Submit
                      </h3>
                      <div className="text-sm text-green-800 space-y-1">
                        <p>
                          <strong>Type:</strong>{" "}
                          {formData.isRewardVacation
                            ? "🎁 Reward"
                            : "📅 Annual"}{" "}
                          Vacation
                        </p>
                        <p>
                          <strong>Dates:</strong>{" "}
                          {new Date(formData.startDate).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            }
                          )}{" "}
                          →{" "}
                          {new Date(formData.endDate).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </p>
                        <p>
                          <strong>Working Days:</strong> {workingDays} days
                        </p>
                        <p>
                          <strong>Remaining After:</strong> {remainingBalance}{" "}
                          days
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            <div className="flex gap-3">
              <Button
                type="submit"
                variant="primary"
                loading={isLoading}
                fullWidth
                disabled={
                  isLoading ||
                  !formData.startDate ||
                  !formData.endDate ||
                  !formData.reason.trim() ||
                  workingDays === 0 ||
                  availableBalance < workingDays
                }
              >
                {isLoading
                  ? t("vacation.submitting")
                  : workingDays > 0
                  ? `${t("vacation.submitApplication")} (${workingDays} ${t(
                      "common.days"
                    )})`
                  : t("vacation.submitApplication")}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                fullWidth
              >
                {t("common.cancel")}
              </Button>
            </div>

            {/* Help Text */}
            {workingDays === 0 && formData.startDate && formData.endDate && (
              <div className="text-center">
                <p className="text-sm text-red-600 flex items-center justify-center gap-2">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  {t("vacation.calculationNote")}
                </p>
              </div>
            )}
          </form>
        </Card>

        {/* Success Modal */}
        {submittedVacation && (
          <VacationSuccessModal
            isOpen={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            vacation={submittedVacation}
          />
        )}
      </div>
    </PermissionGuard>
  );
}
