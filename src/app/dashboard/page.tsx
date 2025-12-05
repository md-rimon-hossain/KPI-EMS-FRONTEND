"use client";

import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store/hooks";
import { usePermission } from "@/hooks/usePermission";
import { Permission } from "@/lib/permissions";
import { useGetAllUsersQuery } from "@/store/userApi";
import { useGetAllDepartmentsQuery } from "@/store/departmentApi";
import { useGetMyVacationsQuery } from "@/store/vacationApi";
import Card from "@/components/Card";
import Badge from "@/components/Badge";
import Loading from "@/components/Loading";
import VacationSummaryCard from "@/components/VacationSummaryCard";
import {
  UsersIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

export default function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAppSelector((state) => state.auth);
  const { can, role } = usePermission();

  // Conditionally fetch data based on permissions
  const { data: usersData, isLoading: usersLoading } = useGetAllUsersQuery(
    undefined,
    {
      skip: !can(Permission.VIEW_ALL_USERS),
    }
  );
  const { data: departmentsData, isLoading: depsLoading } =
    useGetAllDepartmentsQuery(undefined, {
      skip: !can(Permission.VIEW_DEPARTMENTS),
    });
  const { data: vacationsData, isLoading: vacationsLoading } =
    useGetMyVacationsQuery();

  const users = usersData?.data?.users || [];
  const departments = departmentsData?.data?.departments || [];
  const vacations = vacationsData?.data?.vacations || [];

  const isLoading = vacationsLoading;

  // Determine if showing department-specific data
  const isDepartmentView =
    role === "chief_instructor" || role === "general_head";
  const canViewDepartments =
    role === "super_admin" || role === "registrar_head" || role === "principal";

  const stats = [
    {
      title: isDepartmentView
        ? t("dashboard.stats.departmentUsers")
        : t("dashboard.stats.totalUsers"),
      value: users?.length || 0,
      icon: UsersIcon,
      color: "blue",
      permission: Permission.VIEW_ALL_USERS,
    },
    {
      title: t("dashboard.stats.departments"),
      value: departments?.length || 0,
      icon: BuildingOfficeIcon,
      color: "green",
      permission: Permission.VIEW_DEPARTMENTS,
      visible: canViewDepartments,
    },
    {
      title: t("dashboard.stats.myVacations"),
      value: vacations?.length || 0,
      icon: CalendarDaysIcon,
      color: "purple",
      permission: Permission.VIEW_OWN_VACATIONS,
    },
    {
      title: t("dashboard.stats.vacationBalance"),
      value: user?.vacationBalance || 0,
      icon: ChartBarIcon,
      color: "orange",
      permission: Permission.VIEW_OWN_VACATIONS,
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t("dashboard.greeting.morning");
    if (hour < 18) return t("dashboard.greeting.afternoon");
    return t("dashboard.greeting.evening");
  };

  if (isLoading) {
    return <Loading fullScreen text={t("common.loading")} />;
  }

  return (
    <div className="section-spacing p-2 sm:p-4 lg:p-6">
      {/* Header - Ultra Compact Mobile */}
      <div className="mb-3 sm:mb-4 lg:mb-6">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
          {getGreeting()}, <span className="text-blue-600">{user?.name}</span>!
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          {t("dashboard.welcome")}
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="info" size="sm">
            {t(`roles.${user?.role || "instructor"}`)}
          </Badge>
          {user?.department && (
            <Badge variant="success" size="sm">
              {user.department.name} ({user.department.code})
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Grid - Compact Mobile Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
        {stats.map((stat) => {
          // Check if user has permission to view this stat
          if (!can(stat.permission)) return null;
          // Check if stat is visible (for role-based visibility)
          if ("visible" in stat && !stat.visible) return null;

          const Icon = stat.icon;
          const colorClasses = {
            blue: "from-blue-500 to-blue-600",
            green: "from-green-500 to-green-600",
            purple: "from-purple-500 to-purple-600",
            orange: "from-orange-500 to-orange-600",
            indigo: "from-indigo-500 to-indigo-600",
            teal: "from-teal-500 to-teal-600",
            cyan: "from-cyan-500 to-cyan-600",
            red: "from-red-500 to-red-600",
          };

          return (
            <Card key={stat.title} padding="sm" className="shadow-professional">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div
                    className={`p-1.5 sm:p-2 rounded-lg bg-gradient-to-br ${
                      colorClasses[stat.color as keyof typeof colorClasses]
                    } shadow-sm`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="flex items-center gap-1">
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
                <p className="text-[10px] sm:text-xs font-semibold text-gray-600 truncate">
                  {stat.title}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Vacation Summary - Compact Mobile */}
      <div className="mb-4 sm:mb-6">
        <VacationSummaryCard />
      </div>

      {/* Recent Activity - Compact Mobile Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Recent Vacations - Compact Cards */}
        <Card
          title={t("dashboard.recentVacations")}
          padding="sm"
          className="h-fit"
        >
          {vacations && vacations.length > 0 ? (
            <div className="space-y-2">
              {vacations.slice(0, 5).map((vacation: any) => (
                <div
                  key={vacation._id}
                  className="flex items-center justify-between p-2 sm:p-2.5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-blue-50 hover:to-blue-100 active:scale-[0.98] transition-all duration-200 cursor-pointer"
                >
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                      {t(`vacation.types.${vacation.vacationType}`)}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-600 truncate">
                      {new Date(vacation.startDate).toLocaleDateString()} -{" "}
                      {new Date(vacation.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    size="sm"
                    variant={
                      vacation.status === "approved"
                        ? "success"
                        : vacation.status === "rejected"
                        ? "danger"
                        : "warning"
                    }
                  >
                    {t(`vacation.status.${vacation.status}`)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <CalendarDaysIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-300 mb-2" />
              <p className="text-xs sm:text-sm text-gray-500">
                {t("dashboard.noVacations")}
              </p>
            </div>
          )}
        </Card>

        {/* Quick Actions - Compact Mobile Grid */}
        <Card
          title={t("dashboard.quickActions.title")}
          padding="sm"
          className="h-fit"
        >
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() =>
                (window.location.href = "/dashboard/vacations/apply")
              }
              className="tap-target p-2 sm:p-3 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 active:scale-95 rounded-lg transition-all duration-200 text-center border border-blue-200"
            >
              <CalendarDaysIcon className="w-6 h-6 sm:w-7 sm:h-7 mx-auto text-blue-600 mb-1" />
              <p className="text-[10px] sm:text-xs font-semibold text-gray-900">
                {t("dashboard.quickActions.applyVacation")}
              </p>
            </button>

            {(user?.role === "chief_instructor" ||
              user?.role === "general_head") && (
              <button
                onClick={() =>
                  (window.location.href = "/dashboard/vacations/pending-chief")
                }
                className="tap-target p-2 sm:p-3 bg-gradient-to-br from-yellow-50 to-yellow-100 hover:from-yellow-100 hover:to-yellow-200 active:scale-95 rounded-lg transition-all duration-200 text-center border border-yellow-200"
              >
                <CalendarDaysIcon className="w-6 h-6 sm:w-7 sm:h-7 mx-auto text-yellow-600 mb-1" />
                <p className="text-[10px] sm:text-xs font-semibold text-gray-900">
                  {t("dashboard.quickActions.vacationApprovals")}
                </p>
              </button>
            )}

            {user?.role === "principal" && (
              <button
                onClick={() =>
                  (window.location.href =
                    "/dashboard/vacations/pending-principal")
                }
                className="tap-target p-2 sm:p-3 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 active:scale-95 rounded-lg transition-all duration-200 text-center border border-red-200"
              >
                <CalendarDaysIcon className="w-6 h-6 sm:w-7 sm:h-7 mx-auto text-red-600 mb-1" />
                <p className="text-[10px] sm:text-xs font-semibold text-gray-900">
                  {t("dashboard.quickActions.finalApprovals")}
                </p>
              </button>
            )}

            {can(Permission.VIEW_ALL_USERS) && (
              <button
                onClick={() => (window.location.href = "/dashboard/users")}
                className="tap-target p-2 sm:p-3 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 active:scale-95 rounded-lg transition-all duration-200 text-center border border-green-200"
              >
                <UsersIcon className="w-6 h-6 sm:w-7 sm:h-7 mx-auto text-green-600 mb-1" />
                <p className="text-[10px] sm:text-xs font-semibold text-gray-900">
                  {t("dashboard.quickActions.manageUsers")}
                </p>
              </button>
            )}

            {can(Permission.VIEW_DEPARTMENTS) &&
              (role === "super_admin" ||
                role === "registrar_head" ||
                role === "principal") && (
                <button
                  onClick={() =>
                    (window.location.href = "/dashboard/departments")
                  }
                  className="tap-target p-2 sm:p-3 bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 active:scale-95 rounded-lg transition-all duration-200 text-center border border-purple-200"
                >
                  <BuildingOfficeIcon className="w-6 h-6 sm:w-7 sm:h-7 mx-auto text-purple-600 mb-1" />
                  <p className="text-[10px] sm:text-xs font-semibold text-gray-900">
                    {t("dashboard.quickActions.departments")}
                  </p>
                </button>
              )}
          </div>
        </Card>
      </div>
    </div>
  );
}
