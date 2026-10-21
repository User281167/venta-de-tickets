"use client";

import { Flex, Text } from "@chakra-ui/react";
import { AdminSidebar } from "@/shared/components/AdminSidebar";
import { canAccessAdminRoute } from "@/shared/lib/admin-routes";
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

  if (!canAccessAdminRoute(pathname, role)) {
    router.replace("/");
    return null;
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
  return <AdminLayoutInner>{children}</AdminLayoutInner>;
}
