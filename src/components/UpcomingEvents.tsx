
import { Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const events = [
  {
    id: 1,
    title: "Acampamento de Verão",
    date: "15-17 Janeiro, 2025",
    location: "Sítio Santa Fé",
    image: "/placeholder.svg",
    description: "Três dias de conexão familiar, oração e atividades ao ar livre para famílias com crianças de todas as idades."
  },
  {
    id: 2,
    title: "Retiro Familiar de Páscoa",
    date: "10-12 Abril, 2025",
    location: "Recanto dos Anjos",
    image: "/placeholder.svg",
    description: "Uma experiência especial para vivenciar a Páscoa em família, com reflexões sobre renovação e fé."
  },
  {
    id: 3,
    title: "Acampamento de Inverno",
    date: "24-26 Julho, 2025",
    location: "Chácara Esperança",
    image: "/placeholder.svg",
    description: "Aconchego, partilha e fortalecimento dos laços familiares em um ambiente acolhedor durante o inverno."
  }
];

const UpcomingEvents = () => {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-tenda-brown mb-3">Próximos Acampamentos</h2>
          <p className="text-tenda-brown/80 max-w-3xl mx-auto">
            Confira e reserve sua vaga para os próximos encontros da nossa comunidade
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <h3 className="text-xl font-bold text-tenda-brown mb-2">{event.title}</h3>
                
                <div className="flex items-center text-tenda-brown/70 mb-1">
                  <Calendar size={16} className="mr-2" />
                  <span>{event.date}</span>
                </div>
                
                <div className="flex items-center text-tenda-brown/70 mb-3">
                  <MapPin size={16} className="mr-2" />
                  <span>{event.location}</span>
                </div>
                
                <p className="text-tenda-brown/80 mb-4">{event.description}</p>
                
                <Button 
                  asChild 
                  className="w-full bg-tenda-green hover:bg-tenda-olive text-white"
                >
                  <Link to={`/acampamentos/${event.id}`}>
                    Mais Detalhes
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <Button 
            asChild 
            variant="outline"
            className="border-tenda-brown text-tenda-brown hover:bg-tenda-sand"
          >
            <Link to="/acampamentos">
              Ver Todos os Acampamentos
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default UpcomingEvents;
