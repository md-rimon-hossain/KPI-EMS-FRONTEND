"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {
  useGetAllDepartmentsQuery,
  useDeleteDepartmentMutation,
} from "@/store/departmentApi";
import { usePermission } from "@/hooks/usePermission";
import { Permission } from "@/lib/permissions";
import {
  Can,
  PermissionGuard,
  InfoTooltip,
} from "@/components/PermissionComponents";
import Card from "@/components/Card";
import Table from "@/components/Table";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import { ConfirmModal } from "@/components/Modal";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function DepartmentsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { can } = usePermission();
  const { data: departmentsData, isLoading } = useGetAllDepartmentsQuery();
  const departments = departmentsData?.data?.departments || [];
  const [deleteDepartment, { isLoading: isDeleting }] =
    useDeleteDepartmentMutation();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<any>(null);

  const handleDelete = async () => {
    if (!selectedDept) return;

    try {
      await deleteDepartment(selectedDept._id).unwrap();
      toast.success(t("department.deleteSuccess"));
      setDeleteModalOpen(false);
      setSelectedDept(null);
    } catch (error: any) {
      toast.error(error?.data?.message || t("department.deleteError"));
    }
  };

  const columns = [
    {
      key: "name",
      header: t("department.departmentName"),
      render: (dept: any) => (
        <div>
          <p className="font-medium text-gray-900">{dept.name}</p>
          <p className="text-sm text-gray-500">Code: {dept.code}</p>
        </div>
      ),
    },
    {
      key: "chiefInstructor",
      header: t("roles.chief_instructor"),
      render: (dept: any) =>
        dept.chiefInstructor?.name || t("common.notAssigned"),
    },
    {
      key: "description",
      header: t("department.description"),
      render: (dept: any) => dept.description || "-",
    },
    {
      key: "actions",
      header: t("common.actions"),
      width: "150px",
      render: (dept: any) => (
        <div className="flex gap-2">
          <Can permission={Permission.EDIT_DEPARTMENT}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/dashboard/departments/${dept._id}`);
              }}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          </Can>
          <Can permission={Permission.DELETE_DEPARTMENT}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedDept(dept);
                setDeleteModalOpen(true);
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
    <PermissionGuard permission={Permission.VIEW_DEPARTMENTS}>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t("department.list")}
              </h1>
              <p className="text-gray-600 mt-1">{t("dashboard.subtitle")}</p>
            </div>
            <InfoTooltip
              text={
                t("department.manageTooltip") ||
                "Manage institution departments"
              }
            />
          </div>
          <Can permission={Permission.CREATE_DEPARTMENT}>
            <Button
              variant="primary"
              onClick={() => router.push("/dashboard/departments/create")}
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              {t("department.create")}
            </Button>
          </Can>
        </div>

        <Card padding="none">
          <Table
            data={departments || []}
            columns={columns}
            onRowClick={(dept) =>
              router.push(`/dashboard/departments/${dept._id}`)
            }
            emptyMessage={t("department.noDepartments")}
          />
        </Card>

        <ConfirmModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleDelete}
          title={t("department.delete")}
          message={t("department.confirmDelete", { name: selectedDept?.name })}
          confirmText={t("common.delete")}
          variant="danger"
          loading={isDeleting}
        />
      </div>
    </PermissionGuard>
  );
}
