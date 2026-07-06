import React, { type ReactNode } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";

export const ErrorBanner = React.memo(function ({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Flex
      bg="red.50"
      border="1px"
      borderColor="red.200"
      borderRadius="md"
      p={4}
      gap={3}
      align="center"
    >
      <Box w="3" h="3" borderRadius="full" bg="red.400" flexShrink={0} />
      <Text color="red.700" fontSize="sm">
        {children}
      </Text>
    </Flex>
  );
});
