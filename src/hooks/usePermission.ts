/**
 * Permission Hooks
 * Custom hooks for checking user permissions in components
 */

import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import {
  Permission,
  UserRole,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAccessRoute,
  getRolePermissions,
  getRoleDescription,
} from "@/lib/permissions";

/**
 * Main permission hook
 * Usage: const { can, canAny, canAll, canRoute } = usePermission();
 */
export function usePermission() {
  const user = useSelector((state: RootState) => state.auth.user);
  const userRole = user?.role as UserRole;

  return {
    /**
     * Check if user has a specific permission
     * @example can(Permission.CREATE_USER)
     */
    can: (permission: Permission): boolean => {
      if (!userRole) return false;
      return hasPermission(userRole, permission);
    },

    /**
     * Check if user has any of the specified permissions
     * @example canAny([Permission.CREATE_USER, Permission.EDIT_USER])
     */
    canAny: (permissions: Permission[]): boolean => {
      if (!userRole) return false;
      return hasAnyPermission(userRole, permissions);
    },

    /**
     * Check if user has all of the specified permissions
     * @example canAll([Permission.VIEW_ALL_USERS, Permission.CREATE_USER])
     */
    canAll: (permissions: Permission[]): boolean => {
      if (!userRole) return false;
      return hasAllPermissions(userRole, permissions);
    },

    /**
     * Check if user can access a route
     * @example canRoute('/dashboard/users')
     */
    canRoute: (route: string): boolean => {
      if (!userRole) return false;
      return canAccessRoute(userRole, route);
    },

    /**
     * Get all permissions for current user
     */
    permissions: userRole ? getRolePermissions(userRole) : [],

    /**
     * Get current user role
     */
    role: userRole,

    /**
     * Get role description
     */
    roleInfo: userRole ? getRoleDescription(userRole) : null,

    /**
     * Check if user is admin (super_admin, principal, vice_principal)
     */
    isAdmin:
      userRole &&
      [
        UserRole.SUPER_ADMIN,
        UserRole.PRINCIPAL,
        UserRole.VICE_PRINCIPAL,
      ].includes(userRole),

    /**
     * Check if user is management (includes general_shakha, chief_instructor)
     */
    isManagement:
      userRole &&
      [
        UserRole.SUPER_ADMIN,
        UserRole.PRINCIPAL,
        UserRole.VICE_PRINCIPAL,
        UserRole.GENERAL_SHAKHA,
        UserRole.CHIEF_INSTRUCTOR,
      ].includes(userRole),

    /**
     * Check if user is staff (teaching or support)
     */
    isStaff:
      userRole &&
      [
        UserRole.INSTRUCTOR,
        UserRole.CRAFT_INSTRUCTOR,
        UserRole.ASSISTANT_INSTRUCTOR,
        UserRole.OFFICE_STAFF,
        UserRole.LAB_ASSISTANT,
        UserRole.LIBRARY_STAFF,
        UserRole.OTHER_EMPLOYEE,
      ].includes(userRole),
  };
}

/**
 * Simple permission check hook
 * Usage: const canCreate = useCan(Permission.CREATE_USER);
 */
export function useCan(permission: Permission): boolean {
  const { can } = usePermission();
  return can(permission);
}

/**
 * Check any permission hook
 * Usage: const canManage = useCanAny([Permission.CREATE_USER, Permission.EDIT_USER]);
 */
export function useCanAny(permissions: Permission[]): boolean {
  const { canAny } = usePermission();
  return canAny(permissions);
}

/**
 * Check all permissions hook
 * Usage: const canFullManage = useCanAll([Permission.CREATE_USER, Permission.DELETE_USER]);
 */
export function useCanAll(permissions: Permission[]): boolean {
  const { canAll } = usePermission();
  return canAll(permissions);
}

/**
 * Route access check hook
 * Usage: const canAccessUsers = useCanRoute('/dashboard/users');
 */
export function useCanRoute(route: string): boolean {
  const { canRoute } = usePermission();
  return canRoute(route);
}
