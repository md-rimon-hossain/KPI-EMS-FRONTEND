"use client";

import { useAppSelector } from "@/store/hooks";
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
  const { user } = useAppSelector((state) => state.auth);
  const { data: usersData, isLoading: usersLoading } = useGetAllUsersQuery();
  const { data: departmentsData, isLoading: depsLoading } =
    useGetAllDepartmentsQuery();
  const { data: vacationsData, isLoading: vacationsLoading } =
    useGetMyVacationsQuery();

  const users = usersData?.data?.users || [];
  const departments = departmentsData?.data?.departments || [];
  const vacations = vacationsData?.data?.vacations || [];

  const isLoading = usersLoading || depsLoading || vacationsLoading;

  const canViewUsers = ["super_admin", "principal", "general_shakha"].includes(
    user?.role || ""
  );
  const canViewDepartments = [
    "super_admin",
    "principal",
    "general_shakha",
  ].includes(user?.role || "");

  const stats = [
    {
      title: "Total Users",
      value: users?.length || 0,
      icon: UsersIcon,
      color: "blue",
      visible: canViewUsers,
    },
    {
      title: "Departments",
      value: departments?.length || 0,
      icon: BuildingOfficeIcon,
      color: "green",
      visible: canViewDepartments,
    },
    {
      title: "My Vacations",
      value: vacations?.length || 0,
      icon: CalendarDaysIcon,
      color: "purple",
      visible: true,
    },
    {
      title: "Vacation Balance",
      value: user?.vacationBalance || 0,
      icon: ChartBarIcon,
      color: "orange",
      visible: true,
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  if (isLoading) {
    return <Loading fullScreen text="Loading dashboard..." />;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {getGreeting()}, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Welcome to your dashboard. Here's what's happening today.
        </p>
        <Badge variant="info" size="md" className="mt-3">
          {user?.role?.replace(/_/g, " ").toUpperCase()}
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats
          .filter((stat) => stat.visible)
          .map((stat) => {
            const Icon = stat.icon;
            const colorClasses = {
              blue: "bg-blue-500",
              green: "bg-green-500",
              purple: "bg-purple-500",
              orange: "bg-orange-500",
            };

            return (
              <Card
                key={stat.title}
                className="hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`p-3 rounded-full ${
                      colorClasses[stat.color as keyof typeof colorClasses]
                    }`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Card>
            );
          })}
      </div>

      {/* Vacation Summary - Full Width for Best Experience */}
      <div className="mb-8">
        <VacationSummaryCard />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Vacations */}
        <Card title="Recent Vacation Requests" className="h-fit">
          {vacations && vacations.length > 0 ? (
            <div className="space-y-3">
              {vacations.slice(0, 5).map((vacation: any) => (
                <div
                  key={vacation._id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {vacation.vacationType}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(vacation.startDate).toLocaleDateString()} -{" "}
                      {new Date(vacation.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={
                      vacation.status === "approved"
                        ? "success"
                        : vacation.status === "rejected"
                        ? "danger"
                        : "warning"
                    }
                  >
                    {vacation.status.replace(/_/g, " ")}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No vacation requests yet
            </p>
          )}
        </Card>

        {/* Quick Actions */}
        <Card title="Quick Actions" className="h-fit">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() =>
                (window.location.href = "/dashboard/vacations/apply")
              }
              className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-center"
            >
              <CalendarDaysIcon className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">
                Apply for Vacation
              </p>
            </button>

            {user?.role === "chief_instructor" && (
              <button
                onClick={() =>
                  (window.location.href = "/dashboard/vacations/pending-chief")
                }
                className="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors text-center"
              >
                <CalendarDaysIcon className="w-8 h-8 mx-auto text-yellow-600 mb-2" />
                <p className="text-sm font-medium text-gray-900">
                  Vacation Approvals
                </p>
              </button>
            )}

            {user?.role === "principal" && (
              <button
                onClick={() =>
                  (window.location.href =
                    "/dashboard/vacations/pending-principal")
                }
                className="p-4 bg-red-50 hover:bg-red-100 rounded-lg transition-colors text-center"
              >
                <CalendarDaysIcon className="w-8 h-8 mx-auto text-red-600 mb-2" />
                <p className="text-sm font-medium text-gray-900">
                  Final Approvals
                </p>
              </button>
            )}

            {canViewUsers && (
              <button
                onClick={() => (window.location.href = "/dashboard/users")}
                className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-center"
              >
                <UsersIcon className="w-8 h-8 mx-auto text-green-600 mb-2" />
                <p className="text-sm font-medium text-gray-900">
                  Manage Users
                </p>
              </button>
            )}

            {canViewDepartments && (
              <button
                onClick={() =>
                  (window.location.href = "/dashboard/departments")
                }
                className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-center"
              >
                <BuildingOfficeIcon className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                <p className="text-sm font-medium text-gray-900">Departments</p>
              </button>
            )}

            <button
              onClick={() => (window.location.href = "/dashboard/vacations")}
              className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-center"
            >
              <ChartBarIcon className="w-8 h-8 mx-auto text-orange-600 mb-2" />
              <p className="text-sm font-medium text-gray-900">My Vacations</p>
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
