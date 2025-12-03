/**
 * Role-Based Access Control (RBAC) Configuration
 * Defines what each role can access and do in the system
 */

export enum UserRole {
  SUPER_ADMIN = "super_admin",
  REGISTRAR_HEAD = "registrar_head",
  PRINCIPAL = "principal",
  VICE_PRINCIPAL = "vice_principal",
  GENERAL_HEAD = "general_head",
  GENERAL_SHAKHA = "general_shakha",
  CHIEF_INSTRUCTOR = "chief_instructor",
  INSTRUCTOR = "instructor",
  CRAFT_INSTRUCTOR = "craft_instructor",
  ASSISTANT_INSTRUCTOR = "assistant_instructor",
  OFFICE_STAFF = "office_staff",
  LAB_ASSISTANT = "lab_assistant",
  LIBRARY_STAFF = "library_staff",
  OTHER_EMPLOYEE = "other_employee",
}

export enum Permission {
  // User Management
  VIEW_ALL_USERS = "view_all_users",
  CREATE_USER = "create_user",
  EDIT_USER = "edit_user",
  DELETE_USER = "delete_user",
  MANAGE_USER_ROLES = "manage_user_roles",

  // Department Management
  VIEW_DEPARTMENTS = "view_departments",
  CREATE_DEPARTMENT = "create_department",
  EDIT_DEPARTMENT = "edit_department",
  DELETE_DEPARTMENT = "delete_department",

  // Vacation Management
  APPLY_VACATION = "apply_vacation",
  VIEW_OWN_VACATIONS = "view_own_vacations",
  VIEW_ALL_VACATIONS = "view_all_vacations",
  VIEW_DEPARTMENT_VACATIONS = "view_department_vacations",
  APPROVE_AS_CHIEF = "approve_as_chief",
  APPROVE_AS_PRINCIPAL = "approve_as_principal",
  REJECT_VACATION = "reject_vacation",
  CANCEL_VACATION = "cancel_vacation",
  DOWNLOAD_VACATION_PDF = "download_vacation_pdf",

  // Profile & Settings
  VIEW_OWN_PROFILE = "view_own_profile",
  EDIT_OWN_PROFILE = "edit_own_profile",
  VIEW_OTHERS_PROFILE = "view_others_profile",
  CHANGE_PASSWORD = "change_password",

  // Dashboard & Reports
  VIEW_DASHBOARD = "view_dashboard",
  VIEW_REPORTS = "view_reports",
  VIEW_STATISTICS = "view_statistics",

  // System Settings
  MANAGE_SYSTEM_SETTINGS = "manage_system_settings",
  VIEW_SYSTEM_LOGS = "view_system_logs",

  // Inventory Management
  VIEW_INVENTORY = "view_inventory",
  CREATE_INVENTORY = "create_inventory",
  EDIT_INVENTORY = "edit_inventory",
  DELETE_INVENTORY = "delete_inventory",

  // Lab Management
  VIEW_LABS = "view_labs",
  CREATE_LAB = "create_lab",
  EDIT_LAB = "edit_lab",
  DELETE_LAB = "delete_lab",

  // Loan Management
  VIEW_LOANS = "view_loans",
  VIEW_OWN_LOANS = "view_own_loans",
  REQUEST_LOAN = "request_loan",
  APPROVE_LOAN = "approve_loan",
  RETURN_LOAN = "return_loan",
}

