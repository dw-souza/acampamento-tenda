
import { useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";

const testimonials = [
  {
    id: 1,
    quote: "O acampamento da Comunidade Tenda transformou nossa família. Voltamos mais unidos e com nossa fé fortalecida.",
    author: "Família Silva",
  },
  {
    id: 2,
    quote: "Uma experiência inesquecível para todos nós. As crianças adoraram as atividades e nós, pais, tivemos momentos preciosos de reflexão.",
    author: "Família Oliveira",
  },
  {
    id: 3,
    quote: "Nunca imaginei que um final de semana pudesse impactar tanto nossa forma de ver a família e a fé. Recomendo a todos!",
    author: "Família Santos",
  },
];

const Testimonials = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-16 bg-tenda-sand/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-tenda-brown mb-3">Depoimentos</h2>
          <p className="text-tenda-brown/80 max-w-3xl mx-auto">
            Ouça o que as famílias têm a dizer sobre nossas experiências
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <Quote className="w-12 h-12 text-tenda-green/30 mb-4" />
            <p className="text-xl italic text-tenda-brown mb-6">
              "{testimonials[activeIndex].quote}"
            </p>
            <p className="font-bold text-tenda-brown">— {testimonials[activeIndex].author}</p>
          </div>

          <div className="flex justify-center mt-8 space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={prevTestimonial}
              className="rounded-full border-tenda-brown text-tenda-brown hover:bg-tenda-sand"
            >
              <ChevronLeft className="h-6 w-6" />
              <span className="sr-only">Anterior</span>
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              onClick={nextTestimonial}
              className="rounded-full border-tenda-brown text-tenda-brown hover:bg-tenda-sand"
            >
              <ChevronRight className="h-6 w-6" />
              <span className="sr-only">Próximo</span>
            </Button>
          </div>
          
          <div className="flex justify-center mt-4">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 mx-1 rounded-full ${
                  index === activeIndex ? "bg-tenda-brown" : "bg-tenda-brown/30"
                }`}
                onClick={() => setActiveIndex(index)}
                aria-label={`Ver depoimento ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
