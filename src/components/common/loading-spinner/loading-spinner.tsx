import { Spinner } from "@medusajs/icons";

export const LoadingSpinner = () => (
  <div className="flex min-h-screen items-center justify-center">
    <Spinner className="animate-spin text-ui-fg-interactive" />
  </div>
);
