"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useGetUserByIdQuery, useUpdateUserMutation } from "@/store/userApi";
import { useGetAllDepartmentsQuery } from "@/store/departmentApi";
import { Permission } from "@/lib/permissions";
import { usePermission } from "@/hooks/usePermission";
import {
  PermissionGuard,
  InfoTooltip,
} from "@/components/PermissionComponents";
import Card from "@/components/Card";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";
import {
  BriefcaseIcon,
  UserIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export default function EditUserPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { can } = usePermission();

  const canEdit = can(Permission.EDIT_USER);
  const canView = can(Permission.VIEW_OTHERS_PROFILE) || canEdit;

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
    jobTitle: "",
    position: "",
    departmentWorkArea: "",
    employmentStatus: "",
    startDate: "",
    jobDescription: "",
    vacationBalance: "",
    presentAddress: "",
    permanentAddress: "",
    nidNumber: "",
    dateOfBirth: "",
    bloodGroup: "",
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactPhone: "",
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
        jobTitle: user.jobTitle || "",
        position: user.position || "",
        departmentWorkArea: user.departmentWorkArea || "",
        employmentStatus: user.employmentStatus || "",
        startDate: user.startDate
          ? new Date(user.startDate).toISOString().split("T")[0]
          : "",
        jobDescription: user.jobDescription || "",
        vacationBalance: user.vacationBalance?.toString() || "",
        presentAddress: user.presentAddress || "",
        permanentAddress: user.permanentAddress || "",
        nidNumber: user.nidNumber || "",
        dateOfBirth: user.dateOfBirth
          ? new Date(user.dateOfBirth).toISOString().split("T")[0]
          : "",
        bloodGroup: user.bloodGroup || "",
        emergencyContactName: user.emergencyContact?.name || "",
        emergencyContactRelationship: user.emergencyContact?.relationship || "",
        emergencyContactPhone: user.emergencyContact?.phone || "",
      });
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
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

      if (formData.department) payload.department = formData.department;
      if (formData.phone.trim()) payload.phone = formData.phone.trim();
      if (formData.jobTitle.trim()) payload.jobTitle = formData.jobTitle.trim();
      if (formData.position.trim()) payload.position = formData.position.trim();
      if (formData.departmentWorkArea.trim())
        payload.departmentWorkArea = formData.departmentWorkArea.trim();
      if (formData.employmentStatus)
        payload.employmentStatus = formData.employmentStatus;
      if (formData.startDate) payload.startDate = formData.startDate;
      if (formData.jobDescription.trim())
        payload.jobDescription = formData.jobDescription.trim();
      if (formData.vacationBalance)
        payload.vacationBalance = parseInt(formData.vacationBalance);
      if (formData.presentAddress.trim())
        payload.presentAddress = formData.presentAddress.trim();
      if (formData.permanentAddress.trim())
        payload.permanentAddress = formData.permanentAddress.trim();
      if (formData.nidNumber.trim())
        payload.nidNumber = formData.nidNumber.trim();
      if (formData.dateOfBirth) payload.dateOfBirth = formData.dateOfBirth;
      if (formData.bloodGroup.trim())
        payload.bloodGroup = formData.bloodGroup.trim();

      if (
        formData.emergencyContactName.trim() ||
        formData.emergencyContactRelationship.trim() ||
        formData.emergencyContactPhone.trim()
      ) {
        payload.emergencyContact = {
          name: formData.emergencyContactName.trim(),
          relationship: formData.emergencyContactRelationship.trim(),
          phone: formData.emergencyContactPhone.trim(),
        };
      }

      await updateUser({ id, data: payload }).unwrap();
      toast.success(t("common.updateSuccess"));
      router.push("/dashboard/users");
    } catch (error: any) {
      toast.error(error?.data?.message || t("common.updateError"));
    }
  };

  if (isLoadingUser) {
    return <Loading fullScreen text={t("common.loading")} />;
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">{t("user.notFound")}</p>
        <Button
          variant="primary"
          onClick={() => router.push("/dashboard/users")}
          className="mt-4"
        >
          {t("common.back")}
        </Button>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">{t("common.noPermission")}</p>
        <Button
          variant="primary"
          onClick={() => router.push("/dashboard/users")}
          className="mt-4"
        >
          {t("common.back")}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-start gap-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {canEdit ? t("user.editTitle") : t("user.viewTitle")}
          </h1>
          <p className="text-gray-600 mt-1">
            {canEdit ? t("user.editSubtitle") : t("user.viewSubtitle")}
          </p>
        </div>
        <InfoTooltip
          text={
            canEdit
              ? t("user.editUserTooltip") ||
                "Update employee information, role, and department"
              : t("user.viewUserTooltip") ||
                "View detailed employee information"
          }
        />
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image Section */}
          <div className="flex justify-center pb-6 border-b">
            <div className="relative">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-100 shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-blue-100 shadow-lg">
                  <span className="text-4xl font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t("user.basicInfo")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t("user.name")}
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                placeholder={t("user.namePlaceholder")}
                required={canEdit}
                disabled={!canEdit}
              />

              <Input
                label={t("user.email")}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder={t("user.emailPlaceholder")}
                required={canEdit}
                disabled={!canEdit}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("user.role")}{" "}
                {canEdit && <span className="text-red-500">*</span>}
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                required={canEdit}
                disabled={!canEdit}
              >
                <option value="instructor">{t("roles.instructor")}</option>
                <option value="chief_instructor">
                  {t("roles.chief_instructor")}
                </option>
                <option value="principal">{t("roles.principal")}</option>
                <option value="vice_principal">
                  {t("roles.vice_principal")}
                </option>
                <option value="craft_instructor">
                  {t("roles.craft_instructor")}
                </option>
                <option value="assistant_instructor">
                  {t("roles.assistant_instructor")}
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
                <option value="general_head">{t("roles.general_head")}</option>
                <option value="vice_principal">
                  {t("roles.vice_principal")}
                </option>
                <option value="principal">{t("roles.principal")}</option>
                <option value="registrar_head">
                  {t("roles.registrar_head")}
                </option>
                <option value="super_admin">{t("roles.super_admin")}</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role}</p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t("user.contactInfo")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t("user.phone")}
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                placeholder="+880 1XXX-XXXXXX"
                disabled={!canEdit}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("user.department")}
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={!canEdit}
                >
                  <option value="">{t("common.select")}</option>
                  {departments?.map((dept: any) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Employment & Job Details */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center gap-2">
              <BriefcaseIcon className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                {t("user.employmentDetails")}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t("user.jobTitle")}
                type="text"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleChange}
                placeholder={t("user.jobTitlePlaceholder")}
                disabled={!canEdit}
              />

              <Input
                label={t("user.position")}
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder={t("user.positionPlaceholder")}
                disabled={!canEdit}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("user.employmentStatus")}
                </label>
                <select
                  name="employmentStatus"
                  value={formData.employmentStatus}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  disabled={!canEdit}
                >
                  <option value="">{t("common.select")}</option>
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
                  <option value="permanent">
                    {t("employmentStatus.permanent")}
                  </option>
                </select>
              </div>

              <Input
                label={t("user.startDate")}
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                disabled={!canEdit}
              />

              <Input
                label={t("user.departmentWorkArea")}
                type="text"
                name="departmentWorkArea"
                value={formData.departmentWorkArea}
                onChange={handleChange}
                placeholder={t("user.departmentWorkAreaPlaceholder")}
                disabled={!canEdit}
              />

              <Input
                label={t("user.vacationBalance")}
                type="number"
                name="vacationBalance"
                value={formData.vacationBalance}
                onChange={handleChange}
                placeholder="20"
                disabled={!canEdit}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("user.jobDescription")}
              </label>
              <textarea
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder={t("user.jobDescriptionPlaceholder")}
                disabled={!canEdit}
              />
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                {t("user.personalInfo")}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label={t("user.nidNumber")}
                type="text"
                name="nidNumber"
                value={formData.nidNumber}
                onChange={handleChange}
                placeholder={t("user.nidNumberPlaceholder")}
                disabled={!canEdit}
              />

              <Input
                label={t("user.dateOfBirth")}
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                disabled={!canEdit}
              />

              <Input
                label={t("user.bloodGroup")}
                type="text"
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                placeholder="A+, B+, O+, AB+"
                disabled={!canEdit}
              />
            </div>

            <Input
              label={t("user.presentAddress")}
              type="text"
              name="presentAddress"
              value={formData.presentAddress}
              onChange={handleChange}
              placeholder={t("user.presentAddressPlaceholder")}
              disabled={!canEdit}
            />

            <Input
              label={t("user.permanentAddress")}
              type="text"
              name="permanentAddress"
              value={formData.permanentAddress}
              onChange={handleChange}
              placeholder={t("user.permanentAddressPlaceholder")}
              disabled={!canEdit}
            />
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center gap-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                {t("user.emergencyContact")}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label={t("user.emergencyContactName")}
                type="text"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleChange}
                placeholder={t("user.emergencyContactNamePlaceholder")}
                disabled={!canEdit}
              />

              <Input
                label={t("user.emergencyContactRelationship")}
                type="text"
                name="emergencyContactRelationship"
                value={formData.emergencyContactRelationship}
                onChange={handleChange}
                placeholder={t("user.emergencyContactRelationshipPlaceholder")}
                disabled={!canEdit}
              />

              <Input
                label={t("user.emergencyContactPhone")}
                type="tel"
                name="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={handleChange}
                placeholder="+880 1XXX-XXXXXX"
                disabled={!canEdit}
              />
            </div>
          </div>

          {/* Account Status */}
          <div className="border-t pt-6">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!canEdit}
              />
              <div>
                <label
                  htmlFor="isActive"
                  className="text-sm font-medium text-gray-700"
                >
                  {t("user.activeUser")}
                </label>
                <p className="text-sm text-gray-500">
                  {t("user.activeUserNote")}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>{t("common.note")}:</strong>{" "}
              {t("user.passwordChangeNote")}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {canEdit && (
              <Button
                type="submit"
                variant="primary"
                loading={isLoading}
                fullWidth
              >
                {t("common.update")}
              </Button>
            )}
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push("/dashboard/users")}
              fullWidth
            >
              {canEdit ? t("common.cancel") : t("common.back")}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
