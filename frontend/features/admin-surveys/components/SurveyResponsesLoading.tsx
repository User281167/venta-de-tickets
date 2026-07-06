import { Flex, VStack } from "@chakra-ui/react";

export function SurveyResponsesLoading() {
  return (
    <VStack align="stretch" gap={4} w="full">
      {Array.from({ length: 4 }).map((_, i) => (
        <Flex
          key={i}
          h="16"
          bg="gray.100"
          borderRadius="md"
          className="skeleton-pulse"
        />
      ))}
      <style>{`
          @keyframes skeletonPulse {
            0%, 100% { opacity: 0.4; }
            50% { opacity: 0.8; }
          }
          .skeleton-pulse {
            animation: skeletonPulse 1.5s ease-in-out infinite;
          }
        `}</style>
    </VStack>
  );
}
