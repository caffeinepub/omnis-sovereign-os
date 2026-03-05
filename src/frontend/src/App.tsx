import { Toaster } from "@/components/ui/sonner";

export default function App() {
  return (
    <>
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <p className="text-muted-foreground font-sora text-sm">
          Omnis Sovereign OS — initializing...
        </p>
      </div>
      <Toaster position="top-right" duration={4000} />
    </>
  );
}
