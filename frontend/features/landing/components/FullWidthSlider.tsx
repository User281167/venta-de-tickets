"use client";

import { Box, Flex, IconButton } from "@chakra-ui/react";
import Image from "next/image";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { AnimatedSection } from "@/shared/components/AnimatedSection";

const SLIDES = [
  { src: "/slider1.jpg", alt: "Momentos de la convención" },
  { src: "/slider2.jpg", alt: "Networking y comunidad" },
  { src: "/slider3.jpeg", alt: "Ponencias inspiradoras" },
  { src: "/slider4.jpg", alt: "Experiencias UTP" },
];

const AUTO_PLAY_INTERVAL = 5000;

export function FullWidthSlider() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, AUTO_PLAY_INTERVAL);
    return () => clearInterval(id);
  }, [isPaused]);

  function goTo(index: number) {
    setCurrent(index);
  }

  function prev() {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }

  function next() {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }

  return (
    <AnimatedSection direction="up" delay={0} duration={0.6}>
      <Box
        w="full"
        h={{ base: "260px", sm: "340px", md: "440px", lg: "560px" }}
      position="relative"
      overflow="hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <Flex
        w="full"
        h="full"
        transition="transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)"
        transform={`translateX(-${current * 100}%)`}
      >
        {SLIDES.map((slide, i) => (
          <Box key={i} minW="100%" h="full" flexShrink={0} position="relative">
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              style={{ objectFit: "cover" }}
              priority={i === 0}
            />
            <Box
              position="absolute"
              inset={0}
              bg="linear-gradient(90deg, rgba(2,4,20,0.45), transparent 60%)"
            />
          </Box>
        ))}
      </Flex>

      <IconButton
        aria-label="Anterior"
        position="absolute"
        left={{ base: 3, md: 6 }}
        top="50%"
        transform="translateY(-50%)"
        bg="blackAlpha.500"
        color="white"
        _hover={{ bg: "blackAlpha.700", transform: "translateY(-50%) scale(1.05)" }}
        rounded="full"
        size={{ base: "sm", md: "md" }}
        onClick={prev}
        transition="all 0.2s ease"
      >
        <IconArrowLeft />
      </IconButton>

      <IconButton
        aria-label="Siguiente"
        position="absolute"
        right={{ base: 3, md: 6 }}
        top="50%"
        transform="translateY(-50%)"
        bg="blackAlpha.500"
        color="white"
        _hover={{ bg: "blackAlpha.700", transform: "translateY(-50%) scale(1.05)" }}
        rounded="full"
        size={{ base: "sm", md: "md" }}
        onClick={next}
        transition="all 0.2s ease"
      >
        <IconArrowRight />
      </IconButton>

      <Flex
        position="absolute"
        bottom={{ base: 4, md: 6 }}
        left="50%"
        transform="translateX(-50%)"
        gap={3}
      >
        {SLIDES.map((_, i) => (
          <Box
            key={i}
            w={{ base: 2.5, md: 3 }}
            h={{ base: 2.5, md: 3 }}
            rounded="full"
            bg={i === current ? "brand.cyan" : "whiteAlpha.500"}
            cursor="pointer"
            transition="all 0.3s"
            onClick={() => goTo(i)}
            _hover={{ bg: i === current ? "brand.cyan" : "whiteAlpha.700" }}
          />
        ))}
      </Flex>
      </Box>
    </AnimatedSection>
  );
}
