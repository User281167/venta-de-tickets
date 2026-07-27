"use client";

import { useMemo } from "react";
import { Box, Flex, Image } from "@chakra-ui/react";
import Wave from "react-wavify";
import { generateParticles } from "@/features/sponsor/hooks/particles";

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
      background="url(/wave-bg.jpg) center/cover no-repeat"
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

      <Box
        position="absolute"
        insetX={0}
        bottom={0}
        zIndex={3}
        h="35%"
        opacity={0.55}
        pointerEvents="none"
        className="!opacity-10"
      >
        <Wave
          fill="url(#authWaveFront)"
          paused={false}
          style={{ width: "100%", height: "100%", display: "flex" }}
          options={{ height: 24, amplitude: 18, speed: 0.16, points: 4 }}
        >
          <defs>
            <linearGradient id="authWaveFront" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="35%" stopColor="#a78bfa" />
              <stop offset="65%" stopColor="#f0abfc" />
              <stop offset="100%" stopColor="#fdba74" />
            </linearGradient>
          </defs>
        </Wave>
      </Box>

      <Box
        position="absolute"
        insetX={0}
        bottom={0}
        zIndex={3}
        h="22%"
        opacity={0.45}
        pointerEvents="none"
        className="!opacity-10"
      >
        <Wave
          fill="url(#authWaveBack)"
          paused={false}
          style={{ width: "100%", height: "100%", display: "flex" }}
          options={{ height: 18, amplitude: 22, speed: 0.1, points: 3 }}
        >
          <defs>
            <linearGradient id="authWaveBack" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ff0f7b" />
              <stop offset="50%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#00e5ff" />
            </linearGradient>
          </defs>
        </Wave>
      </Box>

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
          <Image src="/logos-la-u/Horizontal - letras blancas.png" w="2xl" />
        </Flex>

        {children}
      </Flex>
    </Flex>
  );
}
