import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Mission = () => {
  return (
    <section id="mission" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:flex lg:items-center lg:gap-12">
          <div className="lg:w-1/2">
            <img 
              src="/placeholder.svg" 
              alt="Famílias reunidas em oração" 
              className="rounded-lg shadow-md w-full h-auto object-cover"
            />
          </div>
          
          <div className="mt-8 lg:mt-0 lg:w-1/2">
            <h2 className="text-3xl font-bold text-tenda-brown mb-4">Nossa Missão</h2>
            <p className="text-gray-700 mb-6">
              A Comunidade Tenda nasceu do desejo de fortalecer as famílias através da 
              fé católica e do compartilhamento de experiências em meio à natureza.
            </p>
            <p className="text-gray-700 mb-6">
              Inspirados pela imagem bíblica da tenda, símbolo de encontro com Deus e de 
              acolhimento, buscamos criar um espaço onde as famílias possam se reconectar 
              entre si e com sua espiritualidade.
            </p>
            <p className="text-gray-700">
              Nossos acampamentos são oportunidades para fortalecer os laços familiares, 
              vivenciar momentos de oração e partilha, além de proporcionar atividades 
              recreativas que promovem a união e a alegria.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Mission;
