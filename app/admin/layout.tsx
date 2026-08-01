"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

function ProtectedAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || !isAdmin) && !pathname.includes("/admin/login")) {
      router.push("/admin/login/");
    }
  }, [user, isAdmin, loading, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold text-gray-500 animate-pulse">
          Loading Admin...
        </div>
      </div>
    );
  }

  if ((!user || !isAdmin) && !pathname.includes("/admin/login")) {
    return null;
  }

  return <>{children}</>;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedAdmin>{children}</ProtectedAdmin>
  );
}
