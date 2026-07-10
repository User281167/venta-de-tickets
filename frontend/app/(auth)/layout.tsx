import { Box, Flex, Heading, Stack, Text, Image } from "@chakra-ui/react";

export default function LoginPage({ children }: { children: React.ReactNode }) {
  return (
    <Flex
      align="center"
      justify="center"
      minH="100vh"
      minW="100%"
      background="url(/header.png) center/cover no-repeat"
      position="relative"
    >
      <Box position="absolute" inset={0} bg="rgba(0, 0, 0, 0.55)" />

      <Flex
        position="relative"
        zIndex={1}
        minH="100%"
        w="full"
        justify="space-around"
      >
        <Flex gap="4" align="center" hideBelow="xl">
          <Image src="/la-u.png" w="sm" />

          <Stack>
            <Heading
              as="h1"
              fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }}
              color="white"
              lineHeight="0.95"
              fontWeight="black"
              textTransform="uppercase"
            >
              del futuro
            </Heading>

            <Text
              fontSize={{ base: "lg", md: "2xl" }}
              color="white"
              textTransform="uppercase"
              lineHeight="1.35"
            >
              Conectamos{" "}
              <Box as="span" color="brand.pink">
                talento
              </Box>
              ,<br /> impulsamos el{" "}
              <Box as="span" color="brand.cyan">
                futuro
              </Box>
            </Text>
          </Stack>
        </Flex>

        {children}
      </Flex>
    </Flex>
  );
}
