/**
 * Permission-Based UI Components
 * Components that conditionally render based on user permissions
 */

"use client";

import React from "react";
import { usePermission } from "@/hooks/usePermission";
import { Permission } from "@/lib/permissions";
import { useTranslation } from "react-i18next";
import {
  ShieldExclamationIcon,
  InformationCircleIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";

/**
 * Can Component
 * Conditionally renders children based on permission
 *
 * @example
 * <Can permission={Permission.CREATE_USER}>
 *   <Button>Create User</Button>
 * </Can>
 */
interface CanProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showDenied?: boolean; // Show "Access Denied" message
}

export function Can({ permission, children, fallback, showDenied }: CanProps) {
  const { can } = usePermission();
  const { t } = useTranslation();

  if (can(permission)) {
    return <>{children}</>;
  }

  if (showDenied) {
    return (
      <div className="flex items-center gap-2 p-2 bg-red-50 text-red-600 rounded-lg text-xs sm:text-sm">
        <ShieldExclamationIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
        <span>{t("common.accessDenied")}</span>
      </div>
    );
  }

  return fallback ? <>{fallback}</> : null;
}

/**
 * CanAny Component
 * Renders children if user has any of the specified permissions
 *
 * @example
 * <CanAny permissions={[Permission.CREATE_USER, Permission.EDIT_USER]}>
 *   <Button>Manage Users</Button>
 * </CanAny>
 */
