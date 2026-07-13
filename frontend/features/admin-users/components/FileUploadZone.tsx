"use client";

import { Box, Button, Flex, Icon, Text, VStack } from "@chakra-ui/react";
import { IconDownload, IconUpload } from "@tabler/icons-react";
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

  return (
    <VStack gap={4} w="full">
      <Box
        w="full"
        p={10}
        border="2px dashed"
        borderColor={error ? "red.400" : isDragOver ? "teal.400" : "gray.300"}
        borderRadius="lg"
        textAlign="center"
        cursor={disabled ? "not-allowed" : "pointer"}
        opacity={disabled ? 0.6 : 1}
        transition="all 0.2s"
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          style={{ display: "none" }}
          data-testid="file-input"
          onChange={handleFileChange}
        />

        {selectedFile ? (
          <VStack gap={2}>
            <Icon as={IconUpload} boxSize={8} color="teal.500" />
            <Text fontWeight="medium" color="teal.700">
              {selectedFile.name}
            </Text>

            <Button
              size="sm"
              variant="ghost"
              colorPalette="red"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              Quitar archivo
            </Button>
          </VStack>
        ) : (
          <VStack gap={2}>
            <Icon as={IconUpload} boxSize={8} color="gray.400" />

            <Text color="gray.600" fontWeight="medium">
              Arrastra un archivo .xlsx aquí o haz clic para seleccionar
            </Text>

            <Text fontSize="sm" color="gray.400">
              Solo archivos .xlsx — máximo 50 filas
            </Text>
          </VStack>
        )}
      </Box>

      {error && (
        <Flex align="center" gap={2} color="red.600" fontSize="sm">
          <Text>{error}</Text>
        </Flex>
      )}

      <Button
        colorPalette="purple"
        onClick={onDownloadTemplate}
        disabled={disabled}
      >
        <IconDownload style={{ marginRight: 6 }} />
        Descargar plantilla
      </Button>
    </VStack>
  );
}
