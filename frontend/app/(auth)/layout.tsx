import { Box, Flex, Heading, Stack, Text, Image } from "@chakra-ui/react";

export default function LoginPage({ children }: { children: React.ReactNode }) {
  return (
    <Flex
      align="center"
      justify="center"
      minH="100vh"
      minW="100%"
      background="url(/wave-bg.jpg) center/cover no-repeat"
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
          <Image src="/logos-la-u/Horizontal - letras blancas.png" w="2xl" />
        </Flex>

        {children}
      </Flex>
    </Flex>
  );
}
