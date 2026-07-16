import {
  Badge,
  Box,
  Grid,
  Heading,
  HStack,
  Image,
  Stack,
  Text,
} from "@chakra-ui/react";
import { motion, useReducedMotion } from "framer-motion";
import { type AgendaEvent, getTrackColor } from "../data/agenda";

interface EventCardProps {
  event: AgendaEvent;
  index: number;
  side: "left" | "right";
}

export function EventCard({ event, index, side }: EventCardProps) {
  const reduced = useReducedMotion();
  const trackColor = getTrackColor(event.track);
  const StatusIcon = event.icon;

  return (
    <motion.div
      initial={
        reduced
          ? {}
          : {
              opacity: 0,
              x: side === "left" ? -60 : 60,
            }
      }
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: "easeOut" }}
      style={{ width: "100%" }}
    >
      <Box
        className="glass-card"
        borderRadius="2xl"
        overflow="hidden"
        transition="all 0.3s ease"
        _hover={{
          transform: "translateY(-6px)",
          boxShadow: `0 20px 48px ${trackColor}22`,
          borderColor: trackColor,
        }}
      >
        <Grid templateColumns={{ base: "1fr", md: "180px 1fr" }} gap={0}>
          <Box
            position="relative"
            h={{ base: "180px", md: "full" }}
            minH={{ md: "220px" }}
            overflow="hidden"
          >
            <Image
              src={event.image}
              alt={event.title}
              w="full"
              h="full"
              objectFit="cover"
              transition="transform 0.6s ease"
              _groupHover={{ transform: "scale(1.08)" }}
            />

            <Box
              position="absolute"
              inset={0}
              bg="linear-gradient(to top, rgba(2,4,20,0.7) 0%, transparent 60%)"
            />

              <Badge
                position="absolute"
                bottom={3}
                left={3}
                colorPalette="neutral"
                bg="rgba(2,4,20,0.7)"
                color="white"
                border="1px solid rgba(255,255,255,0.12)"
                px={2.5}
                py={1}
                borderRadius="full"
                fontSize="xs"
                fontWeight="bold"
                backdropFilter="blur(6px)"
              >
                <HStack gap={1}>
                  <StatusIcon size={14} color="#00e5ff" />
                  <Text as="span">{event.track}</Text>
                </HStack>
              </Badge>
          </Box>

            <Stack p={{ base: 5, md: 6 }} gap={4} justify="center">
              <HStack gap={3} flexWrap="wrap">
                <Badge
                  bg={`${trackColor}18`}
                  color={trackColor}
                  border={`1px solid ${trackColor}33`}
                  px={3}
                  py={1}
                  borderRadius="full"
                  fontSize="sm"
                  fontWeight="black"
                >
                  {event.time}
                </Badge>
                {event.speakers && event.speakers.length > 0 && (
                  <Text color="brand.muted" fontSize="sm">
                    {event.speakers.join(" · ")}
                  </Text>
                )}
              </HStack>

              <Heading as="h3" size="lg" color="white" lineHeight="1.2">
                {event.title}
              </Heading>

              <Text color="brand.muted" fontSize="md" lineHeight="1.7">
                {event.description}
              </Text>
            </Stack>
        </Grid>
      </Box>
    </motion.div>
  );
}
