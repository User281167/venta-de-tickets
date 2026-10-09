"use client";

import { Flex, Text } from "@chakra-ui/react";
import { AdminSidebar } from "@/shared/components/AdminSidebar";
import { AccessDenied } from "@/shared/components/AccessDenied";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

function AdminLayoutInner({ children }: { children: ReactNode }) {
  const { role, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !role) {
      router.replace("/");
    }
  }, [role, isLoading, router]);

  if (isLoading) {
    return (
      <Flex flex={1} p={8} justify="center">
        <Text>Cargando...</Text>
      </Flex>
    );
  }

  if (!role) {
    return null;
  }

  const ADMIN_ROLES = new Set(["super_admin", "admin"]);
  if (!ADMIN_ROLES.has(role)) {
    router.replace("/");
    return null;
  }

  if (pathname.startsWith("/admin/") && pathname !== "/admin/donaciones") {
    return (
      <Flex bg="brand.dark">
        <Flex flex={1} p={8} minH="100vh">
          <AccessDenied />
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex bg="brand.dark" overflow="hidden" maxW="100vw">
      <AdminSidebar />
      <Flex flex={1} p={8} minH="100vh" minW={0} maxW="100%">
        {children}
      </Flex>
    </Flex>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminLayoutInner>{children}</AdminLayoutInner>
  );
}
