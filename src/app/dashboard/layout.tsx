"use client";

import { useState, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import MobileBottomNav from "@/components/MobileBottomNav";
import EmailVerificationBanner from "@/components/EmailVerificationBanner";
import Chatbot from "@/components/Chatbot";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  // Show nothing while checking authentication
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content with Mobile Bottom Nav Padding */}
      <div className="lg:pl-60 pt-20 sm:pt-20">
        <main className="mobile-container p-compact min-h-[calc(100vh-3rem)] sm:min-h-[calc(100vh-3.5rem)] pb-20 lg:pb-4">
          <EmailVerificationBanner />
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* AI Chatbot */}
      <Chatbot />
    </div>
  );
}
