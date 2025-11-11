"use client";

import { useAppSelector } from "@/store/hooks";
import { redirect } from "next/navigation";
import Card from "@/components/Card";
import Input from "@/components/Input";
import Badge from "@/components/Badge";
import Loading from "@/components/Loading";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    redirect("/login");
  }

  if (!user) {
    return <Loading fullScreen text="Loading profile..." />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600 mt-1">
          View and manage your profile information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info Card */}
        <Card className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Personal Information
          </h2>

          <div className="space-y-4">
            <Input label="Full Name" value={user.name} disabled />

            <Input
              label="Email Address"
              type="email"
              value={user.email}
              disabled
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <Badge variant="info" size="lg">
                {user.role.replace(/_/g, " ").toUpperCase()}
              </Badge>
            </div>

            <Input
              label="Department"
              value={user.department?.name || "Not Assigned"}
              disabled
            />

            {user.phone && (
              <Input label="Phone Number" value={user.phone} disabled />
            )}

            <div className="flex gap-4">
              <Input
                label="Vacation Balance"
                value={`${user.vacationBalance} days`}
                disabled
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Badge variant={user.isActive ? "success" : "danger"} size="lg">
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Account Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Account Created</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(user.updatedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Vacation Balance</span>
                <span className="text-sm font-medium text-green-600">
                  {user.vacationBalance} days
                </span>
              </div>
            </div>
          </Card>

          <Card className="bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Need Help?
            </h3>
            <p className="text-sm text-blue-700">
              Contact your administrator if you need to update any profile
              information.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
