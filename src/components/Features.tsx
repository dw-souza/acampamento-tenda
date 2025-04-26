
import { Tent, Heart, Users, Cross } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: <Tent size={36} className="text-tenda-green" />,
      title: "Acampamentos",
      description: "Experiências únicas em contato com a natureza, focadas no fortalecimento familiar e espiritual."
    },
    {
      icon: <Heart size={36} className="text-tenda-green" />,
      title: "Família",
      description: "Atividades que promovem a união, o diálogo e o amor entre os membros da família."
    },
    {
      icon: <Users size={36} className="text-tenda-green" />,
      title: "Comunidade",
      description: "Fortalecimento dos laços comunitários e criação de uma rede de apoio entre as famílias."
    },
    {
      icon: <Cross size={36} className="text-tenda-green" />,
      title: "Fé",
      description: "Momentos de oração, reflexão e crescimento espiritual baseados nos valores católicos."
    }
  ];

  return (
    <section className="py-16 bg-tenda-beige">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-tenda-brown mb-3">O Que Fazemos</h2>
          <p className="text-tenda-brown/80 max-w-3xl mx-auto">
            Nossa missão é fortalecer os laços familiares através de experiências significativas de fé e comunhão
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow">
              <div className="flex justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-tenda-brown mb-2">{feature.title}</h3>
              <p className="text-tenda-brown/80">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
