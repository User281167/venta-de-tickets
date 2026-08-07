"use client";

import { useMemo } from "react";
import { Box, Flex, Image } from "@chakra-ui/react";
import { generateParticles } from "@/features/sponsor/hooks/particles";
import { DefaultWaves } from "@/shared/components/Waves";

const PARTICLE_COUNT = 30;

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const particles = useMemo(() => generateParticles(PARTICLE_COUNT), []);

  return (
    <Flex
      align="center"
      justify="center"
      minH="100vh"
      minW="100%"
      background="url(/assets/wave-bg.jpg) center/cover no-repeat"
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
        top="30%"
        left="50%"
        transform="translate(-50%, -50%)"
        w="560px"
        h="560px"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(57,255,99,0.32) 0%, transparent 70%)"
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

      <div
        className={`!pointer-events-none !absolute !inset-0 !overflow-hidden`}
      >
        {particles.map((p, i) => (
          <span
            key={i}
            className="particle"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: `oklch(0.85 0.2 ${p.hue})`,
              boxShadow: `0 0 ${p.glow}px oklch(0.75 0.25 ${p.hue})`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      <Flex
        position="relative"
        zIndex={4}
        minH="100%"
        w="full"
        justify="space-around"
      >
        <Flex gap="4" align="center" hideBelow="xl">
          <Image src="/assets/logos-la-u/Horizontal - letras blancas.png" w="2xl" />
        </Flex>

        {children}
      </Flex>
    </Flex>
  );
}
