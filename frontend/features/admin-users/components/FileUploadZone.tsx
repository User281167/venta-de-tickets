"use client";

import { Box, Button, Flex, HStack, Icon, Text, VStack } from "@chakra-ui/react";
import { IconDownload, IconUpload, IconFileTypeXls } from "@tabler/icons-react";
import { type DragEvent, useRef, useState } from "react";

type FileUploadZoneProps = {
  onFileSelect: (file: File | null) => void;
  onDownloadTemplate: () => void;
  disabled?: boolean;
};

export function FileUploadZone({
  onFileSelect,
  onDownloadTemplate,
  disabled,
}: FileUploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  function validateAndSet(file: File | null) {
    setError(null);
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "xlsx") {
      setError("Solo archivos .xlsx son permitidos");
      setSelectedFile(null);
      onFileSelect(null);
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const file = e.dataTransfer.files[0] ?? null;
    validateAndSet(file);
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  }

  function handleDragLeave() {
    setIsDragOver(false);
  }

  function handleClick() {
    if (disabled) return;
    inputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    validateAndSet(file);
    if (e.target) e.target.value = "";
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
    setSelectedFile(null);
    setError(null);
    onFileSelect(null);
  }

  return (
    <VStack gap={6} w="full">
      <Box
        w="full"
        p={{ base: 8, md: 12 }}
        className="glass-card"
        border="2px dashed"
        borderColor={
          error ? "red.400" : isDragOver ? "brand.cyan" : "rgba(255,255,255,0.16)"
        }
        borderRadius="2xl"
        textAlign="center"
        cursor={disabled ? "not-allowed" : "pointer"}
        opacity={disabled ? 0.6 : 1}
        transition="all 0.25s ease"
        position="relative"
        overflow="hidden"
        _hover={
          disabled
            ? {}
            : {
                borderColor: "brand.cyan",
                boxShadow: "0 0 32px rgba(0,229,255,0.12)",
              }
        }
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          h="3px"
          bg="linear-gradient(90deg, #ff0f7b, #00e5ff)"
        />

        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          style={{ display: "none" }}
          data-testid="file-input"
          onChange={handleFileChange}
        />

        {selectedFile ? (
          <VStack gap={3}>
            <Box
              w={16}
              h={16}
              borderRadius="xl"
              bg="rgba(0,229,255,0.08)"
              border="1px solid rgba(0,229,255,0.16)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              mx="auto"
            >
              <IconFileTypeXls size={32} color="#00e5ff" />
            </Box>
            <Text fontWeight="bold" color="white" fontSize="lg">
              {selectedFile.name}
            </Text>
            <Button
              size="sm"
              variant="ghost"
              color="brand.pink"
              _hover={{ bg: "rgba(255,15,123,0.1)" }}
              onClick={handleRemove}
            >
              Quitar archivo
            </Button>
          </VStack>
        ) : (
          <VStack gap={3}>
            <Box
              w={16}
              h={16}
              borderRadius="xl"
              bg={
                isDragOver
                  ? "rgba(0,229,255,0.12)"
                  : "rgba(255,255,255,0.04)"
              }
              border={`1px solid ${
                isDragOver
                  ? "rgba(0,229,255,0.24)"
                  : "rgba(255,255,255,0.08)"
              }`}
              display="flex"
              alignItems="center"
              justifyContent="center"
              mx="auto"
              transition="all 0.25s ease"
            >
              <IconUpload size={32} color={isDragOver ? "#00e5ff" : "#aeb8d8"} />
            </Box>

            <Text color="white" fontWeight="bold" fontSize="lg">
              Arrastra un archivo .xlsx aquí
            </Text>

            <Text color="brand.muted" fontSize="sm">
              o haz clic para seleccionar desde tu dispositivo
            </Text>

            <Text fontSize="xs" color="brand.muted" opacity={0.7}>
              Solo archivos .xlsx — máximo 50 filas
            </Text>
          </VStack>
        )}
      </Box>

      {error && (
        <Flex
          align="center"
          gap={2}
          color="#ef4444"
          fontSize="sm"
          bg="rgba(239,68,68,0.1)"
          px={4}
          py={2}
          borderRadius="xl"
          border="1px solid rgba(239,68,68,0.3)"
        >
          <Text>{error}</Text>
        </Flex>
      )}

      <Button
        bg="linear-gradient(90deg, #ff0f7b, #7c3cff)"
        color="white"
        fontWeight="bold"
        borderRadius="xl"
        px={6}
        size="lg"
        onClick={onDownloadTemplate}
        disabled={disabled}
        _hover={{ opacity: 0.9, transform: "translateY(-2px)" }}
        transition="all 0.2s ease"
      >
        <HStack gap={2}>
          <IconDownload size={20} />
          <Text>Descargar plantilla</Text>
        </HStack>
      </Button>
    </VStack>
  );
}
