import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const RegistrationCTA = () => {
  return (
    <section className="py-16 bg-tenda-green text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Junte-se à Nossa Comunidade
        </h2>
        <p className="text-xl max-w-2xl mx-auto">
          Inscreva sua família para o próximo acampamento e viva momentos inesquecíveis de fé e união familiar
        </p>
      </div>
    </section>
  );
};

export default RegistrationCTA;
