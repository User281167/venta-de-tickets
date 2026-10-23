"use client";

import {
  Box,
  Container,
  Flex,
  Heading,
  HStack,
  IconButton,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  IconChevronLeft,
  IconChevronRight,
  IconMapPin,
} from "@tabler/icons-react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { EXPERTS } from "../data/experts";
import styles from "./ExpertsCarousel.module.css";

const AUTOPLAY_MS = 5000;

const isMobile = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(max-width: 768px)").matches;

export function ExpertsCarousel() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLUListElement>(null);

  const scrollToCard = (index: number) => {
    const card = trackRef.current?.children[index] as HTMLElement | undefined;

    card?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  const go = (direction: number) => {
    const next = (active + direction + EXPERTS.length) % EXPERTS.length;
    setActive(next);
    if (isMobile()) scrollToCard(next);
  };

  const select = (index: number) => {
    setActive(index);
    if (isMobile()) scrollToCard(index);
  };

  useEffect(() => {
    if (reduced || paused) return;

    const id = setInterval(() => {
      if (!isMobile()) go(1);
    }, AUTOPLAY_MS);

    return () => clearInterval(id);
  });

  return (
    <Box
      as="section"
      id="expertos"
      py={{ base: 16, md: 24 }}
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top="-180px"
        left="50%"
        transform="translateX(-50%)"
        w="640px"
        h="640px"
        borderRadius="full"
        bg="radial-gradient(circle, rgba(0,229,255,0.12) 0%, transparent 70%)"
        pointerEvents="none"
      />

      <Container maxW="7xl" px={{ base: 4, md: 6 }} position="relative">
        <Stack gap={4} textAlign="center" mb={{ base: 8, md: 12 }}>
          <Text
            color="#f5bd35"
            fontSize={{ base: "md", md: "xl" }}
            fontWeight="black"
            textTransform="uppercase"
            letterSpacing="0.08em"
          >
            Sáb. 24 oct. · 10:30 a. m.
          </Text>

          <Text
            color="brand.cyan"
            fontSize="sm"
            fontWeight="black"
            textTransform="uppercase"
            letterSpacing="0.18em"
          >
            Panel de expertos
          </Text>

          <Heading
            as="h2"
            fontSize={{ base: "3xl", md: "5xl" }}
            color="white"
            lineHeight="1.1"
          >
            Las voces del futuro
          </Heading>

          <Text
            color="brand.muted"
            fontSize={{ base: "md", md: "lg" }}
            maxW="680px"
            mx="auto"
          >
            Inteligencia artificial, universidad y sociedad en la voz de líderes
            del sector público, la academia y la empresa.
          </Text>

          <HStack
            gap={3}
            mx="auto"
            mt={2}
            px={5}
            py={2}
            borderRadius="full"
            border="1px solid rgba(255,255,255,0.12)"
            bg="rgba(255,255,255,0.04)"
            textAlign="left"
          >
            <IconMapPin size={22} color="#f5bd35" />

            <Stack gap={0}>
              <Text
                color="brand.muted"
                fontSize="0.65rem"
                fontWeight="bold"
                letterSpacing="0.18em"
                textTransform="uppercase"
                lineHeight={1.2}
              >
                Lugar
              </Text>

              <Text
                color="white"
                fontSize="sm"
                fontWeight="bold"
                lineHeight={1.3}
              >
                Pabellón Pereira · Expofuturo
              </Text>
            </Stack>
          </HStack>
        </Stack>

        <motion.div
          initial={reduced ? {} : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <Box
            role="group"
            aria-roledescription="carrusel"
            aria-label="Expertos del panel"
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft") go(-1);
              if (event.key === "ArrowRight") go(1);
            }}
          >
            <ul ref={trackRef} className={styles.track}>
              {EXPERTS.map((expert, index) => {
                const isActive = index === active;

                return (
                  <li
                    key={expert.name}
                    className={`${styles.item} ${isActive ? styles.active : ""}`}
                  >
                    <button
                      type="button"
                      className={styles.card}
                      aria-pressed={isActive}
                      aria-label={`${expert.name}, ${expert.role}`}
                      onClick={() => select(index)}
                    >
                      <span className={styles.media}>
                        <img
                          src={expert.image}
                          alt={`Retrato de ${expert.name}`}
                          loading="lazy"
                        />
                        <span className={styles.overlay} aria-hidden="true" />
                      </span>
                      <span className={styles.content}>
                        <span className={styles.role}>{expert.role}</span>
                        <span className={styles.name}>{expert.name}</span>
                        <span className={styles.bio}>{expert.bio}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <Flex justify="center" align="center" gap={4} mt={6}>
              <IconButton
                aria-label="Experto anterior"
                variant="outline"
                color="white"
                borderColor="rgba(255,255,255,0.18)"
                borderRadius="full"
                _hover={{ borderColor: "brand.cyan", color: "brand.cyan" }}
                onClick={() => go(-1)}
              >
                <IconChevronLeft size={20} />
              </IconButton>

              <Text color="brand.muted" fontSize="sm" letterSpacing="0.12em">
                {String(active + 1).padStart(2, "0")} /{" "}
                {String(EXPERTS.length).padStart(2, "0")}
              </Text>

              <IconButton
                aria-label="Siguiente experto"
                variant="outline"
                color="white"
                borderColor="rgba(255,255,255,0.18)"
                borderRadius="full"
                _hover={{ borderColor: "brand.cyan", color: "brand.cyan" }}
                onClick={() => go(1)}
              >
                <IconChevronRight size={20} />
              </IconButton>
            </Flex>
          </Box>
        </motion.div>
      </Container>
    </Box>
  );
}
