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
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-start gap-2">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {t("profile.title")}
            </h1>
            <p className="text-gray-600 mt-1">{t("profile.subtitle")}</p>
          </div>
          <InfoTooltip
            text={
              t("profile.viewTooltip") ||
              "View and manage your personal profile information"
            }
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <div className="flex items-center gap-2 mb-6">
                <UserIcon className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  {t("profile.basicInfo")}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Card>
              <div className="flex items-center gap-2 mb-6">
                <BriefcaseIcon className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  {t("profile.employmentDetails")}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                    {t("user.jobDescription")}
                  </p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {user.jobDescription}
                  </p>
                </div>
              )}
            </Card>

            {/* Personal Information */}
            <Card>
              <div className="flex items-center gap-2 mb-6">
                <IdentificationIcon className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  {t("profile.personalInfo")}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="md:col-span-2">
                  <InfoRow
                    icon={MapPinIcon}
                    label={t("user.presentAddress")}
                    value={user.presentAddress}
                  />
                </div>
                <div className="md:col-span-2">
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
                <Card>
                  <div className="flex items-center gap-2 mb-6">
                    <UserGroupIcon className="w-6 h-6 text-red-600" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      Emergency Contact
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Vacation Balance */}
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <div className="text-center">
                <CalendarDaysIcon className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {t("profile.vacationBalance")}
                </h3>
                <div className="text-4xl font-bold text-blue-600 mb-1">
                  {user.vacationBalance}
                </div>
                <p className="text-sm text-gray-600">
                  {t("vacation.workingDays")}
                </p>
              </div>

              {user.rewardVacationBalance && user.rewardVacationBalance > 0 && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">
                      {t("profile.rewardVacation")}
                    </span>
                    <span className="text-lg font-semibold text-green-600">
                      {user.rewardVacationBalance}
                    </span>
                  </div>
                </div>
              )}
            </Card>

            {/* Account Status */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t("profile.accountStatus")}
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {t("profile.emailVerified")}
                  </span>
                  {user.isEmailVerified ? (
                    <Badge variant="success" size="sm">
                      <CheckCircleIcon className="w-4 h-4 inline mr-1" />
                      {t("profile.verified")}
                    </Badge>
                  ) : (
                    <Badge variant="warning" size="sm">
                      <XCircleIcon className="w-4 h-4 inline mr-1" />
                      {t("profile.notVerified")}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
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
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t("profile.accountStats")}
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {t("profile.accountCreated")}
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {t("profile.lastUpdated")}
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {formatDate(user.updatedAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    {t("profile.lastVacationReset")}
                  </p>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {formatDate(user.lastAnnualVacationReset)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Help Card */}
            <Card className="bg-blue-50 border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                {t("profile.needHelp")}
              </h3>
              <p className="text-sm text-blue-700">
                {t("profile.contactAdmin")}
              </p>
            </Card>
          </div>
        </div>
      </div>
    </PermissionGuard>
  );
}
