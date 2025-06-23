import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Info, Mail, LogIn, BookOpen } from "lucide-react";

export default function Navbar() {
  const location = useLocation();

  const scrollToMission = () => {
    const missionSection = document.getElementById('mission');
    if (missionSection) {
      missionSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="bg-tenda-brown/95 backdrop-blur-sm border-b border-tenda-brown/20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-20">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <img 
                  src="/logo_tenda.webp" 
                  alt="Comunidade Tenda" 
                  className="h-12 w-auto mr-3"
                />
                <span className="text-xl font-bold text-tenda-beige hidden sm:block">
                  Comunidade Tenda
                </span>
              </Link>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
            <Link 
              to="/" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location.pathname === "/"
                    ? "border-tenda-beige text-tenda-beige"
                    : "border-transparent text-tenda-beige/80 hover:text-tenda-beige hover:border-tenda-beige/50"
                }`}
            >
                <Home className="w-4 h-4 mr-2" />
              Início
            </Link>
            <button
                onClick={scrollToMission}
                className="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium border-transparent text-tenda-beige/80 hover:text-tenda-beige hover:border-tenda-beige/50"
              >
                <Info className="w-4 h-4 mr-2" />
              Nossa Missão
            </button>
            <Link 
                to="/blog"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location.pathname.startsWith("/blog")
                    ? "border-tenda-beige text-tenda-beige"
                    : "border-transparent text-tenda-beige/80 hover:text-tenda-beige hover:border-tenda-beige/50"
                }`}
              >
                <BookOpen className="w-4 h-4 mr-2" />
              Blog
            </Link>
            <Link 
                to="/contact"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location.pathname === "/contact"
                    ? "border-tenda-beige text-tenda-beige"
                    : "border-transparent text-tenda-beige/80 hover:text-tenda-beige hover:border-tenda-beige/50"
                }`}
              >
                <Mail className="w-4 h-4 mr-2" />
              Contato
            </Link>
            </div>
          </div>
          <div className="flex items-center">
            <Link to="/admin">
              <Button 
                size="sm"
                className="flex items-center bg-tenda-beige text-tenda-brown hover:bg-tenda-yellow hover:text-tenda-brown border-0"
              >
                <LogIn className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Admin</span>
                <span className="sm:hidden">Admin</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
