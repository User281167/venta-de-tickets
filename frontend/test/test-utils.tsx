import { ChakraProvider } from '@chakra-ui/react';
import { system } from '../components/ui/theme';
import type { ReactNode } from 'react';

export function TestWrapper({ children }: { children: ReactNode }) {
  return <ChakraProvider value={system}>{children}</ChakraProvider>;
}
