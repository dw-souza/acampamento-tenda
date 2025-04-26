
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const RegistrationCTA = () => {
  return (
    <section className="py-16 bg-tenda-green text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Junte-se à Nossa Comunidade
        </h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Inscreva sua família para o próximo acampamento e viva momentos inesquecíveis de fé e união familiar
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button 
            asChild 
            className="bg-white text-tenda-green hover:bg-tenda-beige"
          >
            <Link to="/contato">
              Inscrever-se Agora
            </Link>
          </Button>
          <Button 
            asChild 
            variant="outline"
            className="border-white text-white hover:bg-tenda-olive"
          >
            <Link to="/acampamentos">
              Ver Próximas Datas
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RegistrationCTA;
