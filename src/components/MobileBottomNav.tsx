"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { usePermission } from "@/hooks/usePermission";
import { Permission } from "@/lib/permissions";
import {
  HomeIcon,
  CalendarDaysIcon,
  UsersIcon,
  BuildingOfficeIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import {
  HomeIcon as HomeIconSolid,
  CalendarDaysIcon as CalendarIconSolid,
  UsersIcon as UsersIconSolid,
  BuildingOfficeIcon as BuildingIconSolid,
  UserCircleIcon as UserIconSolid,
} from "@heroicons/react/24/solid";

export default function MobileBottomNav() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { can } = usePermission();

  const navItems = [
    {
      name: t("nav.dashboard"),
      href: "/dashboard",
      icon: HomeIcon,
      iconSolid: HomeIconSolid,
      permission: Permission.VIEW_DASHBOARD,
    },
    {
      name: t("nav.vacations"),
      href: "/dashboard/vacations",
      icon: CalendarDaysIcon,
      iconSolid: CalendarIconSolid,
      permission: Permission.VIEW_OWN_VACATIONS,
    },
    {
      name: t("nav.users"),
      href: "/dashboard/users",
      icon: UsersIcon,
      iconSolid: UsersIconSolid,
      permission: Permission.VIEW_ALL_USERS,
    },
    {
      name: t("nav.departments"),
      href: "/dashboard/departments",
      icon: BuildingOfficeIcon,
      iconSolid: BuildingIconSolid,
      permission: Permission.VIEW_DEPARTMENTS,
    },
    {
      name: t("nav.profile"),
      href: "/dashboard/profile",
      icon: UserCircleIcon,
      iconSolid: UserIconSolid,
      permission: Permission.VIEW_OWN_PROFILE,
    },
  ].filter((item) => can(item.permission));

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Spacer to prevent content from being hidden behind bottom nav */}
      <div className="h-16 lg:hidden" />

      {/* Bottom Navigation - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg lg:hidden safe-area-inset-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = active ? item.iconSolid : item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center flex-1 h-full gap-0.5
                  transition-all duration-200 active:scale-95 tap-target
                  ${active ? "text-blue-600" : "text-gray-600"}
                `}
              >
                <div
                  className={`
                    p-1.5 rounded-xl transition-all duration-200
                    ${
                      active
                        ? "bg-blue-50 scale-110"
                        : "hover:bg-gray-50 active:bg-gray-100"
                    }
                  `}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span
                  className={`
                    text-[10px] font-semibold truncate max-w-[60px]
                    ${active ? "text-blue-600" : "text-gray-600"}
                  `}
                >
                  {item.name}
                </span>
                {active && (
                  <div className="absolute bottom-0 w-12 h-1 bg-blue-600 rounded-t-full animate-[slideIn_0.2s_ease-out]" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