interface CanAnyProps {
  permissions: Permission[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showDenied?: boolean;
}

export function CanAny({
  permissions,
  children,
  fallback,
  showDenied,
}: CanAnyProps) {
  const { canAny } = usePermission();
  const { t } = useTranslation();

  if (canAny(permissions)) {
    return <>{children}</>;
  }

  if (showDenied) {
    return (
      <div className="flex items-center gap-2 p-2 bg-red-50 text-red-600 rounded-lg text-xs sm:text-sm">
        <ShieldExclamationIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
        <span>{t("common.accessDenied")}</span>
      </div>
    );
  }

  return fallback ? <>{fallback}</> : null;
}

/**
 * CanAll Component
 * Renders children only if user has all specified permissions
 *
 * @example
 * <CanAll permissions={[Permission.VIEW_ALL_USERS, Permission.EDIT_USER]}>
 *   <Button>Full User Management</Button>
 * </CanAll>
 */
interface CanAllProps {
  permissions: Permission[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showDenied?: boolean;
}

export function CanAll({
  permissions,
  children,
  fallback,
  showDenied,
}: CanAllProps) {
  const { canAll } = usePermission();
  const { t } = useTranslation();

  if (canAll(permissions)) {
    return <>{children}</>;
  }

  if (showDenied) {
    return (
      <div className="flex items-center gap-2 p-2 bg-red-50 text-red-600 rounded-lg text-xs sm:text-sm">
        <ShieldExclamationIcon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
        <span>{t("common.accessDenied")}</span>
      </div>
    );
  }

  return fallback ? <>{fallback}</> : null;
}

/**
 * RestrictedButton Component
 * Button that shows as disabled with tooltip when user lacks permission
 *
 * @example
 * <RestrictedButton
 *   permission={Permission.CREATE_USER}
 *   onClick={handleCreate}
 * >
 *   Create User
 * </RestrictedButton>
 */
interface RestrictedButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  permission: Permission;
  children: React.ReactNode;
  showTooltip?: boolean;
}

export function RestrictedButton({
  permission,
  children,
  showTooltip = true,
  className = "",
  ...props
}: RestrictedButtonProps) {
  const { can, roleInfo } = usePermission();
  const { t } = useTranslation();
  const hasAccess = can(permission);

  return (
    <div className="relative group">
      <button
        {...props}
        disabled={!hasAccess || props.disabled}
        className={`${className} ${
          !hasAccess ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {children}
      </button>

      {!hasAccess && showTooltip && (
        <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-50 shadow-lg">
          <div className="flex items-center gap-2">
            <ShieldExclamationIcon className="w-3 h-3" />
            <span>{t("common.insufficientPermission")}</span>
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * PermissionGuard Component
 * Wrapper that shows access denied page if user lacks permission
 *
 * @example
 * <PermissionGuard permission={Permission.VIEW_ALL_USERS}>
 *   <UserManagementPage />
 * </PermissionGuard>
 */
interface PermissionGuardProps {
  permission: Permission;
  children: React.ReactNode;
  showRoleInfo?: boolean;
}

export function PermissionGuard({
  permission,
  children,
  showRoleInfo = true,
}: PermissionGuardProps) {
  const { can, role, roleInfo } = usePermission();
  const { t } = useTranslation();

  if (can(permission)) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-6 sm:p-8 text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center">
            <ShieldExclamationIcon className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          {t("common.accessDeniedTitle")}
        </h2>

        <p className="text-sm sm:text-base text-gray-600">
          {t("common.accessDeniedMessage")}
        </p>

        {showRoleInfo && roleInfo && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-left space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
              <InformationCircleIcon className="w-4 h-4 text-blue-600" />
              <span>
                {t("common.yourRole")}: {roleInfo.title}
              </span>
            </div>

            {roleInfo.limitations.length > 0 && (
              <div className="text-xs text-gray-600 space-y-1">
                <p className="font-medium">{t("common.limitations")}:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  {roleInfo.limitations.map((limitation, index) => (
                    <li key={index}>{limitation}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => window.history.back()}
          className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors tap-target"
        >
          {t("common.goBack")}
        </button>
      </div>
    </div>
  );
}

/**
 * InfoTooltip Component
 * Helpful tooltip to guide users
 *
 * @example
 * <InfoTooltip text="This feature allows you to create new users" />
 */
interface InfoTooltipProps {
  text: string;
  position?: "top" | "bottom" | "left" | "right";
}

export function InfoTooltip({ text, position = "top" }: InfoTooltipProps) {
  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 transform -translate-x-1/2 -mt-1 border-t-gray-900",
    bottom:
      "bottom-full left-1/2 transform -translate-x-1/2 -mb-1 border-b-gray-900",
    left: "left-full top-1/2 transform -translate-y-1/2 -ml-1 border-l-gray-900",
    right:
      "right-full top-1/2 transform -translate-y-1/2 -mr-1 border-r-gray-900",
  };

  return (
    <div className="relative group inline-block">
      <button
        type="button"
        className="text-blue-600 hover:text-blue-700 transition-colors"
      >
        <QuestionMarkCircleIcon className="w-4 h-4" />
      </button>

      <div
        className={`hidden group-hover:block absolute ${positionClasses[position]} px-3 py-2 bg-gray-900 text-white text-xs rounded-lg max-w-xs z-50 shadow-lg`}
      >
        {text}
        <div className={`absolute ${arrowClasses[position]}`}>
          <div className="border-4 border-transparent"></div>
        </div>
      </div>
    </div>
  );
}

/**
 * RoleBadge Component
 * Displays user's role with color coding
 *
 * @example
 * <RoleBadge role={UserRole.PRINCIPAL} />
 */
interface RoleBadgeProps {
  role?: string;
  showDescription?: boolean;
}

export function RoleBadge({ role, showDescription = false }: RoleBadgeProps) {
  const { roleInfo } = usePermission();

  if (!role || !roleInfo) return null;

  const roleColors: Record<string, string> = {
    super_admin: "bg-purple-100 text-purple-800 border-purple-200",
    principal: "bg-red-100 text-red-800 border-red-200",
    vice_principal: "bg-orange-100 text-orange-800 border-orange-200",
    general_shakha: "bg-blue-100 text-blue-800 border-blue-200",
    chief_instructor: "bg-green-100 text-green-800 border-green-200",
    instructor: "bg-teal-100 text-teal-800 border-teal-200",
    craft_instructor: "bg-cyan-100 text-cyan-800 border-cyan-200",
    assistant_instructor: "bg-indigo-100 text-indigo-800 border-indigo-200",
    office_staff: "bg-pink-100 text-pink-800 border-pink-200",
    lab_assistant: "bg-yellow-100 text-yellow-800 border-yellow-200",
    library_staff: "bg-lime-100 text-lime-800 border-lime-200",
    other_employee: "bg-gray-100 text-gray-800 border-gray-200",
  };

  const colorClass =
    roleColors[role] || "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <div className="inline-flex flex-col gap-1">
      <span
        className={`px-2 py-1 text-xs font-medium rounded-md border ${colorClass}`}
      >
        {roleInfo.title}
      </span>
      {showDescription && (
        <span className="text-xs text-gray-500">{roleInfo.description}</span>
      )}
    </div>
  );
}
