"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateUserMutation } from "@/store/userApi";
import { useGetAllDepartmentsQuery } from "@/store/departmentApi";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Input from "@/components/Input";
import GmailVerification from "@/components/GmailVerification";
import toast from "react-hot-toast";

export default function CreateUserPage() {
  const router = useRouter();
  const [createUser, { isLoading }] = useCreateUserMutation();
  const { data: departmentsData } = useGetAllDepartmentsQuery();
  const departments = departmentsData?.data?.departments || [];

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "instructor",
    department: "",
    phone: "",
    vacationBalance: "21",
  });

  const [errors, setErrors] = useState<any>({});
  const [gmailVerified, setGmailVerified] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // Check if role changed to/from super_admin
    if (name === "role") {
      const isSA = value === "super_admin";
      setIsSuperAdmin(isSA);
      // Reset Gmail verification if switching to super_admin
      if (isSA) {
        setGmailVerified(false);
      }
    }

    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleEmailChange = (email: string) => {
    setFormData({ ...formData, email });
    setGmailVerified(false);
    if (errors.email) {
      setErrors({ ...errors, email: "" });
    }
  };

  const validate = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";

    // Gmail verification required for non-super-admin roles
    if (!isSuperAdmin && !gmailVerified) {
      newErrors.email = "Gmail address must be verified";
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!formData.role) newErrors.role = "Role is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please complete all required fields");
      return;
    }

    try {
      const userData: any = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        vacationBalance: parseInt(formData.vacationBalance),
        gmailVerified: gmailVerified, // Pass verification status
      };

      if (formData.department) {
        userData.department = formData.department;
      }

      if (formData.phone) {
        userData.phone = formData.phone;
      }

      await createUser(userData).unwrap();
      toast.success(
        isSuperAdmin
          ? "Super Admin created successfully!"
          : "User created successfully! Email is already verified via OTP."
      );
      router.push("/dashboard/users");
    } catch (error: any) {
      toast.error(error?.data?.message || "Failed to create user");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create User</h1>
        <p className="text-gray-600 mt-1">Add a new user to the system</p>
      </div>

      {/* Information Banner */}
      {!isSuperAdmin && (
        <div className="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Gmail Verification Required
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  To ensure valid email addresses, verify the employee&apos;s
                  Gmail with a one-time code:
                </p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>Select the user role</li>
                  <li>Enter the employee&apos;s Gmail address</li>
                  <li>
                    Click &quot;Send Code&quot; - a 6-digit code will be sent to
                    their Gmail
                  </li>
                  <li>
                    Ask the employee to check their inbox and provide the code
                  </li>
                  <li>
                    Enter the code to verify - once verified, their email is
                    confirmed and they can login immediately
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Role Selection */}
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

          {/* Step 2: Gmail Verification (only for non-super-admin) */}
          {!isSuperAdmin ? (
            <GmailVerification
              email={formData.email}
              onVerified={() => setGmailVerified(true)}
              onEmailChange={handleEmailChange}
            />
          ) : (
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              helperText="Super admin can use any email address"
              required
            />
          )}

          {errors.email && !isSuperAdmin && (
            <p className="text-sm text-red-600 -mt-4">{errors.email}</p>
          )}

          {/* Step 3: Rest of the form (enabled after Gmail verification or for super admin) */}
          <div
            className={
              !isSuperAdmin && !gmailVerified
                ? "opacity-50 pointer-events-none"
                : ""
            }
          >
            <Input
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
              disabled={!isSuperAdmin && !gmailVerified}
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              helperText="Minimum 6 characters"
              required
              disabled={!isSuperAdmin && !gmailVerified}
            />

            <Input
              label="Phone Number"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              helperText="Optional"
              disabled={!isSuperAdmin && !gmailVerified}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!isSuperAdmin && !gmailVerified}
              >
                <option value="">Select Department</option>
                {departments?.map((dept: any) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Vacation Balance"
              type="number"
              name="vacationBalance"
              value={formData.vacationBalance}
              onChange={handleChange}
              helperText="Annual vacation days (default: 21)"
              required
              disabled={!isSuperAdmin && !gmailVerified}
            />
          </div>

          {/* Info message when form is disabled */}
          {!isSuperAdmin && !gmailVerified && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex">
                <svg
                  className="h-5 w-5 text-yellow-400 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <p className="text-sm text-yellow-800">
                  Please verify the Gmail address above to continue filling the
                  form.
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
              disabled={!isSuperAdmin && !gmailVerified}
              fullWidth
            >
              Create User
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
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
