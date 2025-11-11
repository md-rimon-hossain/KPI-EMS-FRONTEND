"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useCreateUserMutation } from "@/store/userApi";
import { useGetAllDepartmentsQuery } from "@/store/departmentApi";
import { Permission } from "@/lib/permissions";
import {
  PermissionGuard,
  InfoTooltip,
} from "@/components/PermissionComponents";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Input from "@/components/Input";
import GmailVerification from "@/components/GmailVerification";
import toast from "react-hot-toast";

export default function CreateUserPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [createUser, { isLoading }] = useCreateUserMutation();
  const { data: departmentsData } = useGetAllDepartmentsQuery();
  const departments = departmentsData?.data?.departments || [];

  const [formData, setFormData] = useState({
    // Basic Info
    name: "",
    email: "",
    password: "",
    role: "instructor",
    department: "",
    phone: "",
    vacationBalance: "21",

    // Employment & Job Details
    jobTitle: "",
    position: "",
    departmentWorkArea: "",
    employmentStatus: "permanent",
    startDate: "",
    jobDescription: "",

    // Personal Information
    presentAddress: "",
    permanentAddress: "",
    nidNumber: "",
    dateOfBirth: "",
    bloodGroup: "",

    // Emergency Contact
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactPhone: "",
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
        gmailVerified: gmailVerified,
      };

      // Optional Basic Fields
      if (formData.department) userData.department = formData.department;
      if (formData.phone) userData.phone = formData.phone;

      // Employment & Job Details
      if (formData.jobTitle) userData.jobTitle = formData.jobTitle;
      if (formData.position) userData.position = formData.position;
      if (formData.departmentWorkArea)
        userData.departmentWorkArea = formData.departmentWorkArea;
      if (formData.employmentStatus)
        userData.employmentStatus = formData.employmentStatus;
      if (formData.startDate) userData.startDate = formData.startDate;
      if (formData.jobDescription)
        userData.jobDescription = formData.jobDescription;

      // Personal Information
      if (formData.presentAddress)
        userData.presentAddress = formData.presentAddress;
      if (formData.permanentAddress)
        userData.permanentAddress = formData.permanentAddress;
      if (formData.nidNumber) userData.nidNumber = formData.nidNumber;
      if (formData.dateOfBirth) userData.dateOfBirth = formData.dateOfBirth;
      if (formData.bloodGroup) userData.bloodGroup = formData.bloodGroup;

      // Emergency Contact
      if (formData.emergencyContactName || formData.emergencyContactPhone) {
        userData.emergencyContact = {
          name: formData.emergencyContactName,
          relationship: formData.emergencyContactRelationship,
          phone: formData.emergencyContactPhone,
        };
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
    <PermissionGuard permission={Permission.CREATE_USER}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-start gap-2">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {t("user.createUser")}
            </h1>
            <p className="text-gray-600 mt-2">
              {t("user.createUserSubtitle") ||
                "Add a new employee to the system"}
            </p>
          </div>
          <InfoTooltip
            text={
              t("user.createUserTooltip") ||
              "Create a new employee account with role and department assignment"
            }
          />
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
                      Click &quot;Send Code&quot; - a 6-digit code will be sent
                      to their Gmail
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
                {t("user.role")} <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              >
                <option value="instructor">{t("roles.instructor")}</option>
                <option value="craft_instructor">
                  {t("roles.craft_instructor")}
                </option>
                <option value="assistant_instructor">
                  {t("roles.assistant_instructor")}
                </option>
                <option value="chief_instructor">
                  {t("roles.chief_instructor")}
                </option>
                <option value="office_staff">{t("roles.office_staff")}</option>
                <option value="lab_assistant">
                  {t("roles.lab_assistant")}
                </option>
                <option value="library_staff">
                  {t("roles.library_staff")}
                </option>
                <option value="other_employee">
                  {t("roles.other_employee")}
                </option>
                <option value="general_shakha">
                  {t("roles.general_shakha")}
                </option>
                <option value="principal">{t("roles.principal")}</option>
                <option value="super_admin">{t("roles.super_admin")}</option>
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

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label={t("user.phone")}
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isSuperAdmin && !gmailVerified}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("user.department")}
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    disabled={!isSuperAdmin && !gmailVerified}
                  >
                    <option value="">
                      {t("common.select")} {t("user.department")}
                    </option>
                    {departments?.map((dept: any) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Employment & Job Details Section */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  {t("user.employmentInfo")}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t("user.jobTitle")}
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    placeholder="e.g., Senior Instructor"
                    disabled={!isSuperAdmin && !gmailVerified}
                  />

                  <Input
                    label={t("user.position")}
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    placeholder="e.g., Head of Computer Department"
                    disabled={!isSuperAdmin && !gmailVerified}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("user.employmentStatus")}
                    </label>
                    <select
                      name="employmentStatus"
                      value={formData.employmentStatus}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      disabled={!isSuperAdmin && !gmailVerified}
                    >
                      <option value="permanent">
                        {t("employmentStatus.permanent")}
                      </option>
                      <option value="full_time">
                        {t("employmentStatus.full_time")}
                      </option>
                      <option value="part_time">
                        {t("employmentStatus.part_time")}
                      </option>
                      <option value="contract">
                        {t("employmentStatus.contract")}
                      </option>
                      <option value="temporary">
                        {t("employmentStatus.temporary")}
                      </option>
                    </select>
                  </div>

                  <Input
                    label={t("user.startDate")}
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    disabled={!isSuperAdmin && !gmailVerified}
                  />

                  <Input
                    label={t("user.departmentWorkArea")}
                    name="departmentWorkArea"
                    value={formData.departmentWorkArea}
                    onChange={handleChange}
                    placeholder="e.g., Main Building, Lab 3"
                    disabled={!isSuperAdmin && !gmailVerified}
                  />

                  <Input
                    label={t("user.vacationBalance")}
                    type="number"
                    name="vacationBalance"
                    value={formData.vacationBalance}
                    onChange={handleChange}
                    helperText="Annual vacation days (default: 21)"
                    required
                    disabled={!isSuperAdmin && !gmailVerified}
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("user.jobDescription")}
                  </label>
                  <textarea
                    name="jobDescription"
                    value={formData.jobDescription}
                    onChange={(e) => handleChange(e as any)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Brief description of responsibilities..."
                    disabled={!isSuperAdmin && !gmailVerified}
                  />
                </div>
              </div>

              {/* Personal Information Section */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  {t("user.personalInfo")}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t("user.nidNumber")}
                    name="nidNumber"
                    value={formData.nidNumber}
                    onChange={handleChange}
                    placeholder="National ID Number"
                    disabled={!isSuperAdmin && !gmailVerified}
                  />

                  <Input
                    label={t("user.dateOfBirth")}
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    disabled={!isSuperAdmin && !gmailVerified}
                  />

                  <Input
                    label={t("user.bloodGroup")}
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    placeholder="e.g., A+, O+, B-, AB+"
                    disabled={!isSuperAdmin && !gmailVerified}
                  />

                  <Input
                    label={t("user.presentAddress")}
                    name="presentAddress"
                    value={formData.presentAddress}
                    onChange={handleChange}
                    placeholder="Current residential address"
                    disabled={!isSuperAdmin && !gmailVerified}
                  />

                  <div className="md:col-span-2">
                    <Input
                      label={t("user.permanentAddress")}
                      name="permanentAddress"
                      value={formData.permanentAddress}
                      onChange={handleChange}
                      placeholder="Permanent address"
                      disabled={!isSuperAdmin && !gmailVerified}
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact Section */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  {t("user.emergencyContact")}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label={t("user.contactName")}
                    name="emergencyContactName"
                    value={formData.emergencyContactName}
                    onChange={handleChange}
                    placeholder="Emergency contact person"
                    disabled={!isSuperAdmin && !gmailVerified}
                  />

                  <Input
                    label={t("user.relationship")}
                    name="emergencyContactRelationship"
                    value={formData.emergencyContactRelationship}
                    onChange={handleChange}
                    placeholder="e.g., Father, Spouse, Sibling"
                    disabled={!isSuperAdmin && !gmailVerified}
                  />

                  <Input
                    label={t("user.contactPhone")}
                    type="tel"
                    name="emergencyContactPhone"
                    value={formData.emergencyContactPhone}
                    onChange={handleChange}
                    placeholder="Emergency phone number"
                    disabled={!isSuperAdmin && !gmailVerified}
                  />
                </div>
              </div>
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
                    Please verify the Gmail address above to continue filling
                    the form.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <Button
                type="submit"
                variant="primary"
                loading={isLoading}
                disabled={!isSuperAdmin && !gmailVerified}
                fullWidth
              >
                {t("user.createUser")}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.back()}
                fullWidth
              >
                {t("common.cancel")}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </PermissionGuard>
  );
}
