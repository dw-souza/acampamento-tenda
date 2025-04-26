
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-tenda-beige shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-tenda-brown font-serif font-bold text-xl">Comunidade Tenda</span>
            </Link>
          </div>
          
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
            <Link to="/" className="px-3 py-2 text-tenda-brown hover:text-tenda-clay font-medium">Início</Link>
            <Link to="/sobre" className="px-3 py-2 text-tenda-brown hover:text-tenda-clay font-medium">Sobre</Link>
            <Link to="/acampamentos" className="px-3 py-2 text-tenda-brown hover:text-tenda-clay font-medium">Acampamentos</Link>
            <Link to="/galeria" className="px-3 py-2 text-tenda-brown hover:text-tenda-clay font-medium">Galeria</Link>
            <Link to="/contato" className="px-3 py-2 text-tenda-brown hover:text-tenda-clay font-medium">Contato</Link>
          </div>
          
          <div className="flex items-center md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-tenda-brown hover:text-tenda-clay focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-tenda-beige">
            <Link 
              to="/" 
              className="block px-3 py-2 rounded-md text-base font-medium text-tenda-brown hover:bg-tenda-sand"
              onClick={() => setIsMenuOpen(false)}
            >
              Início
            </Link>
            <Link 
              to="/sobre" 
              className="block px-3 py-2 rounded-md text-base font-medium text-tenda-brown hover:bg-tenda-sand"
              onClick={() => setIsMenuOpen(false)}
            >
              Sobre
            </Link>
            <Link 
              to="/acampamentos" 
              className="block px-3 py-2 rounded-md text-base font-medium text-tenda-brown hover:bg-tenda-sand"
              onClick={() => setIsMenuOpen(false)}
            >
              Acampamentos
            </Link>
            <Link 
              to="/galeria" 
              className="block px-3 py-2 rounded-md text-base font-medium text-tenda-brown hover:bg-tenda-sand"
              onClick={() => setIsMenuOpen(false)}
            >
              Galeria
            </Link>
            <Link 
              to="/contato" 
              className="block px-3 py-2 rounded-md text-base font-medium text-tenda-brown hover:bg-tenda-sand"
              onClick={() => setIsMenuOpen(false)}
            >
              Contato
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
