import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AdminLayout from "./pages/admin/AdminLayout";
import NotFound from "./pages/NotFound";
import ProductDetails from "./pages/ProductDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminRoute from "./components/AdminRoute";
import { CartProvider } from "./hooks/useCart";
import { LanguageProvider } from "./i18n/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { QuoteProvider } from "./contexts/QuoteContext";
import QuoteForm from "./components/QuoteForm";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <CartProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <QuoteProvider>
                <QuoteForm />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Index />} />
                  <Route path="/catalog" element={<Index />} />
                  <Route path="/about" element={<Index />} />
                  <Route path="/contact" element={<Index />} />
                  <Route element={<AdminRoute />}>

                    <Route path="/admin" element={<AdminLayout />} />
                  </Route>
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </QuoteProvider>
            </BrowserRouter>
          </AuthProvider>
        </CartProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
