import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import RoleSelect from "./pages/RoleSelect";
import SellerDashboard from "./pages/SellerDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import AdminPanel from "./pages/AdminPanel";
import AccountDetail from "./pages/AccountDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/role-select" element={<RoleSelect />} />
              <Route path="/seller" element={<SellerDashboard />} />
              <Route path="/buyer" element={<BuyerDashboard />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/account/:id" element={<AccountDetail />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
