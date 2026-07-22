import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react";

interface ResultCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  statusColor: string;
  primaryAction: { label: string; href: string };
}

export function ResultCard({
  icon,
  title,
  subtitle,
  statusColor,
  primaryAction,
}: ResultCardProps) {
  return (
    <Box
      minH="80vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      py={{ base: 6, md: 10 }}
      px={4}
    >
      <VStack
        maxW="480px"
        w="full"
        bg="brand.panel"
        borderRadius="2xl"
        p={{ base: 6, md: 8 }}
        border="1px solid"
        borderColor="rgba(255,255,255,0.08)"
        boxShadow={`0 24px 80px rgba(0,0,0,0.5), 0 0 60px ${statusColor}25`}
        textAlign="center"
        gap={5}
      >
        <Box
          p={4}
          borderRadius="full"
          bg={`${statusColor}15`}
          border={`1px solid ${statusColor}40`}
          display="inline-flex"
        >
          {icon}
        </Box>

        <VStack gap={2}>
          <Heading as="h1" size="xl" color="white" lineHeight="1.2">
            {title}
          </Heading>

          <Text fontSize="md" color="brand.muted">
            {subtitle}
          </Text>
        </VStack>

        <Button
          asChild
          w="full"
          h="52px"
          borderRadius="xl"
          bg={statusColor}
          color="brand.dark"
          fontWeight="black"
          fontSize="md"
          _hover={{ opacity: 0.9 }}
        >
          <a href={primaryAction.href}>{primaryAction.label}</a>
        </Button>
      </VStack>
    </Box>
  );
}
