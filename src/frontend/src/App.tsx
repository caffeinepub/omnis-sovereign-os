import { Toaster } from "@/components/ui/sonner";
import { AppRouter } from "./Router";

export default function App() {
  return (
    <>
      <AppRouter />
      <Toaster position="top-right" duration={4000} />
    </>
  );
}
