"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Flex, Spinner, Text } from "@chakra-ui/react";

function EpaycoResultInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const xResponse = searchParams.get("x_response") ?? "";
    const refPayco = searchParams.get("x_ref_payco") ?? "";
    const externalRef = searchParams.get("x_extra1") ?? "";

    const url = new URL(window.location.origin);

    if (xResponse === "Aceptada") {
      url.pathname = "/donaciones/retorno/state/success";

      if (externalRef) url.searchParams.set("external_reference", externalRef);
      if (refPayco) url.searchParams.set("ref_payco", refPayco);
    } else if (xResponse === "Rechazada" || xResponse === "Fallida") {
      url.pathname = "/donaciones/retorno/state/failure";

      if (refPayco) url.searchParams.set("ref_payco", refPayco);
    } else {
      url.pathname = "/donaciones/retorno/state/pending";
    }

    router.replace(url.pathname + url.search);
  }, [router, searchParams]);

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      gap={4}
      p={8}
      color="white"
      minH="50vh"
    >
      <Spinner size="xl" color="#00e5ff" />
      <Text fontSize="lg" fontWeight="bold">
        Confirmando tu donación...
      </Text>
    </Flex>
  );
}

export default function EpaycoResultPage() {
  return (
    <Suspense fallback={
      <Flex align="center" justify="center" minH="50vh">
        <Spinner size="xl" color="#00e5ff" />
      </Flex>
    }>
      <EpaycoResultInner />
    </Suspense>
  );
}
