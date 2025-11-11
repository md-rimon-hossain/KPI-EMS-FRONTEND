"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useGetAllUsersQuery, useDeleteUserMutation } from "@/store/userApi";
import { useAppSelector } from "@/store/hooks";
import { usePermission } from "@/hooks/usePermission";
import { Permission } from "@/lib/permissions";
import {
  Can,
  PermissionGuard,
  InfoTooltip,
  RestrictedButton,
} from "@/components/PermissionComponents";
import Card from "@/components/Card";
import Table from "@/components/Table";
import Button from "@/components/Button";
import Badge, { getStatusBadgeVariant } from "@/components/Badge";
import Loading from "@/components/Loading";
import { ConfirmModal } from "@/components/Modal";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function UsersPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const { can } = usePermission();
  const { data: usersData, isLoading } = useGetAllUsersQuery();
  const users = usersData?.data?.users || [];
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser._id).unwrap();
      toast.success(t("common.deleteSuccess"));
      setDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      toast.error(error?.data?.message || t("common.deleteError"));
    }
  };

  const filteredUsers = users.filter(
    (user: any) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: "name",
      header: t("user.name"),
      render: (user: any) => (
        <div>
          <p className="font-medium text-gray-900">{user.name}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: t("user.role"),
      render: (user: any) => (
        <Badge variant="info">{t(`roles.${user.role}`)}</Badge>
      ),
    },
    {
      key: "department",
      header: t("user.department"),
      render: (user: any) => user.department?.name || "-",
    },
    {
      key: "vacationBalance",
      header: t("user.vacationBalance"),
      render: (user: any) => `${user.vacationBalance} ${t("vacation.days")}`,
    },
    {
      key: "isActive",
      header: t("common.status"),
      render: (user: any) => (
        <Badge
          variant={getStatusBadgeVariant(user.isActive ? "active" : "inactive")}
        >
          {user.isActive ? t("common.active") : t("common.inactive")}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: t("common.actions"),
      width: "150px",
      render: (user: any) => (
        <div className="flex gap-2">
          <Can permission={Permission.EDIT_USER}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/dashboard/users/${user._id}`);
              }}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title={t("common.edit")}
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          </Can>
          <Can permission={Permission.DELETE_USER}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedUser(user);
                setDeleteModalOpen(true);
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              disabled={user._id === currentUser?._id}
              title={t("common.delete")}
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </Can>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <Loading fullScreen text={t("common.loading")} />;
  }

  return (
    <PermissionGuard permission={Permission.VIEW_ALL_USERS}>
      <div className="page-transition">
        {/* Header - Ultra Compact Mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                {t("user.listTitle")}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                {t("user.listSubtitle")}
              </p>
            </div>
            <InfoTooltip
              text={
                t("user.manageTooltip") ||
                "Manage employee accounts and their roles"
              }
            />
          </div>
          <Can permission={Permission.CREATE_USER}>
            <Button
              variant="primary"
              size="md"
              onClick={() => router.push("/dashboard/users/create")}
              className="w-full sm:w-auto"
            >
              <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" />
              <span className="hidden sm:inline">{t("user.addNew")}</span>
              <span className="sm:hidden">{t("common.add")}</span>
            </Button>
          </Can>
        </div>

        {/* Search Bar - Compact Mobile */}
        <Card padding="sm" className="mb-3 sm:mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-8 sm:pl-10 pr-3 py-2 sm:py-2.5 text-sm sm:text-base border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder={t("user.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Card>

        {/* Mobile Cards View (shown on small screens) */}
        <div className="lg:hidden space-y-2 mb-3">
          {filteredUsers.map((user: any) => (
            <div
              key={user._id}
              onClick={() => router.push(`/dashboard/users/${user._id}`)}
              className="mobile-card bg-white border border-gray-200 rounded-xl p-3 hover:border-blue-300 transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <Badge size="sm" variant="info">
                  {t(`roles.${user.role}`)}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">
                  {user.department?.name || "-"}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-700 font-semibold">
                    {user.vacationBalance} {t("vacation.days")}
                  </span>
                  <Badge
                    size="sm"
                    variant={getStatusBadgeVariant(
                      user.isActive ? "active" : "inactive"
                    )}
                  >
                    {user.isActive ? t("common.active") : t("common.inactive")}
                  </Badge>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
                <Can permission={Permission.EDIT_USER}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard/users/${user._id}`);
                    }}
                    className="tap-target flex-1 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <PencilIcon className="w-3.5 h-3.5 inline mr-1" />
                    {t("common.edit")}
                  </button>
                </Can>
                <Can permission={Permission.DELETE_USER}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedUser(user);
                      setDeleteModalOpen(true);
                    }}
                    disabled={user._id === currentUser?._id}
                    className="tap-target flex-1 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <TrashIcon className="w-3.5 h-3.5 inline mr-1" />
                    {t("common.delete")}
                  </button>
                </Can>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View (hidden on mobile) */}
        <Card padding="none" className="hidden lg:block">
          <div className="table-responsive">
            <Table
              data={filteredUsers || []}
              columns={columns}
              onRowClick={(user) => router.push(`/dashboard/users/${user._id}`)}
              emptyMessage={t("user.noUsers")}
            />
          </div>
        </Card>

        {/* Summary Stats - Compact Mobile */}
        <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
          <div className="px-2 py-1 bg-blue-50 border border-blue-200 rounded-lg">
            <span className="text-gray-600">{t("user.totalUsers")}: </span>
            <strong className="text-blue-600">{users.length}</strong>
          </div>
          <div className="px-2 py-1 bg-green-50 border border-green-200 rounded-lg">
            <span className="text-gray-600">{t("user.activeUsers")}: </span>
            <strong className="text-green-600">
              {users.filter((u: any) => u.isActive).length}
            </strong>
          </div>
          <div className="px-2 py-1 bg-purple-50 border border-purple-200 rounded-lg">
            <span className="text-gray-600">{t("user.filteredResults")}: </span>
            <strong className="text-purple-600">{filteredUsers.length}</strong>
          </div>
        </div>

        <ConfirmModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title={t("user.deleteTitle")}
          message={t("user.deleteConfirm", { name: selectedUser?.name })}
          confirmText={t("common.delete")}
          variant="danger"
          loading={isDeleting}
        />
      </div>
    </PermissionGuard>
  );
}
