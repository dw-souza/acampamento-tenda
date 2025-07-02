import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Users, Church, LogOut, ExternalLink, Layers, Tent, Users2, Menu, X, BookOpen, Calendar, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export default function AdminNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-tenda-brown/90 border-b border-tenda-brown/20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/admin" className="flex items-center">
                <img 
                  src="/logo_tenda.webp" 
                  alt="Comunidade Tenda" 
                  className="h-10 w-auto mr-3"
                />
                <span className="text-lg sm:text-xl font-bold text-tenda-beige">
                  Comunidade Tenda
                </span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/admin"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location.pathname === "/admin"
                    ? "border-tenda-beige text-tenda-beige"
                    : "border-transparent text-tenda-beige/80 hover:border-tenda-beige/50 hover:text-tenda-beige"
                }`}
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
              <Link
                to="/admin/camps"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location.pathname.startsWith("/admin/camps")
                    ? "border-tenda-beige text-tenda-beige"
                    : "border-transparent text-tenda-beige/80 hover:border-tenda-beige/50 hover:text-tenda-beige"
                }`}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Acampamentos
              </Link>
              <Link
                to="/admin/tents"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location.pathname.startsWith("/admin/tents")
                    ? "border-tenda-beige text-tenda-beige"
                    : "border-transparent text-tenda-beige/80 hover:border-tenda-beige/50 hover:text-tenda-beige"
                }`}
              >
                <Tent className="w-4 h-4 mr-2" />
                Tendas
              </Link>
              <Link
                to="/admin/work-teams"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location.pathname.startsWith("/admin/work-teams")
                    ? "border-tenda-beige text-tenda-beige"
                    : "border-transparent text-tenda-beige/80 hover:border-tenda-beige/50 hover:text-tenda-beige"
                }`}
              >
                <Users2 className="w-4 h-4 mr-2" />
                Equipes
              </Link>
              <Link
                to="/admin/parishes"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location.pathname.startsWith("/admin/parishes")
                    ? "border-tenda-beige text-tenda-beige"
                    : "border-transparent text-tenda-beige/80 hover:border-tenda-beige/50 hover:text-tenda-beige"
                }`}
              >
                <Church className="w-4 h-4 mr-2" />
                Paróquias
              </Link>
              <Link
                to="/admin/stages"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location.pathname.startsWith("/admin/stages")
                    ? "border-tenda-beige text-tenda-beige"
                    : "border-transparent text-tenda-beige/80 hover:border-tenda-beige/50 hover:text-tenda-beige"
                }`}
              >
                <Layers className="w-4 h-4 mr-2" />
                Etapas
              </Link>
              <Link
                to="/admin/blog"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location.pathname.startsWith("/admin/blog")
                    ? "border-tenda-beige text-tenda-beige"
                    : "border-transparent text-tenda-beige/80 hover:border-tenda-beige/50 hover:text-tenda-beige"
                }`}
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Blog
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link to="/" target="_blank" className="hidden sm:block">
              <Button
                variant="ghost"
                className="flex items-center text-tenda-beige hover:text-tenda-yellow"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver Site
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-tenda-beige/80 hover:text-tenda-beige"
            >
              <LogOut className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="sm:hidden text-tenda-beige/80 hover:text-tenda-beige"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden border-t border-tenda-brown/20">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/admin"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === "/admin"
                    ? "bg-tenda-beige text-tenda-brown"
                    : "text-tenda-beige/80 hover:text-tenda-beige hover:bg-tenda-brown/50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home className="w-4 h-4 mr-2 inline" />
                Dashboard
              </Link>
              <Link
                to="/admin/camps"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname.startsWith("/admin/camps")
                    ? "bg-tenda-beige text-tenda-brown"
                    : "text-tenda-beige/80 hover:text-tenda-beige hover:bg-tenda-brown/50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Calendar className="w-4 h-4 mr-2 inline" />
                Acampamentos
              </Link>
              <Link
                to="/admin/tents"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname.startsWith("/admin/tents")
                    ? "bg-tenda-beige text-tenda-brown"
                    : "text-tenda-beige/80 hover:text-tenda-beige hover:bg-tenda-brown/50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Tent className="w-4 h-4 mr-2 inline" />
                Tendas
              </Link>
              <Link
                to="/admin/work-teams"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname.startsWith("/admin/work-teams")
                    ? "bg-tenda-beige text-tenda-brown"
                    : "text-tenda-beige/80 hover:text-tenda-beige hover:bg-tenda-brown/50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Users2 className="w-4 h-4 mr-2 inline" />
                Equipes
              </Link>
              <Link
                to="/admin/parishes"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname.startsWith("/admin/parishes")
                    ? "bg-tenda-beige text-tenda-brown"
                    : "text-tenda-beige/80 hover:text-tenda-beige hover:bg-tenda-brown/50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Church className="w-4 h-4 mr-2 inline" />
                Paróquias
              </Link>
              <Link
                to="/admin/stages"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname.startsWith("/admin/stages")
                    ? "bg-tenda-beige text-tenda-brown"
                    : "text-tenda-beige/80 hover:text-tenda-beige hover:bg-tenda-brown/50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Layers className="w-4 h-4 mr-2 inline" />
                Etapas
              </Link>
              <Link
                to="/admin/blog"
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname.startsWith("/admin/blog")
                    ? "bg-tenda-beige text-tenda-brown"
                    : "text-tenda-beige/80 hover:text-tenda-beige hover:bg-tenda-brown/50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <BookOpen className="w-4 h-4 mr-2 inline" />
                Blog
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 