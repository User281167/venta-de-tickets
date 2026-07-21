"use client";

import { Flex, Text } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdminSidebar } from "@/shared/components/AdminSidebar";
import { AccessDenied } from "@/shared/components/AccessDenied";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";

const queryClient = new QueryClient();

// Paths inside /admin/* that are restricted to a subset of ADMIN_ROLES.
// `/admin/checkin` is intentionally NOT listed — it must be reachable by
// `checker` (and `admin` for support) so the door-staff
// scan flow works. Add an entry here only if a new sub-page needs to be
// hidden from `checker`.
const ROLE_RESTRICTED_PATHS: Record<string, string[]> = {
  "/admin/ticket-types": ["admin"],
  "/admin/usuarios": ["admin"],
  "/admin/usuarios/carga-masiva": ["admin"],
  "/admin/pagos": ["admin"],
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

  const ADMIN_ROLES = new Set(["super_admin", "admin", "checker"]);
  if (!ADMIN_ROLES.has(role)) {
    router.replace("/");
    return null;
  }

  const requiredRoles = ROLE_RESTRICTED_PATHS[pathname];
  if (requiredRoles && !requiredRoles.includes(role)) {
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
    <QueryClientProvider client={queryClient}>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </QueryClientProvider>
  );
}
