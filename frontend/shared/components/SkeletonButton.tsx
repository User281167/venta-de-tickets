import { HStack, Skeleton } from "@chakra-ui/react";

export function SkeletonButton({ count = 2 }: { count?: number }) {
  return (
    <HStack gap={3}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} h="40px" w="120px" borderRadius="md" />
      ))}
    </HStack>
  );
}
