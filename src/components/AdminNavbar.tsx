import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Users, Church, LogOut, ExternalLink, Layers, Tent } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const AdminNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link to="/admin">
              <Button
                variant={isActive("/admin") ? "default" : "ghost"}
                className="flex items-center"
              >
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link to="/admin/families">
              <Button
                variant={isActive("/admin/families") ? "default" : "ghost"}
                className="flex items-center"
              >
                <Users className="w-4 h-4 mr-2" />
                Famílias
              </Button>
            </Link>
            <Link to="/admin/camps">
              <Button
                variant={isActive("/admin/camps") ? "default" : "ghost"}
                className="flex items-center"
              >
                <Tent className="w-4 h-4 mr-2" />
                Acampamentos
              </Button>
            </Link>
            <Link to="/admin/parishes">
              <Button
                variant={isActive("/admin/parishes") ? "default" : "ghost"}
                className="flex items-center"
              >
                <Church className="w-4 h-4 mr-2" />
                Paróquias
              </Button>
            </Link>
            <Link to="/admin/stages">
              <Button
                variant={isActive("/admin/stages") ? "default" : "ghost"}
                className="flex items-center"
              >
                <Layers className="w-4 h-4 mr-2" />
                Etapas
              </Button>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/" target="_blank">
              <Button
                variant="ghost"
                className="flex items-center text-tenda-brown hover:text-tenda-clay"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver Site
              </Button>
            </Link>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="flex items-center text-red-600 hover:text-red-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar; 