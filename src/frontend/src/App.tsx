import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import { AppRouter } from "./Router";

export default function App() {
  return (
    <ErrorBoundary>
      <AppRouter />
      <Toaster position="top-right" duration={4000} />
    </ErrorBoundary>
  );
}
