"use client";

import { Box, Flex, IconButton, Image } from "@chakra-ui/react";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { useEffect, useState } from "react";

const SLIDES = [
  { src: "/slider1.jpg", alt: "Slider 1" },
  { src: "/slider2.jpg", alt: "Slider 2" },
  { src: "/slider3.jpeg", alt: "Slider 3" },
  { src: "/slider4.jpg", alt: "Slider 4" },
  { src: "/slider5.jpeg", alt: "Slider 5" },
];

const AUTO_PLAY_INTERVAL = 5000;

export function FullWidthSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, AUTO_PLAY_INTERVAL);
    return () => clearInterval(id);
  }, []);

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
    <Box
      w="full"
      h={{ base: "240px", sm: "320px", md: "420px", lg: "520px" }}
      position="relative"
      overflow="hidden"
    >
      <Flex
        w="full"
        h="full"
        transition="transform 0.6s ease-in-out"
        transform={`translateX(-${current * 100}%)`}
      >
        {SLIDES.map((slide, i) => (
          <Box key={i} minW="100%" h="full" flexShrink={0}>
            <Image
              src={slide.src}
              alt={slide.alt}
              w="full"
              h="full"
              objectFit="cover"
              fallback={<Box w="full" h="full" bg="brand.panel" />}
            />
          </Box>
        ))}
      </Flex>

      <IconButton
        aria-label="Anterior"
        position="absolute"
        left={{ base: 2, md: 4 }}
        top="50%"
        transform="translateY(-50%)"
        bg="blackAlpha.500"
        color="white"
        _hover={{ bg: "blackAlpha.700" }}
        rounded="full"
        size={{ base: "sm", md: "md" }}
        onClick={prev}
      >
        <IconArrowLeft />
      </IconButton>

      <IconButton
        aria-label="Siguiente"
        position="absolute"
        right={{ base: 2, md: 4 }}
        top="50%"
        transform="translateY(-50%)"
        bg="blackAlpha.500"
        color="white"
        _hover={{ bg: "blackAlpha.700" }}
        rounded="full"
        size={{ base: "sm", md: "md" }}
        onClick={next}
      >
        <IconArrowRight />
      </IconButton>

      <Flex
        position="absolute"
        bottom={{ base: 3, md: 4 }}
        left="50%"
        transform="translateX(-50%)"
        gap={2}
      >
        {SLIDES.map((_, i) => (
          <Box
            key={i}
            w={{ base: 2, md: 3 }}
            h={{ base: 2, md: 3 }}
            rounded="full"
            bg={i === current ? "brand.cyan" : "whiteAlpha.500"}
            cursor="pointer"
            transition="background 0.3s"
            onClick={() => goTo(i)}
          />
        ))}
      </Flex>
    </Box>
  );
}
