"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGetAllUsersQuery, useDeleteUserMutation } from "@/store/userApi";
import { useAppSelector } from "@/store/hooks";
import Card from "@/components/Card";
import Table from "@/components/Table";
import Button from "@/components/Button";
import Badge, { getStatusBadgeVariant } from "@/components/Badge";
import Loading from "@/components/Loading";
import { ConfirmModal } from "@/components/Modal";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function UsersPage() {
  const router = useRouter();
  const { user: currentUser } = useAppSelector((state) => state.auth);
  const { data: usersData, isLoading } = useGetAllUsersQuery();
  const users = usersData?.data?.users || [];
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const canManageUsers = [
    "super_admin",
    "principal",
    "general_shakha",
  ].includes(currentUser?.role || "");

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser._id).unwrap();
      toast.success("User deleted successfully");
      setDeleteModalOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete user");
    }
  };

  const columns = [
    {
      key: "name",
      header: "Name",
      render: (user: any) => (
        <div>
          <p className="font-medium text-gray-900">{user.name}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (user: any) => (
        <Badge variant="info">{user.role.replace(/_/g, " ")}</Badge>
      ),
    },
    {
      key: "department",
      header: "Department",
      render: (user: any) => user.department?.name || "-",
    },
    {
      key: "vacationBalance",
      header: "Vacation Balance",
      render: (user: any) => `${user.vacationBalance} days`,
    },
    {
      key: "isActive",
      header: "Status",
      render: (user: any) => (
        <Badge
          variant={getStatusBadgeVariant(user.isActive ? "active" : "inactive")}
        >
          {user.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      width: "150px",
      render: (user: any) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/dashboard/users/${user._id}`);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedUser(user);
              setDeleteModalOpen(true);
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            disabled={user._id === currentUser?._id}
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (!canManageUsers) {
    return (
      <Card className="text-center py-12">
        <p className="text-gray-600">
          You don't have permission to view this page.
        </p>
      </Card>
    );
  }

  if (isLoading) {
    return <Loading fullScreen text="Loading users..." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600 mt-1">
            Manage system users and their roles
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => router.push("/dashboard/users/create")}
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add User
        </Button>
      </div>

      <Card padding="none">
        <Table
          data={users || []}
          columns={columns}
          onRowClick={(user) => router.push(`/dashboard/users/${user._id}`)}
          emptyMessage="No users found"
        />
      </Card>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={isDeleting}
      />
    </div>
  );
}