/**
 * Role Permission Matrix
 * Defines which permissions each role has
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  // Super Admin - Full System Access
  [UserRole.SUPER_ADMIN]: [
    // All permissions
    Permission.VIEW_ALL_USERS,
    Permission.CREATE_USER,
    Permission.EDIT_USER,
    Permission.DELETE_USER,
    Permission.MANAGE_USER_ROLES,
    Permission.VIEW_DEPARTMENTS,
    Permission.CREATE_DEPARTMENT,
    Permission.EDIT_DEPARTMENT,
    Permission.DELETE_DEPARTMENT,
    Permission.APPLY_VACATION,
    Permission.VIEW_OWN_VACATIONS,
    Permission.VIEW_ALL_VACATIONS,
    Permission.VIEW_DEPARTMENT_VACATIONS,
    Permission.APPROVE_AS_CHIEF,
    Permission.APPROVE_AS_PRINCIPAL,
    Permission.REJECT_VACATION,
    Permission.CANCEL_VACATION,
    Permission.DOWNLOAD_VACATION_PDF,
    Permission.VIEW_OWN_PROFILE,
    Permission.EDIT_OWN_PROFILE,
    Permission.VIEW_OTHERS_PROFILE,
    Permission.CHANGE_PASSWORD,
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_REPORTS,
    Permission.VIEW_STATISTICS,
    Permission.MANAGE_SYSTEM_SETTINGS,
    Permission.VIEW_SYSTEM_LOGS,
    // Inventory & Lab & Loan Management (Full Access)
    Permission.VIEW_INVENTORY,
    Permission.CREATE_INVENTORY,
    Permission.EDIT_INVENTORY,
    Permission.DELETE_INVENTORY,
    Permission.VIEW_LABS,
    Permission.CREATE_LAB,
    Permission.EDIT_LAB,
    Permission.DELETE_LAB,
    Permission.VIEW_LOANS,
    Permission.VIEW_OWN_LOANS,
    Permission.REQUEST_LOAN,
    Permission.APPROVE_LOAN,
    Permission.RETURN_LOAN,
  ],

  // Registrar Head - Full Admin Access (Register Branch)
  [UserRole.REGISTRAR_HEAD]: [
    // All permissions (same as Super Admin)
    Permission.VIEW_ALL_USERS,
    Permission.CREATE_USER,
    Permission.EDIT_USER,
    Permission.DELETE_USER,
    Permission.MANAGE_USER_ROLES,
    Permission.VIEW_DEPARTMENTS,
    Permission.CREATE_DEPARTMENT,
    Permission.EDIT_DEPARTMENT,
    Permission.DELETE_DEPARTMENT,
    Permission.APPLY_VACATION,
    Permission.VIEW_OWN_VACATIONS,
    Permission.VIEW_ALL_VACATIONS,
    Permission.VIEW_DEPARTMENT_VACATIONS,
    Permission.APPROVE_AS_CHIEF,
    Permission.APPROVE_AS_PRINCIPAL,
    Permission.REJECT_VACATION,
    Permission.CANCEL_VACATION,
    Permission.DOWNLOAD_VACATION_PDF,
    Permission.VIEW_OWN_PROFILE,
    Permission.EDIT_OWN_PROFILE,
    Permission.VIEW_OTHERS_PROFILE,
    Permission.CHANGE_PASSWORD,
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_REPORTS,
    Permission.VIEW_STATISTICS,
    Permission.MANAGE_SYSTEM_SETTINGS,
    Permission.VIEW_SYSTEM_LOGS,
    // Inventory & Lab & Loan Management (Full Access)
    Permission.VIEW_INVENTORY,
    Permission.CREATE_INVENTORY,
    Permission.EDIT_INVENTORY,
    Permission.DELETE_INVENTORY,
    Permission.VIEW_LABS,
    Permission.CREATE_LAB,
    Permission.EDIT_LAB,
    Permission.DELETE_LAB,
    Permission.VIEW_LOANS,
    Permission.VIEW_OWN_LOANS,
    Permission.REQUEST_LOAN,
    Permission.APPROVE_LOAN,
    Permission.RETURN_LOAN,
  ],

  // Principal - Top Management
  [UserRole.PRINCIPAL]: [
    Permission.VIEW_ALL_USERS,
    Permission.CREATE_USER,
    Permission.EDIT_USER,
    Permission.VIEW_DEPARTMENTS,
    Permission.CREATE_DEPARTMENT,
    Permission.EDIT_DEPARTMENT,
    Permission.APPLY_VACATION,
    Permission.VIEW_OWN_VACATIONS,
    Permission.VIEW_ALL_VACATIONS,
    Permission.APPROVE_AS_PRINCIPAL,
    Permission.REJECT_VACATION,
    Permission.DOWNLOAD_VACATION_PDF,
    Permission.VIEW_OWN_PROFILE,
    Permission.EDIT_OWN_PROFILE,
    Permission.VIEW_OTHERS_PROFILE,
    Permission.CHANGE_PASSWORD,
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_REPORTS,
    Permission.VIEW_STATISTICS,
    // Inventory & Lab & Loan Management
    Permission.VIEW_INVENTORY,
    Permission.VIEW_LABS,
    Permission.VIEW_LOANS,
    Permission.APPROVE_LOAN,
  ],

  // Vice Principal - Senior Management
  [UserRole.VICE_PRINCIPAL]: [
    Permission.VIEW_ALL_USERS,
    Permission.VIEW_DEPARTMENTS,
    Permission.APPLY_VACATION,
    Permission.VIEW_OWN_VACATIONS,
    Permission.VIEW_ALL_VACATIONS,
    Permission.DOWNLOAD_VACATION_PDF,
    Permission.VIEW_OWN_PROFILE,
    Permission.EDIT_OWN_PROFILE,
    Permission.VIEW_OTHERS_PROFILE,
    Permission.CHANGE_PASSWORD,
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_REPORTS,
    Permission.VIEW_STATISTICS,
    // Inventory & Lab & Loan Management
    Permission.VIEW_INVENTORY,
    Permission.VIEW_LABS,
    Permission.VIEW_LOANS,
  ],

  // General Shakha - Administrative Office
  [UserRole.GENERAL_SHAKHA]: [
    Permission.VIEW_ALL_USERS,
    Permission.CREATE_USER,
    Permission.EDIT_USER,
    Permission.VIEW_DEPARTMENTS,
    Permission.APPLY_VACATION,
    Permission.VIEW_OWN_VACATIONS,
    Permission.VIEW_ALL_VACATIONS,
    Permission.DOWNLOAD_VACATION_PDF,
    Permission.VIEW_OWN_PROFILE,
    Permission.EDIT_OWN_PROFILE,
    Permission.VIEW_OTHERS_PROFILE,
    Permission.CHANGE_PASSWORD,
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_STATISTICS,
    // Inventory & Lab Management
    Permission.VIEW_INVENTORY,
    Permission.CREATE_INVENTORY,
    Permission.EDIT_INVENTORY,
    Permission.VIEW_LABS,
    Permission.VIEW_LOANS,
  ],

  // General Head - Chief Instructor Level (General Branch)
  [UserRole.GENERAL_HEAD]: [
    Permission.VIEW_ALL_USERS,
    Permission.VIEW_DEPARTMENTS,
    Permission.APPLY_VACATION,
    Permission.VIEW_OWN_VACATIONS,
    Permission.VIEW_DEPARTMENT_VACATIONS,
    Permission.APPROVE_AS_CHIEF,
    Permission.REJECT_VACATION,
    Permission.DOWNLOAD_VACATION_PDF,
    Permission.VIEW_OWN_PROFILE,
    Permission.EDIT_OWN_PROFILE,
    Permission.VIEW_OTHERS_PROFILE,
    Permission.CHANGE_PASSWORD,
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_STATISTICS,
    // Inventory & Lab & Loan Management (Department Level)
    Permission.VIEW_INVENTORY,
    Permission.CREATE_INVENTORY,
    Permission.EDIT_INVENTORY,
    Permission.VIEW_LABS,
    Permission.CREATE_LAB,
    Permission.EDIT_LAB,
    Permission.VIEW_LOANS,
    Permission.REQUEST_LOAN,
    Permission.APPROVE_LOAN,
    Permission.RETURN_LOAN,
  ],

  // Chief Instructor - Department Head
  [UserRole.CHIEF_INSTRUCTOR]: [
    Permission.VIEW_ALL_USERS,
    Permission.VIEW_DEPARTMENTS,
    Permission.APPLY_VACATION,
    Permission.VIEW_OWN_VACATIONS,
    Permission.VIEW_DEPARTMENT_VACATIONS,
    Permission.APPROVE_AS_CHIEF,
    Permission.REJECT_VACATION,
    Permission.DOWNLOAD_VACATION_PDF,
    Permission.VIEW_OWN_PROFILE,
    Permission.EDIT_OWN_PROFILE,
    Permission.VIEW_OTHERS_PROFILE,
    Permission.CHANGE_PASSWORD,
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_STATISTICS,
    // Inventory & Lab & Loan Management (Department Level)
    Permission.VIEW_INVENTORY,
    Permission.CREATE_INVENTORY,
    Permission.EDIT_INVENTORY,
    Permission.VIEW_LABS,
    Permission.CREATE_LAB,
    Permission.EDIT_LAB,
    Permission.VIEW_LOANS,
    Permission.REQUEST_LOAN,
    Permission.APPROVE_LOAN,
    Permission.RETURN_LOAN,
  ],

  // Instructor - Teaching Staff
  [UserRole.INSTRUCTOR]: [
    Permission.VIEW_DEPARTMENTS,
    Permission.APPLY_VACATION,
    Permission.VIEW_OWN_VACATIONS,
    Permission.DOWNLOAD_VACATION_PDF,
    Permission.VIEW_OWN_PROFILE,
    Permission.EDIT_OWN_PROFILE,
    Permission.CHANGE_PASSWORD,
    Permission.VIEW_DASHBOARD,
    // Loan Management
    Permission.VIEW_LABS,
    Permission.REQUEST_LOAN,
    Permission.VIEW_OWN_LOANS,
  ],

  // Craft Instructor - Specialized Teaching
  [UserRole.CRAFT_INSTRUCTOR]: [
    Permission.VIEW_DEPARTMENTS,
    Permission.APPLY_VACATION,
    Permission.VIEW_OWN_VACATIONS,
    Permission.DOWNLOAD_VACATION_PDF,
    Permission.VIEW_OWN_PROFILE,
    Permission.EDIT_OWN_PROFILE,
    Permission.CHANGE_PASSWORD,
    Permission.VIEW_DASHBOARD,
    // Inventory, Lab & Loan Management
    Permission.VIEW_INVENTORY,
    Permission.VIEW_LABS,
    Permission.VIEW_LOANS,
    Permission.REQUEST_LOAN,
    Permission.VIEW_OWN_LOANS,
  ],

  // Assistant Instructor - Junior Teaching
  [UserRole.ASSISTANT_INSTRUCTOR]: [
    Permission.VIEW_DEPARTMENTS,
    Permission.APPLY_VACATION,
    Permission.VIEW_OWN_VACATIONS,
    Permission.DOWNLOAD_VACATION_PDF,
    Permission.VIEW_OWN_PROFILE,
    Permission.EDIT_OWN_PROFILE,
    Permission.CHANGE_PASSWORD,
    Permission.VIEW_DASHBOARD,
    // Loan Management
    Permission.VIEW_LABS,
    Permission.REQUEST_LOAN,
    Permission.VIEW_OWN_LOANS,
  ],

  // Office Staff - Administrative Support
  [UserRole.OFFICE_STAFF]: [
    Permission.VIEW_DEPARTMENTS,
    Permission.APPLY_VACATION,
    Permission.VIEW_OWN_VACATIONS,
    Permission.DOWNLOAD_VACATION_PDF,
    Permission.VIEW_OWN_PROFILE,
    Permission.EDIT_OWN_PROFILE,
    Permission.CHANGE_PASSWORD,
    Permission.VIEW_DASHBOARD,
  ],

  // Lab Assistant - Technical Support
  [UserRole.LAB_ASSISTANT]: [
    Permission.VIEW_DEPARTMENTS,
    Permission.APPLY_VACATION,
    Permission.VIEW_OWN_VACATIONS,
    Permission.DOWNLOAD_VACATION_PDF,
    Permission.VIEW_OWN_PROFILE,
    Permission.EDIT_OWN_PROFILE,
    Permission.CHANGE_PASSWORD,
    Permission.VIEW_DASHBOARD,
    // Loan Management
    Permission.VIEW_LABS,
    Permission.REQUEST_LOAN,
    Permission.VIEW_OWN_LOANS,
    Permission.RETURN_LOAN,
  ],

  // Library Staff - Library Management
  [UserRole.LIBRARY_STAFF]: [
    Permission.VIEW_DEPARTMENTS,
    Permission.APPLY_VACATION,
    Permission.VIEW_OWN_VACATIONS,
    Permission.DOWNLOAD_VACATION_PDF,
    Permission.VIEW_OWN_PROFILE,
    Permission.EDIT_OWN_PROFILE,
    Permission.CHANGE_PASSWORD,
    Permission.VIEW_DASHBOARD,
  ],

  // Other Employee - General Staff
  [UserRole.OTHER_EMPLOYEE]: [
    Permission.VIEW_DEPARTMENTS,
    Permission.APPLY_VACATION,
    Permission.VIEW_OWN_VACATIONS,
    Permission.DOWNLOAD_VACATION_PDF,
    Permission.VIEW_OWN_PROFILE,
    Permission.EDIT_OWN_PROFILE,
    Permission.CHANGE_PASSWORD,
    Permission.VIEW_DASHBOARD,
  ],
};

/**
 * Role Descriptions for User Understanding
 */
