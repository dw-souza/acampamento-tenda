import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="hero-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <div className="bg-tenda-brown/95 p-6 rounded-2xl shadow-xl backdrop-blur-sm border border-tenda-brown/20">
              <img 
                src="/logo_tenda.webp" 
                alt="Comunidade Tenda" 
                className="h-20 md:h-28 w-auto"
              />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-tenda-brown mb-6">
            Comunidade Tenda
          </h1>
          <p className="text-xl md:text-2xl text-tenda-brown/80 max-w-3xl mx-auto">
            Ser família em comunhão com Deus e com o próximo
          </p>
        </div>
      </div>
    </div>
  );
};

export default Hero;
