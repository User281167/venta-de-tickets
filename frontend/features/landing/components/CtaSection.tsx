import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Stack,
  Text,
} from "@chakra-ui/react";
import { IconArrowRight } from "@tabler/icons-react";
import NextLink from "next/link";

export function CtaSection() {
  return (
    <Box
      py={{ base: 12, md: 16 }}
      bg="linear-gradient(100deg, #ff0f7b 0%, #4116a8 60%, #00d5b8 100%)"
      position="relative"
      overflow="hidden"
    >
      <Container
        maxW="8xl"
        px={{ base: 4, md: 6 }}
        position="relative"
        zIndex={1}
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          align="center"
          justify="space-between"
          gap={8}
        >
          <Heading
            color="white"
            fontSize={{ base: "3xl", md: "5xl" }}
            lineHeight="1.05"
            textTransform="uppercase"
          >
            Sé parte del futuro,
            <br />
            sé parte de la{" "}
            <Text className="inline" color="brand.blue">
              U.
            </Text>
          </Heading>

          <Text color="white" maxW="sm">
            Inscríbete hoy y asegura tu cupo en el evento más ispirador del año.
          </Text>

          <Stack gap={3} align={{ base: "stretch", md: "center" }}>
            <Button
              asChild
              size={{ base: "md", md: "lg" }}
              px={{ base: 6, md: 8 }}
              minH="54px"
              bg="white"
              color="#12162b"
              borderRadius="10px"
              fontWeight="bold"
              boxShadow="0 0 30px rgba(255,255,255,0.22)"
              _hover={{
                transform: "translateY(-2px)",
                boxShadow: "0 0 42px rgba(0,229,255,0.42)",
              }}
            >
              <NextLink href="/registro">
                INSCRÍBETE AHORA <IconArrowRight size={22} />
              </NextLink>
            </Button>

            <Text color="white" fontSize="sm" textAlign="center">
              Cupos limitados
            </Text>
          </Stack>
        </Flex>
      </Container>
    </Box>
  );
}
