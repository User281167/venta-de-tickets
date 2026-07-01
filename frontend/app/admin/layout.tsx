"use client";

import { Flex, Text } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdminSidebar } from "@/shared/components/AdminSidebar";
import { AccessDenied } from "@/shared/components/AccessDenied";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

const queryClient = new QueryClient();

const ROLE_RESTRICTED_PATHS: Record<string, string[]> = {
  "/admin/usuarios": ["super_admin", "organizer"],
  "/admin/encuestas": ["super_admin", "organizer"],
};

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

  const requiredRoles = ROLE_RESTRICTED_PATHS[pathname];
  if (requiredRoles && !requiredRoles.includes(role)) {
    return (
      <Flex>
        <AdminSidebar />
        <Flex flex={1} p={8} bg="gray.50" minH="100vh">
          <AccessDenied />
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex>
      <AdminSidebar />
      <Flex flex={1} p={8} bg="gray.50" minH="100vh">
        {children}
      </Flex>
    </Flex>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </QueryClientProvider>
  );
}
