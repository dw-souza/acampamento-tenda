import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import Admin from "./pages/Admin";
import AdminParishes from "./pages/AdminParishes";
import AdminParishForm from "./pages/AdminParishForm";
import AdminStages from "@/pages/AdminStages";
import AdminStageForm from "@/pages/AdminStageForm";
import AdminCamps from "@/pages/AdminCamps";
import AdminCampForm from "@/pages/AdminCampForm";
import AdminCampRegistrations from "@/pages/AdminCampRegistrations";
import AdminCampRegistrationForm from "@/pages/AdminCampRegistrationForm";
import AdminCampTents from "@/pages/AdminCampTents";
import AdminTents from "@/pages/AdminTents";
import AdminTentForm from "@/pages/AdminTentForm";
import AdminTentParticipants from "@/pages/AdminTentParticipants";
import AdminTentFamilyForm from "@/pages/AdminTentFamilyForm";
import AdminTentFamilyAdd from "@/pages/AdminTentFamilyAdd";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/sobre" element={<About />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/parishes" element={<AdminParishes />} />
          <Route path="/admin/parishes/new" element={<AdminParishForm />} />
          <Route path="/admin/parishes/edit/:id" element={<AdminParishForm />} />
          <Route path="/admin/stages" element={<AdminStages />} />
          <Route path="/admin/stages/new" element={<AdminStageForm />} />
          <Route path="/admin/stages/edit/:id" element={<AdminStageForm />} />
          <Route path="/admin/camps" element={<AdminCamps />} />
          <Route path="/admin/camps/new" element={<AdminCampForm />} />
          <Route path="/admin/camps/edit/:id" element={<AdminCampForm />} />
          <Route path="/admin/camps/tents/:id" element={<AdminCampTents />} />
          <Route path="/admin/camps/registrations/:id" element={<AdminCampRegistrations />} />
          <Route path="/admin/camps/registrations/:id/new" element={<AdminCampRegistrationForm />} />
          <Route path="/admin/tents" element={<AdminTents />} />
          <Route path="/admin/tents/new" element={<AdminTentForm />} />
          <Route path="/admin/tents/edit/:id" element={<AdminTentForm />} />
          <Route path="/admin/tents/:tentId/participants" element={<AdminTentParticipants />} />
          <Route path="/admin/tents/family/:id" element={<AdminTentFamilyForm />} />
          <Route path="/admin/tents/:tentId/family/add" element={<AdminTentFamilyAdd />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
