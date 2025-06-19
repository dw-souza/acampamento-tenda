import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Info, Tent, Mail, LogIn } from "lucide-react";

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-20">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-tenda-brown">
                Tenda Família Digital
            </Link>
          </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
            <Link 
              to="/" 
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location.pathname === "/"
                    ? "border-tenda-brown text-tenda-brown"
                    : "border-transparent text-gray-600 hover:text-tenda-brown hover:border-tenda-brown/50"
                }`}
            >
                <Home className="w-4 h-4 mr-2" />
              Início
            </Link>
            <Link 
                to="/about"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location.pathname === "/about"
                    ? "border-tenda-brown text-tenda-brown"
                    : "border-transparent text-gray-600 hover:text-tenda-brown hover:border-tenda-brown/50"
                }`}
              >
                <Info className="w-4 h-4 mr-2" />
              Sobre
            </Link>
            <Link 
                to="/camps"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location.pathname === "/camps"
                    ? "border-tenda-brown text-tenda-brown"
                    : "border-transparent text-gray-600 hover:text-tenda-brown hover:border-tenda-brown/50"
                }`}
              >
                <Tent className="w-4 h-4 mr-2" />
              Acampamentos
            </Link>
            <Link 
                to="/contact"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  location.pathname === "/contact"
                    ? "border-tenda-brown text-tenda-brown"
                    : "border-transparent text-gray-600 hover:text-tenda-brown hover:border-tenda-brown/50"
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
                variant="outline" 
                className="flex items-center text-tenda-brown border-tenda-brown hover:bg-tenda-brown hover:text-white"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Área Administrativa
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
