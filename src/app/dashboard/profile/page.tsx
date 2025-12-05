"use client";

import { useAppSelector } from "@/store/hooks";
import { redirect } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Permission } from "@/lib/permissions";
import {
  PermissionGuard,
  InfoTooltip,
} from "@/components/PermissionComponents";
import Card from "@/components/Card";
import Input from "@/components/Input";
import Badge from "@/components/Badge";
import Loading from "@/components/Loading";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  MapPinIcon,
  IdentificationIcon,
  HeartIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    redirect("/login");
  }

  if (!user) {
    return <Loading fullScreen text={t("common.loading")} />;
  }

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const InfoRow = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: any;
    label: string;
    value: string | number | undefined | null;
  }) => (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
      <Icon className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-gray-900 mt-0.5 break-words">
          {value || "N/A"}
        </p>
      </div>
    </div>
  );

  return (
    <PermissionGuard permission={Permission.VIEW_OWN_PROFILE}>
      <div className="max-w-7xl mx-auto px-2 sm:px-0">
        <div className="mb-3 sm:mb-4 flex items-start gap-1.5 sm:gap-2">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
              {t("profile.title")}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
              {t("profile.subtitle")}
            </p>
          </div>
          <InfoTooltip
            text={
              t("profile.viewTooltip") ||
              "View and manage your personal profile information"
            }
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Profile Image and Summary */}
          <div className="lg:col-span-1 space-y-3 sm:space-y-4">
            <Card padding="sm">
              <div className="flex flex-col items-center text-center">
                {/* Profile Image */}
                <div className="relative mb-3">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-blue-100 shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-blue-100 shadow-lg">
                      <span className="text-3xl sm:text-4xl font-bold text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* User Name and Role */}
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                  {user.name}
                </h2>
                <Badge variant="info" size="md" className="mb-2">
                  {t(`roles.${user.role}`)}
                </Badge>

                {/* Quick Stats */}
                <div className="w-full mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm text-gray-600">
                    <EnvelopeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                    <span className="break-all">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm text-gray-600 mt-1.5">
                      <PhoneIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user.department && (
                    <div className="flex items-center justify-center gap-1.5 text-xs sm:text-sm text-gray-600 mt-1.5">
                      <BuildingOfficeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span>{user.department.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Vacation Balance - Mobile First */}
            <Card
              padding="sm"
              className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"
            >
              <div className="text-center">
                <CalendarDaysIcon className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 mx-auto mb-2" />
                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1">
                  {t("profile.vacationBalance")}
                </h3>
                <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-1">
                  {user.vacationBalance}
                </div>
                <p className="text-xs sm:text-sm text-gray-600">
                  {t("vacation.workingDays")}
                </p>
              </div>

              {/* Reward Vacation - Always Show */}
              <div className="mt-3 pt-3 border-t border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm font-medium text-gray-700">
                    {t("profile.rewardVacation")}
                  </span>
                  <span
                    className={`text-base sm:text-lg font-bold ${
                      user.rewardVacationBalance &&
                      user.rewardVacationBalance > 0
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    {user.rewardVacationBalance || 0}
                  </span>
                </div>
              </div>
            </Card>

            {/* Account Status */}
            <Card padding="sm">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3">
                {t("profile.accountStatus")}
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">
                    {t("profile.emailVerified")}
                  </span>
                  {user.isEmailVerified ? (
                    <Badge variant="success" size="sm">
                      <CheckCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                      {t("profile.verified")}
                    </Badge>
                  ) : (
                    <Badge variant="warning" size="sm">
                      <XCircleIcon className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                      {t("profile.notVerified")}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-gray-600">
                    {t("profile.accountActive")}
                  </span>
                  <Badge
                    variant={user.isActive ? "success" : "danger"}
                    size="sm"
                  >
                    {user.isActive ? t("common.active") : t("common.inactive")}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Account Stats */}
            <Card padding="sm">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-3">
                {t("profile.accountStats")}
              </h3>
              <div className="space-y-2">
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">
                    {t("profile.accountCreated")}
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-gray-900 mt-0.5">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">
                    {t("profile.lastUpdated")}
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-gray-900 mt-0.5">
                    {formatDate(user.updatedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide">
                    {t("profile.lastVacationReset")}
                  </p>
                  <p className="text-xs sm:text-sm font-medium text-gray-900 mt-0.5">
                    {formatDate(user.lastAnnualVacationReset)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Help Card */}
            <Card padding="sm" className="bg-blue-50 border-blue-200">
              <h3 className="text-sm sm:text-base font-bold text-blue-900 mb-1">
                {t("profile.needHelp")}
              </h3>
              <p className="text-xs sm:text-sm text-blue-700">
                {t("profile.contactAdmin")}
              </p>
            </Card>
          </div>

          {/* Main Profile Column */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {/* Basic Information */}
            <Card padding="sm">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  {t("profile.basicInfo")}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <InfoRow
                  icon={UserIcon}
                  label={t("profile.fullName")}
                  value={user.name}
                />
                <InfoRow
                  icon={EnvelopeIcon}
                  label={t("profile.emailAddress")}
                  value={user.email}
                />
                <InfoRow
                  icon={PhoneIcon}
                  label={t("profile.phoneNumber")}
                  value={user.phone}
                />
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <BriefcaseIcon className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      {t("user.role")}
                    </p>
                    <Badge variant="info" size="md" className="mt-1">
                      {t(`roles.${user.role}`)}
                    </Badge>
                  </div>
                </div>
                <InfoRow
                  icon={BuildingOfficeIcon}
                  label={t("user.department")}
                  value={user.department?.name || t("common.notAssigned")}
                />
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <CheckCircleIcon className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      {t("profile.accountStatus")}
                    </p>
                    <Badge
                      variant={user.isActive ? "success" : "danger"}
                      size="md"
                      className="mt-1"
                    >
                      {user.isActive
                        ? t("common.active")
                        : t("common.inactive")}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>

            {/* Employment Details */}
            <Card padding="sm">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                <BriefcaseIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  {t("profile.employmentDetails")}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <InfoRow
                  icon={BriefcaseIcon}
                  label={t("user.jobTitle")}
                  value={user.jobTitle}
                />
                <InfoRow
                  icon={IdentificationIcon}
                  label={t("user.position")}
                  value={user.position}
                />
                <InfoRow
                  icon={BuildingOfficeIcon}
                  label={t("profile.workArea")}
                  value={user.departmentWorkArea}
                />
                <InfoRow
                  icon={ClockIcon}
                  label={t("user.employmentStatus")}
                  value={
                    user.employmentStatus
                      ? t(`employmentStatus.${user.employmentStatus}`)
                      : undefined
                  }
                />
                <InfoRow
                  icon={CalendarDaysIcon}
                  label={t("user.startDate")}
                  value={formatDate(user.startDate)}
                />
                <InfoRow
                  icon={CalendarDaysIcon}
                  label={t("user.joiningDate")}
                  value={formatDate(user.joiningDate)}
                />
              </div>

              {user.jobDescription && (
                <div className="mt-2 sm:mt-3 p-2.5 sm:p-3 bg-gray-50 rounded-lg">
                  <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide mb-1">
                    {t("user.jobDescription")}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-wrap">
                    {user.jobDescription}
                  </p>
                </div>
              )}
            </Card>

            {/* Personal Information */}
            <Card padding="sm">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                <IdentificationIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  {t("profile.personalInfo")}
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                <InfoRow
                  icon={CalendarDaysIcon}
                  label={t("user.dateOfBirth")}
                  value={formatDate(user.dateOfBirth)}
                />
                <InfoRow
                  icon={IdentificationIcon}
                  label={t("user.nidNumber")}
                  value={user.nidNumber}
                />
                <InfoRow
                  icon={HeartIcon}
                  label={t("user.bloodGroup")}
                  value={user.bloodGroup}
                />
                <div className="sm:col-span-2">
                  <InfoRow
                    icon={MapPinIcon}
                    label={t("user.presentAddress")}
                    value={user.presentAddress}
                  />
                </div>
                <div className="sm:col-span-2">
                  <InfoRow
                    icon={MapPinIcon}
                    label={t("user.permanentAddress")}
                    value={user.permanentAddress}
                  />
                </div>
              </div>
            </Card>

            {/* Emergency Contact */}
            {user.emergencyContact &&
              (user.emergencyContact.name || user.emergencyContact.phone) && (
                <Card padding="sm">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                    <UserGroupIcon className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                    <h2 className="text-base sm:text-lg font-bold text-gray-900">
                      Emergency Contact
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
                    <InfoRow
                      icon={UserIcon}
                      label="Contact Name"
                      value={user.emergencyContact.name}
                    />
                    <InfoRow
                      icon={UserGroupIcon}
                      label="Relationship"
                      value={user.emergencyContact.relationship}
                    />
                    <InfoRow
                      icon={PhoneIcon}
                      label="Contact Phone"
                      value={user.emergencyContact.phone}
                    />
                  </div>
                </Card>
              )}
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
