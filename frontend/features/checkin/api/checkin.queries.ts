"use client";

import { useMutation } from "@tanstack/react-query";

import {
  allowEntry,
  confirmEntry,
  requestConfirmation,
  scanQr,
} from "./checkin.endpoints";
import type {
  ScanInput,
  TicketActionInput,
  TicketSummary,
} from "../schemas/checkin.schema";

export function useScanTicket() {
  return useMutation<TicketSummary, Error, ScanInput>({
    mutationFn: (input) => scanQr(input),
  });
}

export function useConfirmEntry() {
  return useMutation<void, Error, TicketActionInput>({
    mutationFn: (input) => confirmEntry(input),
  });
}

export function useRequestConfirmation() {
  return useMutation<void, Error, TicketActionInput>({
    mutationFn: (input) => requestConfirmation(input),
  });
}

export function useAllowEntry() {
  return useMutation<void, Error, TicketActionInput>({
    mutationFn: (input) => allowEntry(input),
  });
}
