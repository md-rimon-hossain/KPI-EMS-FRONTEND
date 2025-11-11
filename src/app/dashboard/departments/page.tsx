"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useGetAllDepartmentsQuery,
  useDeleteDepartmentMutation,
} from "@/store/departmentApi";
import Card from "@/components/Card";
import Table from "@/components/Table";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import { ConfirmModal } from "@/components/Modal";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function DepartmentsPage() {
  const router = useRouter();
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
      toast.success("Department deleted successfully");
      setDeleteModalOpen(false);
      setSelectedDept(null);
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to delete department");
    }
  };

  const columns = [
    {
      key: "name",
      header: "Department Name",
      render: (dept: any) => (
        <div>
          <p className="font-medium text-gray-900">{dept.name}</p>
          <p className="text-sm text-gray-500">Code: {dept.code}</p>
        </div>
      ),
    },
    {
      key: "chiefInstructor",
      header: "Chief Instructor",
      render: (dept: any) => dept.chiefInstructor?.name || "Not assigned",
    },
    {
      key: "description",
      header: "Description",
      render: (dept: any) => dept.description || "-",
    },
    {
      key: "actions",
      header: "Actions",
      width: "150px",
      render: (dept: any) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/dashboard/departments/${dept._id}`);
            }}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
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
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <Loading fullScreen text="Loading departments..." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-600 mt-1">Manage academic departments</p>
        </div>
        <Button
          variant="primary"
          onClick={() => router.push("/dashboard/departments/create")}
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Department
        </Button>
      </div>

      <Card padding="none">
        <Table
          data={departments || []}
          columns={columns}
          onRowClick={(dept) =>
            router.push(`/dashboard/departments/${dept._id}`)
          }
          emptyMessage="No departments found"
        />
      </Card>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Department"
        message={`Are you sure you want to delete ${selectedDept?.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={isDeleting}
      />
    </div>
  );
}
