"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGetMyVacationsQuery } from "@/store/vacationApi";
import { useAppSelector } from "@/store/hooks";
import Card from "@/components/Card";
import Table from "@/components/Table";
import Button from "@/components/Button";
import Badge, { getStatusBadgeVariant } from "@/components/Badge";
import Loading from "@/components/Loading";
import VacationSummaryCard from "@/components/VacationSummaryCard";
import { PlusIcon, GiftIcon } from "@heroicons/react/24/outline";

export default function VacationsPage() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const { data: vacationsData, isLoading } = useGetMyVacationsQuery();
  const vacations = vacationsData?.data?.vacations || [];

  const columns = [
    {
      key: "vacationType",
      header: "Type",
      render: (vacation: any) => (
        <span className="capitalize">
          {vacation.vacationType.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      key: "dates",
      header: "Dates",
      render: (vacation: any) => (
        <div>
          <p className="text-sm">
            {new Date(vacation.startDate).toLocaleDateString()} -{" "}
            {new Date(vacation.endDate).toLocaleDateString()}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-gray-500">
              {vacation.workingDays} working days
            </p>
            {vacation.isRewardVacation && (
              <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                <GiftIcon className="w-3 h-3" />
                Reward
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "reason",
      header: "Reason",
      render: (vacation: any) => (
        <p className="max-w-xs truncate">{vacation.reason}</p>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (vacation: any) => (
        <Badge variant={getStatusBadgeVariant(vacation.status)}>
          {vacation.status.replace(/_/g, " ")}
        </Badge>
      ),
    },
    {
      key: "appliedOn",
      header: "Applied On",
      render: (vacation: any) =>
        new Date(vacation.createdAt).toLocaleDateString(),
    },
  ];

  if (isLoading) {
    return <Loading fullScreen text="Loading vacations..." />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Vacations</h1>
          <p className="text-gray-600 mt-1">
            View and manage your vacation requests
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => router.push("/dashboard/vacations/apply")}
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Apply for Vacation
        </Button>
      </div>

      {/* Vacation Summary Card */}
      <div className="mb-6">
        <VacationSummaryCard />
      </div>

      {/* Vacation Requests Table */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          My Vacation Requests
        </h2>
      </div>

      <Card padding="none">
        <Table
          data={vacations || []}
          columns={columns}
          onRowClick={(vacation) =>
            router.push(`/dashboard/vacations/${vacation._id}`)
          }
          emptyMessage="No vacation requests found"
        />
      </Card>

      {/* Pending Vacations for Chief/Principal */}
      {user?.role === "chief_instructor" && (
        <div className="mt-6">
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Chief Instructor - Pending Approvals
            </h2>
            <p className="text-gray-600 mb-4">
              Review vacation requests from your department employees
            </p>
            <Button
              variant="primary"
              onClick={() => router.push("/dashboard/vacations/pending-chief")}
              fullWidth
            >
              View Pending Vacation Requests
            </Button>
          </Card>
        </div>
      )}

      {user?.role === "principal" && (
        <div className="mt-6">
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Principal - Final Approvals
            </h2>
            <p className="text-gray-600 mb-4">
              Review all vacation requests requiring your approval
            </p>
            <Button
              variant="primary"
              onClick={() =>
                router.push("/dashboard/vacations/pending-principal")
              }
              fullWidth
            >
              View Pending Final Approvals
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
