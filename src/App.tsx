import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ReactLenis } from 'lenis/react';
import UnifiedScrollEngine from "@/components/animation/UnifiedScrollEngine";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ReactLenis root options={{
      // Disable internal RAF loop; driven centrally via GSAP Ticker in UnifiedScrollEngine
      autoRaf: false,

      // Desktop / Laptop settings
      smoothWheel: true,
      duration: 1.2,
      wheelMultiplier: 0.9,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),

      // Native mobile touch preservation (no synthetic inertia interception)
      syncTouch: false,
      touchMultiplier: 1.0,

      // Accessibility: respect OS reduced motion
      respectReducedMotion: true,
    }}>
      <UnifiedScrollEngine />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ReactLenis>
  </QueryClientProvider>
);

export default App;