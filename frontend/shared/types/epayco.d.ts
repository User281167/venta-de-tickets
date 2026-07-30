export {};

declare global {
  interface Window {
    ePayco?: {
      checkout: {
        configure: (config: {
          sessionId: string;
          type: "onpage" | "standard";
          test: boolean;
        }) => {
          open: () => void;
          setHooks: (hooks: {
            onCreated?: (data: unknown) => void;
            onResponse?: (response: {
              ref_payco?: string;
              x_response?: string;
              x_ref_payco?: string;
            }) => void;
            onErrors?: (error: unknown) => void;
            onClosed?: (errors?: unknown) => void;
          }) => void;
        };
      };
    };
  }
}
