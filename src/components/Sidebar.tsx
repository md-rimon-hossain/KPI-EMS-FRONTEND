"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { usePermission } from "@/hooks/usePermission";
import { Permission } from "@/lib/permissions";
import { RoleBadge } from "@/components/PermissionComponents";
import { useTranslation } from "react-i18next";
import {
  HomeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  XMarkIcon,
  DocumentCheckIcon,
  FolderIcon,
  CubeIcon,
  BeakerIcon,
  ArrowsRightLeftIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.auth);
  const { can, role } = usePermission();
  const { t } = useTranslation();

  // Build navigation based on user role
  const getNavigationByRole = () => {
    const baseNavigation = [
      {
        name: t("nav.dashboard"),
        href: "/dashboard",
        icon: HomeIcon,
        permission: Permission.VIEW_DASHBOARD,
      },
    ];

    // Super Admin Navigation
    if (role === "super_admin") {
      return [
        ...baseNavigation,
        {
          name: t("nav.users"),
          href: "/dashboard/users",
          icon: UsersIcon,
          permission: Permission.VIEW_ALL_USERS,
        },
        {
          name: t("nav.departments"),
          href: "/dashboard/departments",
          icon: BuildingOfficeIcon,
          permission: Permission.VIEW_DEPARTMENTS,
        },
        {
          name: t("nav.allVacations"),
          href: "/dashboard/vacations/all",
          icon: CalendarDaysIcon,
          permission: Permission.VIEW_ALL_VACATIONS,
        },
        {
          name: t("nav.inventory"),
          href: "/dashboard/inventory",
          icon: CubeIcon,
          permission: Permission.VIEW_INVENTORY,
        },
        {
          name: t("nav.labs"),
          href: "/dashboard/labs",
          icon: BeakerIcon,
          permission: Permission.VIEW_LABS,
        },
        {
          name: t("nav.loans"),
          href: "/dashboard/loans",
          icon: ArrowsRightLeftIcon,
          permission: Permission.VIEW_LOANS,
        },
        {
          name: t("nav.profile"),
          href: "/dashboard/profile",
          icon: UserCircleIcon,
          permission: Permission.VIEW_OWN_PROFILE,
        },
        {
          name: t("nav.settings"),
          href: "/dashboard/settings",
          icon: Cog6ToothIcon,
          permission: Permission.CHANGE_PASSWORD,
        },
      ];
    }

    // Principal Navigation
    if (role === "principal") {
      return [
        ...baseNavigation,
        {
          name: t("nav.users"),
          href: "/dashboard/users",
          icon: UsersIcon,
          permission: Permission.VIEW_ALL_USERS,
        },
        {
          name: t("nav.departments"),
          href: "/dashboard/departments",
          icon: BuildingOfficeIcon,
          permission: Permission.VIEW_DEPARTMENTS,
        },
        {
          name: t("nav.myVacations"),
          href: "/dashboard/vacations/my-vacations",
          icon: CalendarDaysIcon,
          permission: Permission.VIEW_OWN_VACATIONS,
        },
        {
          name: t("nav.allVacations"),
          href: "/dashboard/vacations/all",
          icon: DocumentCheckIcon,
          permission: Permission.VIEW_ALL_VACATIONS,
        },
        {
          name: t("nav.finalApprovals"),
          href: "/dashboard/vacations/pending-principal",
          icon: CalendarDaysIcon,
          permission: Permission.APPROVE_AS_PRINCIPAL,
        },
        {
          name: t("nav.inventory"),
          href: "/dashboard/inventory",
          icon: CubeIcon,
          permission: Permission.VIEW_INVENTORY,
        },
        {
          name: t("nav.labs"),
          href: "/dashboard/labs",
          icon: BeakerIcon,
          permission: Permission.VIEW_LABS,
        },
        {
          name: t("nav.loans"),
          href: "/dashboard/loans",
          icon: ArrowsRightLeftIcon,
          permission: Permission.VIEW_LOANS,
        },
        {
          name: t("nav.profile"),
          href: "/dashboard/profile",
          icon: UserCircleIcon,
          permission: Permission.VIEW_OWN_PROFILE,
        },
        {
          name: t("nav.settings"),
          href: "/dashboard/settings",
          icon: Cog6ToothIcon,
          permission: Permission.CHANGE_PASSWORD,
        },
      ];
    }

    // Chief Instructor Navigation
    if (role === "chief_instructor") {
      return [
        ...baseNavigation,
        {
          name: t("nav.users"),
          href: "/dashboard/users",
          icon: UsersIcon,
          permission: Permission.VIEW_ALL_USERS,
        },
        {
          name: t("nav.myVacations"),
          href: "/dashboard/vacations/my-vacations",
          icon: CalendarDaysIcon,
          permission: Permission.VIEW_OWN_VACATIONS,
        },
        {
          name: t("nav.departmentVacations"),
          href: "/dashboard/vacations/department",
          icon: FolderIcon,
          permission: Permission.VIEW_DEPARTMENT_VACATIONS,
        },
        {
          name: t("nav.pendingReviews"),
          href: "/dashboard/vacations/pending-chief",
          icon: CalendarDaysIcon,
          permission: Permission.APPROVE_AS_CHIEF,
        },
        {
          name: t("nav.inventory"),
          href: "/dashboard/inventory",
          icon: CubeIcon,
          permission: Permission.VIEW_INVENTORY,
        },
        {
          name: t("nav.labs"),
          href: "/dashboard/labs",
          icon: BeakerIcon,
          permission: Permission.VIEW_LABS,
        },
        {
          name: t("nav.loans"),
          href: "/dashboard/loans",
          icon: ArrowsRightLeftIcon,
          permission: Permission.VIEW_LOANS,
        },
        {
          name: t("nav.profile"),
          href: "/dashboard/profile",
          icon: UserCircleIcon,
          permission: Permission.VIEW_OWN_PROFILE,
        },
        {
          name: t("nav.settings"),
          href: "/dashboard/settings",
          icon: Cog6ToothIcon,
          permission: Permission.CHANGE_PASSWORD,
        },
      ];
    }

    // All other roles (instructor, junior_instructor, office_staff, etc.)
    return [
      ...baseNavigation,
      {
        name: t("nav.myVacations"),
        href: "/dashboard/vacations/my-vacations",
        icon: CalendarDaysIcon,
        permission: Permission.VIEW_OWN_VACATIONS,
      },
      {
        name: t("nav.myActiveLoans"),
        href: "/dashboard/loans/my-active",
        icon: ArrowsRightLeftIcon,
        permission: Permission.VIEW_OWN_LOANS,
      },
      {
        name: t("nav.profile"),
        href: "/dashboard/profile",
        icon: UserCircleIcon,
        permission: Permission.VIEW_OWN_PROFILE,
      },
      {
        name: t("nav.settings"),
        href: "/dashboard/settings",
        icon: Cog6ToothIcon,
        permission: Permission.CHANGE_PASSWORD,
      },
    ];
  };

  const navigation = getNavigationByRole();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed top-0 left-0 z-50 w-60 sm:w-64 h-screen pt-14 sm:pt-16 transition-transform duration-300 bg-white border-r border-gray-200 shadow-xl lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 tap-target p-1.5 text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 active:bg-gray-200 transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        <div className="h-full px-2 sm:px-3 pb-4 overflow-y-auto scrollbar-thin">
          {/* Role Badge at Top */}
          <div className="mb-3 p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <RoleBadge role={user?.role} />
          </div>

          <ul className="space-y-1">
            {navigation.map((item) => {
              // Check if user has permission to access this menu item
              if (!can(item.permission)) return null;

              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={clsx(
                      "flex items-center gap-2 sm:gap-3 px-2.5 py-2 sm:py-2.5 rounded-lg transition-all duration-200 text-sm sm:text-base font-medium",
                      isActive
                        ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 shadow-sm border-l-4 border-blue-600"
                        : "text-gray-700 hover:bg-gray-50 active:bg-gray-100"
                    )}
                  >
                    <Icon
                      className={clsx(
                        "w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0",
                        isActive ? "text-blue-600" : "text-gray-500"
                      )}
                    />
                    <span className="truncate">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* User Info - Compact Mobile Design */}
          <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 border-t border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="flex items-center gap-2">
              <div className="relative">
                <UserCircleIcon className="w-9 h-9 sm:w-10 sm:h-10 text-gray-400" />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.role ? t(`roles.${user.role}`) : ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
