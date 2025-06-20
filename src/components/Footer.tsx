import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-tenda-brown text-tenda-beige">
      <div className="max-w-7xl mx-auto px-4 pt-12 pb-8">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/logo_tenda.webp" 
              alt="Comunidade Tenda" 
              className="h-16 w-auto"
            />
          </div>
          <h2 className="text-2xl font-bold text-tenda-beige">Comunidade Tenda</h2>
          <p className="text-tenda-beige/80 mt-2">Ser família em comunhão com Deus e com o próximo</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-serif font-bold mb-4">Contato</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <MapPin size={18} className="mr-2" />
                <span>Paróquia Nossa Senhora da Conceição, Centro</span>
              </div>
              <div className="flex items-center">
                <Phone size={18} className="mr-2" />
                <span>(00) 12345-6789</span>
              </div>
              <div className="flex items-center">
                <Mail size={18} className="mr-2" />
                <span>contato@comunidadetenda.org</span>
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-serif font-bold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:underline">Início</Link></li>
              <li><Link to="/sobre" className="hover:underline">Sobre Nós</Link></li>
              <li><Link to="/acampamentos" className="hover:underline">Acampamentos</Link></li>
              <li><Link to="/galeria" className="hover:underline">Galeria</Link></li>
              <li><Link to="/contato" className="hover:underline">Contato</Link></li>
            </ul>
          </div>
          
          {/* Social Media */}
          <div>
            <h3 className="text-xl font-serif font-bold mb-4">Siga-nos</h3>
            <div className="flex space-x-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-tenda-yellow transition-colors">
                <Facebook size={24} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-tenda-yellow transition-colors">
                <Instagram size={24} />
              </a>
            </div>
            
            <div className="mt-6">
              <h4 className="font-bold mb-2">Inscreva-se para novidades</h4>
              <div className="flex mt-2">
                <input 
                  type="email" 
                  placeholder="Seu email" 
                  className="px-4 py-2 rounded-l text-tenda-brown focus:outline-none"
                />
                <button className="bg-tenda-green hover:bg-tenda-olive text-white px-4 py-2 rounded-r transition-colors">
                  Enviar
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-tenda-olive/30 mt-8 pt-8 text-center">
          <p>© {currentYear} Comunidade Tenda. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
