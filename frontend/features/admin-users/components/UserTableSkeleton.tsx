"use client";

import { Box, Flex, Table } from "@chakra-ui/react";
import { tableCss } from "@/shared/components/tablecss";

const SKELETON_ROWS = 5;

function SkeletonCell({ width }: { width: string }) {
  return <Box h="5" w={width} borderRadius="md" className="skeleton-pulse" />;
}

export function TableSkeleton() {
  return (
    <>
      <style>{`
        @keyframes skeletonPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        .skeleton-pulse {
          animation: skeletonPulse 1.5s ease-in-out infinite;
        }
      `}</style>
      <Table.Root w="full" css={tableCss}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Nombre</Table.ColumnHeader>
            <Table.ColumnHeader>Correo</Table.ColumnHeader>
            <Table.ColumnHeader>Registro</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="center">Encuesta</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {Array.from({ length: SKELETON_ROWS }).map((_, i) => (
            <Table.Row key={i}>
              <Table.Cell>
                <SkeletonCell width="40%" />
              </Table.Cell>
              <Table.Cell>
                <SkeletonCell width="60%" />
              </Table.Cell>
              <Table.Cell>
                <SkeletonCell width="35%" />
              </Table.Cell>
              <Table.Cell textAlign="center">
                <Flex justify="center">
                  <SkeletonCell width="30%" />
                </Flex>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </>
  );
}
