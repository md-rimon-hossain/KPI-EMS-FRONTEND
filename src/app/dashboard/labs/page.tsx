"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { usePermission } from "@/hooks/usePermission";
import { Permission } from "@/lib/permissions";
import { useGetLabsQuery, useDeleteLabMutation } from "@/store/labApi";
import { useGetAllDepartmentsQuery } from "@/store/departmentApi";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Table from "@/components/Table";
import Modal from "@/components/Modal";
import Loading from "@/components/Loading";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

export default function LabsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { can, role } = usePermission();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [labToDelete, setLabToDelete] = useState<string | null>(null);

  const { data: labsData, isLoading } = useGetLabsQuery({
    page,
    limit: 20,
    department: selectedDepartment || undefined,
    search: search || undefined,
  });

  const { data: departmentsData } = useGetAllDepartmentsQuery();
  const [deleteLab, { isLoading: isDeleting }] = useDeleteLabMutation();

  const handleDelete = async () => {
    if (!labToDelete) return;
    try {
      await deleteLab(labToDelete).unwrap();
      setDeleteModalOpen(false);
      setLabToDelete(null);
    } catch (error) {
      console.error("Failed to delete lab:", error);
    }
  };

  const columns = [
    {
      key: "labCode",
      header: t("lab.labCode"),
      render: (lab: any) => (
        <span className="font-medium text-gray-900">{lab.labCode}</span>
      ),
    },
    {
      key: "name",
      header: t("lab.labName"),
      render: (lab: any) => <span className="text-gray-900">{lab.name}</span>,
    },
    {
      key: "department",
      header: t("lab.department"),
      render: (lab: any) => (
        <span className="text-gray-600">{lab.department?.name}</span>
      ),
    },
    {
      key: "labIncharge",
      header: t("lab.labIncharge"),
      render: (lab: any) => (
        <span className="text-gray-600">
          {lab.labIncharge?.name || t("common.notAssigned")}
        </span>
      ),
    },
    {
      key: "location",
      header: t("lab.location"),
      render: (lab: any) => (
        <span className="text-gray-600">{lab.location || "-"}</span>
      ),
    },
    {
      key: "capacity",
      header: t("lab.capacity"),
      render: (lab: any) => (
        <span className="text-gray-600">{lab.capacity || "-"}</span>
      ),
    },
    {
      key: "actions",
      header: t("common.actions"),
      render: (lab: any) => (
        <div className="flex gap-2">
          {can(Permission.EDIT_LAB) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/dashboard/labs/${lab._id}`)}
            >
              <PencilIcon className="w-4 h-4" />
            </Button>
          )}
          {can(Permission.DELETE_LAB) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setLabToDelete(lab._id);
                setDeleteModalOpen(true);
              }}
            >
              <TrashIcon className="w-4 h-4 text-red-600" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (!can(Permission.VIEW_LABS)) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t("common.noPermission")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("lab.title")}</h1>
          <p className="text-gray-600 mt-1">{t("lab.subtitle")}</p>
        </div>
        {can(Permission.CREATE_LAB) && (
          <Button
            onClick={() => router.push("/dashboard/labs/create")}
            className="flex items-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            {t("lab.addLab")}
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder={t("common.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Hide department filter for Chief Instructor and General Head */}
          {role !== "chief_instructor" && role !== "general_head" && (
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">
                {t("common.select")} {t("lab.department")}
              </option>
              {departmentsData?.data?.departments.map((dept: any) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <Loading />
      ) : labsData?.labs && labsData.labs.length > 0 ? (
        <>
          <Table columns={columns} data={labsData.labs} />
          {labsData.total > 20 && (
            <div className="mt-4 flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                {t("common.previous")}
              </Button>
              <span className="px-4 py-2 text-sm text-gray-700">
                {t("common.page")} {page} {t("common.of")}{" "}
                {Math.ceil(labsData.total / 20)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage(Math.min(Math.ceil(labsData.total / 20), page + 1))
                }
                disabled={page >= Math.ceil(labsData.total / 20)}
              >
                {t("common.next")}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-gray-500">{t("lab.noLabs")}</p>
        </div>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setLabToDelete(null);
        }}
        title={t("lab.deleteLab")}
      >
        <p className="text-gray-600 mb-6">{t("lab.deleteConfirm")}</p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => {
              setDeleteModalOpen(false);
              setLabToDelete(null);
            }}
          >
            {t("common.cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? t("common.loading") : t("common.delete")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
