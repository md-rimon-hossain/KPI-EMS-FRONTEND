"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/authSlice";
import { useLogoutMutation } from "@/store/authApi";
import {
  Bars3Icon,
  BellIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [logoutApi] = useLogoutMutation();
  const [profileDropdownOpen, setProfileDropdownOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      // Call logout API
      await logoutApi().unwrap();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout API failed:", error);
      // Still proceed with local logout even if API fails
    } finally {
      // Clear Redux state and localStorage
      dispatch(logout());
      router.push("/login");
    }
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".profile-dropdown-container")) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-30 top-0 shadow-sm safe-area-top">
      <div className="px-2 py-1.5 sm:px-3 sm:py-2 lg:px-6 lg:py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start gap-1 sm:gap-2">
            <button
              onClick={onMenuClick}
              className="tap-target p-2 sm:p-2.5 text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 active:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200 active:scale-95"
            >
              <Bars3Icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <div className="flex items-center gap-2 sm:gap-3">
              <img
                src="/images/logo.png"
                alt="KPI EMS Logo"
                className="h-8 sm:h-10 lg:h-12 w-auto object-contain"
              />
              <span className="hidden sm:inline text-sm sm:text-base lg:text-lg font-semibold text-gray-700">
                {t("app.name")}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <LanguageSwitcher />
            <button className="tap-target p-1.5 sm:p-2 text-gray-500 rounded-lg hover:bg-gray-100 active:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors relative">
              <BellIcon className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="relative profile-dropdown-container">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-1 sm:gap-2 p-1 sm:p-1.5 text-sm text-gray-700 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
              >
                <UserCircleIcon className="w-7 h-7 sm:w-8 sm:h-8 text-gray-500" />
                <div className="hidden md:block text-left">
                  <p className="font-semibold text-xs lg:text-sm truncate max-w-[120px]">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate max-w-[120px]">
                    {user?.role?.replace("_", " ")}
                  </p>
                </div>
              </button>

              {/* Dropdown Menu - Shows on Click */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50 fade-in">
                  {/* Mobile User Info */}
                  <div className="px-3 py-2 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white md:hidden">
                    <p className="font-semibold text-sm truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.role?.replace("_", " ")}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      router.push("/dashboard/profile");
                    }}
                    className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <UserCircleIcon className="w-4 h-4 text-gray-500" />
                    {t("nav.profile")}
                  </button>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      router.push("/dashboard/settings");
                    }}
                    className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {t("nav.settings")}
                  </button>

                  <div className="h-px bg-gray-200 my-1"></div>

                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      handleLogout();
                    }}
                    className="w-full px-3 py-2 sm:px-4 sm:py-2.5 text-left text-sm text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors flex items-center gap-2 font-semibold"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    {t("nav.logout")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
