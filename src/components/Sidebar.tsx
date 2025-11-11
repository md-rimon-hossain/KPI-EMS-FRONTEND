"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import {
  HomeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  CalendarDaysIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAppSelector((state) => state.auth);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: HomeIcon, roles: ["all"] },
    {
      name: "Users",
      href: "/dashboard/users",
      icon: UsersIcon,
      roles: ["super_admin", "principal", "general_shakha"],
    },
    {
      name: "Departments",
      href: "/dashboard/departments",
      icon: BuildingOfficeIcon,
      roles: ["super_admin", "principal", "general_shakha"],
    },
    {
      name: "My Vacations",
      href: "/dashboard/vacations",
      icon: CalendarDaysIcon,
      roles: ["all"],
    },
    {
      name: "Vacation Approvals",
      href: "/dashboard/vacations/pending-chief",
      icon: CalendarDaysIcon,
      roles: ["chief_instructor"],
    },
    {
      name: "Final Approvals",
      href: "/dashboard/vacations/pending-principal",
      icon: CalendarDaysIcon,
      roles: ["principal"],
    },
    {
      name: "Profile",
      href: "/dashboard/profile",
      icon: UserCircleIcon,
      roles: ["all"],
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Cog6ToothIcon,
      roles: ["all"],
    },
  ];

  const canAccessRoute = (roles: string[]) => {
    if (roles.includes("all")) return true;
    return user?.role && roles.includes(user.role);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform bg-white border-r border-gray-200",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 rounded-lg lg:hidden hover:bg-gray-100"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <div className="h-full px-3 pb-4 overflow-y-auto">
          <ul className="space-y-2 font-medium">
            {navigation.map((item) => {
              if (!canAccessRoute(item.roles)) return null;

              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={clsx(
                      "flex items-center p-2 rounded-lg transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-900 hover:bg-gray-100"
                    )}
                  >
                    <Icon
                      className={clsx(
                        "w-5 h-5",
                        isActive ? "text-blue-700" : "text-gray-500"
                      )}
                    />
                    <span className="ml-3">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* User Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <UserCircleIcon className="w-10 h-10 text-gray-400" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.role?.replace(/_/g, " ")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
