"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useCreateDepartmentMutation,
  useGetAllDepartmentsQuery,
} from "@/store/departmentApi";
import { useGetAllUsersQuery } from "@/store/userApi";
import Card from "@/components/Card";
import Input from "@/components/Input";
import Button from "@/components/Button";
import toast from "react-hot-toast";

export default function CreateDepartmentPage() {
  const router = useRouter();
  const [createDepartment, { isLoading }] = useCreateDepartmentMutation();
  const { data: usersData } = useGetAllUsersQuery();
  const users = usersData?.data?.users || [];

  const chiefInstructors = users.filter(
    (user: any) => user.role === "chief_instructor"
  );

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    chiefInstructor: "",
    description: "",
  });

  const [errors, setErrors] = useState<any>({});

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validate = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) newErrors.name = "Department name is required";
    if (!formData.code.trim()) newErrors.code = "Department code is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const payload: any = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
      };

      if (formData.chiefInstructor) {
        payload.chiefInstructor = formData.chiefInstructor;
      }

      if (formData.description.trim()) {
        payload.description = formData.description.trim();
      }

      await createDepartment(payload).unwrap();
      toast.success("Department created successfully");
      router.push("/dashboard/departments");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create department");
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Create New Department
        </h1>
        <p className="text-gray-600 mt-1">
          Add a new academic department to the system
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Department Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="e.g., Computer Science & Technology"
            required
          />

          <Input
            label="Department Code"
            type="text"
            name="code"
            value={formData.code}
            onChange={handleChange}
            error={errors.code}
            placeholder="e.g., CST"
            helperText="Short code for the department (will be converted to uppercase)"
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chief Instructor
            </label>
            <select
              name="chiefInstructor"
              value={formData.chiefInstructor}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Chief Instructor (Optional)</option>
              {chiefInstructors?.map((user: any) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            {chiefInstructors.length === 0 && (
              <p className="mt-1 text-sm text-gray-500">
                No chief instructors available. Create a user with Chief
                Instructor role first.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description about the department..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              fullWidth
            >
              Create Department
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push("/dashboard/departments")}
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
