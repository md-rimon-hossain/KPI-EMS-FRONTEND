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

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [logoutApi] = useLogoutMutation();

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

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-30 top-0">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start">
            <button
              onClick={onMenuClick}
              className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <div className="flex ml-2 md:mr-24">
              <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap text-blue-600">
                Polytechnic EMS
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200">
              <BellIcon className="w-6 h-6" />
            </button>
            <div className="relative group">
              <button className="flex items-center gap-2 p-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100">
                <UserCircleIcon className="w-8 h-8 text-gray-500" />
                <div className="hidden md:block text-left">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500">
                    {user?.role?.replace("_", " ")}
                  </p>
                </div>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block">
                <button
                  onClick={() => router.push("/dashboard/profile")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                >
                  Profile
                </button>
                <button
                  onClick={() => router.push("/dashboard/settings")}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Settings
                </button>
                <hr className="my-1" />
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-b-lg"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