export const ROLE_DESCRIPTIONS: Record<
  UserRole,
  {
    title: string;
    description: string;
    canDo: string[];
    limitations: string[];
  }
> = {
  [UserRole.SUPER_ADMIN]: {
    title: "Super Administrator",
    description: "Full system access with all permissions",
    canDo: [
      "Manage all users and roles",
      "Create and delete departments",
      "Approve/reject all vacations",
      "Access system settings and logs",
      "View all reports and statistics",
    ],
    limitations: [],
  },
  [UserRole.REGISTRAR_HEAD]: {
    title: "Registrar Head",
    description: "Full admin access for Register branch operations",
    canDo: [
      "Manage all users and roles",
      "Create and delete departments",
      "Approve/reject all vacations",
      "Access system settings",
      "View all reports and statistics",
    ],
    limitations: [],
  },
  [UserRole.PRINCIPAL]: {
    title: "Principal",
    description: "Institution head with top-level management access",
    canDo: [
      "Final approval of all vacation requests",
      "Manage users and departments",
      "View institution-wide statistics",
      "Access all reports",
    ],
    limitations: ["Cannot access system settings", "Cannot delete users"],
  },
  [UserRole.VICE_PRINCIPAL]: {
    title: "Vice Principal",
    description: "Senior management with oversight capabilities",
    canDo: [
      "View all users and departments",
      "Monitor vacation requests",
      "Access reports and statistics",
    ],
    limitations: [
      "Cannot approve/reject vacations",
      "Cannot manage users",
      "Cannot modify departments",
    ],
  },
  [UserRole.GENERAL_HEAD]: {
    title: "General Head",
    description: "Chief instructor level access for General branch",
    canDo: [
      "First-level approval of department vacations",
      "Manage inventory and labs",
      "View department staff information",
      "Monitor department statistics",
    ],
    limitations: [
      "Can only approve within own department",
      "Cannot manage users",
      "Cannot modify departments",
    ],
  },
  [UserRole.GENERAL_SHAKHA]: {
    title: "General Office",
    description: "Administrative office with user management",
    canDo: [
      "Create and edit users",
      "View all vacation requests",
      "Manage department information",
    ],
    limitations: [
      "Cannot approve/reject vacations",
      "Cannot delete users",
      "Cannot access system settings",
    ],
  },
  [UserRole.CHIEF_INSTRUCTOR]: {
    title: "Chief Instructor",
    description: "Department head with approval authority",
    canDo: [
      "First-level approval of department vacations",
      "View department staff information",
      "Monitor department statistics",
    ],
    limitations: [
      "Can only approve within own department",
      "Cannot manage users",
      "Cannot modify departments",
    ],
  },
  [UserRole.INSTRUCTOR]: {
    title: "Instructor",
    description: "Teaching staff member",
    canDo: [
      "Apply for vacation",
      "View own vacation history",
      "Update own profile",
    ],
    limitations: [
      "Cannot approve vacations",
      "Cannot view other users",
      "Cannot access admin features",
    ],
  },
  [UserRole.CRAFT_INSTRUCTOR]: {
    title: "Craft Instructor",
    description: "Specialized teaching staff",
    canDo: [
      "Apply for vacation",
      "View own vacation history",
      "Update own profile",
    ],
    limitations: [
      "Cannot approve vacations",
      "Cannot view other users",
      "Cannot access admin features",
    ],
  },
  [UserRole.ASSISTANT_INSTRUCTOR]: {
    title: "Assistant Instructor",
    description: "Junior teaching staff",
    canDo: [
      "Apply for vacation",
      "View own vacation history",
      "Update own profile",
    ],
    limitations: [
      "Cannot approve vacations",
      "Cannot view other users",
      "Cannot access admin features",
    ],
  },
  [UserRole.OFFICE_STAFF]: {
    title: "Office Staff",
    description: "Administrative support staff",
    canDo: [
      "Apply for vacation",
      "View own vacation history",
      "Update own profile",
    ],
    limitations: [
      "Cannot approve vacations",
      "Cannot view other users",
      "Cannot access admin features",
    ],
  },
  [UserRole.LAB_ASSISTANT]: {
    title: "Lab Assistant",
    description: "Technical support staff",
    canDo: [
      "Apply for vacation",
      "View own vacation history",
      "Update own profile",
    ],
    limitations: [
      "Cannot approve vacations",
      "Cannot view other users",
      "Cannot access admin features",
    ],
  },
  [UserRole.LIBRARY_STAFF]: {
    title: "Library Staff",
    description: "Library management staff",
    canDo: [
      "Apply for vacation",
      "View own vacation history",
      "Update own profile",
    ],
    limitations: [
      "Cannot approve vacations",
      "Cannot view other users",
      "Cannot access admin features",
    ],
  },
  [UserRole.OTHER_EMPLOYEE]: {
    title: "Other Employee",
    description: "General staff member",
    canDo: [
      "Apply for vacation",
      "View own vacation history",
      "Update own profile",
    ],
    limitations: [
      "Cannot approve vacations",
      "Cannot view other users",
      "Cannot access admin features",
    ],
  },
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(
  role: UserRole,
  permissions: Permission[]
): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(
  role: UserRole,
  permissions: Permission[]
): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Get role description
 */
export function getRoleDescription(role: UserRole) {
  return ROLE_DESCRIPTIONS[role];
}

/**
 * Check if user can access a route
 */
export function canAccessRoute(role: UserRole, route: string): boolean {
  const routePermissions: Record<string, Permission[]> = {
    "/dashboard": [Permission.VIEW_DASHBOARD],
    "/dashboard/users": [Permission.VIEW_ALL_USERS],
    "/dashboard/users/create": [Permission.CREATE_USER],
    "/dashboard/departments": [Permission.VIEW_DEPARTMENTS],
    "/dashboard/departments/create": [Permission.CREATE_DEPARTMENT],
    "/dashboard/vacations": [Permission.VIEW_OWN_VACATIONS],
    "/dashboard/vacations/apply": [Permission.APPLY_VACATION],
    "/dashboard/vacations/pending-chief": [Permission.APPROVE_AS_CHIEF],
    "/dashboard/vacations/pending-principal": [Permission.APPROVE_AS_PRINCIPAL],
    "/dashboard/profile": [Permission.VIEW_OWN_PROFILE],
    "/dashboard/settings": [Permission.CHANGE_PASSWORD],
  };

  const requiredPermissions = routePermissions[route];
  if (!requiredPermissions) return true; // Public route

  return hasAnyPermission(role, requiredPermissions);
}
