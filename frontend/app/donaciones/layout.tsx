import { Box, Flex, Image } from "@chakra-ui/react";
import { DefaultWaves } from "@/shared/components/Waves";
import { Particles } from "@/shared/components/Particles";

export default function CheckoutStatusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Flex
      align="center"
      justify="center"
      minH="100vh"
      minW="100%"
      background="url(/assets/blue-wave-bg.jpg) center/cover no-repeat"
      position="relative"
      overflow="hidden"
    >
      <Box position="absolute" inset={0} bg="rgba(0, 0, 0, 0.55)" />

      <Box
        position="absolute"
        top="-200px"
        left="-200px"
        w="640px"
        h="640px"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(255,15,123,0.55) 0%, rgba(255,15,123,0.2) 35%, transparent 70%)"
        pointerEvents="none"
        filter="blur(20px)"
        zIndex={1}
      />
      <Box
        position="absolute"
        bottom="-200px"
        right="-200px"
        w="640px"
        h="640px"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(0,194,255,0.5) 0%, rgba(160,16,96,0.2) 35%, transparent 70%)"
        pointerEvents="none"
        filter="blur(20px)"
        zIndex={1}
      />
      <Box
        position="absolute"
        top="10%"
        right="20%"
        w="380px"
        h="380px"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(124,60,255,0.42) 0%, transparent 70%)"
        pointerEvents="none"
        filter="blur(20px)"
        zIndex={1}
      />

      <DefaultWaves />
      <Particles />

      <Flex
        position="relative"
        zIndex={4}
        minH="100%"
        w="full"
        justify="space-around"
      >
        {children}
      </Flex>
    </Flex>
  );
}
