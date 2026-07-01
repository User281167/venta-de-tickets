"use client";

import { Flex } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AdminSidebar } from "@/shared/components/AdminSidebar";
import type { ReactNode } from "react";

const queryClient = new QueryClient();

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Flex>
        <AdminSidebar />
        <Flex flex={1} p={8} bg="gray.50" minH="100vh">
          {children}
        </Flex>
      </Flex>
    </QueryClientProvider>
  );
}
