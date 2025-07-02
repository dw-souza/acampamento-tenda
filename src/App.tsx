import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
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
import AdminCampWorkTeams from "@/pages/AdminCampWorkTeams";
import AdminCampBadges from "@/pages/AdminCampBadges";
import AdminCampDashboard from "@/pages/AdminCampDashboard";
import AdminWorkTeams from "@/pages/AdminWorkTeams";
import AdminTents from "@/pages/AdminTents";
import AdminTentForm from "@/pages/AdminTentForm";
import AdminTentParticipants from "@/pages/AdminTentParticipants";
import AdminTentFamilyForm from "@/pages/AdminTentFamilyForm";
import AdminTentFamilyAdd from "@/pages/AdminTentFamilyAdd";
import AdminBlog from "@/pages/AdminBlog";
import AdminBlogForm from "@/pages/AdminBlogForm";
import { ProtectedRoute } from "@/components/ProtectedRoute";

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
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="/admin/parishes" element={<ProtectedRoute><AdminParishes /></ProtectedRoute>} />
          <Route path="/admin/parishes/new" element={<ProtectedRoute><AdminParishForm /></ProtectedRoute>} />
          <Route path="/admin/parishes/edit/:id" element={<ProtectedRoute><AdminParishForm /></ProtectedRoute>} />
          <Route path="/admin/stages" element={<ProtectedRoute><AdminStages /></ProtectedRoute>} />
          <Route path="/admin/stages/new" element={<ProtectedRoute><AdminStageForm /></ProtectedRoute>} />
          <Route path="/admin/stages/edit/:id" element={<ProtectedRoute><AdminStageForm /></ProtectedRoute>} />
          <Route path="/admin/camps" element={<ProtectedRoute><AdminCamps /></ProtectedRoute>} />
          <Route path="/admin/camps/new" element={<ProtectedRoute><AdminCampForm /></ProtectedRoute>} />
          <Route path="/admin/camps/edit/:id" element={<ProtectedRoute><AdminCampForm /></ProtectedRoute>} />
          <Route path="/admin/camps/work-teams/:campId" element={<ProtectedRoute><AdminCampWorkTeams /></ProtectedRoute>} />
          <Route path="/admin/camps/badges/:campId" element={<ProtectedRoute><AdminCampBadges /></ProtectedRoute>} />
          <Route path="/admin/camps/dashboard/:campId" element={<ProtectedRoute><AdminCampDashboard /></ProtectedRoute>} />
          <Route path="/admin/camps/registrations/:id" element={<ProtectedRoute><AdminCampRegistrations /></ProtectedRoute>} />
          <Route path="/admin/camps/registrations/:id/new" element={<ProtectedRoute><AdminCampRegistrationForm /></ProtectedRoute>} />
          <Route path="/admin/work-teams" element={<ProtectedRoute><AdminWorkTeams /></ProtectedRoute>} />
          <Route path="/admin/tents" element={<ProtectedRoute><AdminTents /></ProtectedRoute>} />
          <Route path="/admin/tents/new" element={<ProtectedRoute><AdminTentForm /></ProtectedRoute>} />
          <Route path="/admin/tents/edit/:id" element={<ProtectedRoute><AdminTentForm /></ProtectedRoute>} />
          <Route path="/admin/tents/:tentId/participants" element={<ProtectedRoute><AdminTentParticipants /></ProtectedRoute>} />
          <Route path="/admin/tents/:tentId/family/:familyId" element={<ProtectedRoute><AdminTentFamilyForm /></ProtectedRoute>} />
          <Route path="/admin/tents/:tentId/family/add" element={<ProtectedRoute><AdminTentFamilyAdd /></ProtectedRoute>} />
          <Route path="/admin/blog" element={<ProtectedRoute><AdminBlog /></ProtectedRoute>} />
          <Route path="/admin/blog/new" element={<ProtectedRoute><AdminBlogForm /></ProtectedRoute>} />
          <Route path="/admin/blog/edit/:id" element={<ProtectedRoute><AdminBlogForm /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
