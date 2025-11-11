"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useGetUserByIdQuery, useUpdateUserMutation } from "@/store/userApi";
import { useGetAllDepartmentsQuery } from "@/store/departmentApi";
import Card from "@/components/Card";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: userData, isLoading: isLoadingUser } = useGetUserByIdQuery(id);
  const user = userData?.data?.user;

  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const { data: departmentsData } = useGetAllDepartmentsQuery();
  const departments = departmentsData?.data?.departments || [];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "instructor",
    department: "",
    phone: "",
    isActive: true,
  });

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        role: user.role || "instructor",
        department:
          typeof user.department === "string"
            ? user.department
            : user.department?._id || "",
        phone: user.phone || "",
        isActive: user.isActive ?? true,
      });
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validate = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Invalid email format";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const payload: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        isActive: formData.isActive,
      };

      if (formData.department) {
        payload.department = formData.department;
      }

      if (formData.phone.trim()) {
        payload.phone = formData.phone.trim();
      }

      await updateUser({ id, data: payload }).unwrap();
      toast.success("User updated successfully");
      router.push("/dashboard/users");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to update user");
    }
  };

  if (isLoadingUser) {
    return <Loading fullScreen text="Loading user..." />;
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">User not found</p>
        <Button
          variant="primary"
          onClick={() => router.push("/dashboard/users")}
          className="mt-4"
        >
          Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit User</h1>
        <p className="text-gray-600 mt-1">Update user information</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="e.g., John Doe"
            required
          />

          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="e.g., john@college.com"
            required
          />

          <Input
            label="Phone Number"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            placeholder="e.g., +880 1XXX-XXXXXX"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="instructor">Instructor</option>
              <option value="chief_instructor">Chief Instructor</option>
              <option value="general_shakha">General Shakha</option>
              <option value="principal">Principal</option>
              <option value="super_admin">Super Admin</option>
            </select>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">{errors.role}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Department</option>
              {departments?.map((dept: any) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="isActive"
              className="ml-2 text-sm font-medium text-gray-700"
            >
              Active User
            </label>
            <p className="ml-2 text-sm text-gray-500">
              (Inactive users cannot login)
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Password cannot be changed from this form.
              User must use the "Change Password" feature from their profile
              settings.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              fullWidth
            >
              Update User
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push("/dashboard/users")}
              fullWidth
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
