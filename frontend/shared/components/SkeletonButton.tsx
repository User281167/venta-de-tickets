import { HStack, Skeleton } from "@chakra-ui/react";

export function SkeletonButton({
  count = 2,
  h = "40px",
  w = "120px",
  borderRadius = "md",
}: {
  count?: number;
  h?: string;
  w?: string;
  borderRadius?: string;
}) {
  return (
    <HStack gap={3}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} h={h} w={w} borderRadius={borderRadius} />
      ))}
    </HStack>
  );
}
