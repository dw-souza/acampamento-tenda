
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="hero-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-tenda-brown mb-6">
            Comunidade Tenda
          </h1>
          <p className="text-xl md:text-2xl text-tenda-brown/80 mb-8 max-w-3xl mx-auto">
            Fortalecendo famílias através da fé e da comunhão em acampamentos que transformam vidas
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              asChild 
              className="bg-tenda-green hover:bg-tenda-olive text-white px-8 py-3 rounded-md text-lg"
            >
              <Link to="/acampamentos">
                Próximos Acampamentos
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline"
              className="border-tenda-brown text-tenda-brown hover:bg-tenda-sand px-8 py-3 rounded-md text-lg"
            >
              <Link to="/sobre">
                Conheça Nossa Missão
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
