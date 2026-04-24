"use client";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

function ProtectedAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold text-gray-500 animate-pulse">
          Loading Admin...
        </div>
      </div>
    );
  }

  if (!user && pathname !== "/admin/login") {
    return null;
  }

  return <>{children}</>;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProtectedAdmin>{children}</ProtectedAdmin>
    </AuthProvider>
  );
}
