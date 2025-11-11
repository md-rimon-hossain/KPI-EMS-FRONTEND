"use client";

import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useEffect } from "react";

export default function HomePage() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  return null;
}
