import {
  HStack,
  Text,
} from "@chakra-ui/react";

export function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <HStack justify="space-between" align="center" fontSize="sm">
      <Text color="brand.muted" fontWeight="bold" letterSpacing="0.5px" textTransform="uppercase" fontSize="xs">
        {label}
      </Text>
      <Text
        color="white"
        fontFamily={mono ? "mono" : undefined}
        wordBreak="break-all"
        textAlign="right"
        maxW="60%"
      >
        {value}
      </Text>
    </HStack>
  );
}
