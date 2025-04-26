
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const GalleryPreview = () => {
  // Mock image URLs - would be replaced with actual images
  const images = [
    "/placeholder.svg",
    "/placeholder.svg",
    "/placeholder.svg",
    "/placeholder.svg",
    "/placeholder.svg",
    "/placeholder.svg",
  ];
  
  return (
    <section className="py-16 bg-tenda-beige">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-tenda-brown mb-3">Galeria de Momentos</h2>
          <p className="text-tenda-brown/80 max-w-3xl mx-auto">
            Lembranças especiais de nossos acampamentos e encontros em família
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <div 
              key={index} 
              className="relative aspect-square overflow-hidden rounded-md hover:opacity-90 transition-opacity"
            >
              <img 
                src={image} 
                alt={`Memória do acampamento ${index + 1}`} 
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
        
        <div className="text-center mt-10">
          <Button 
            asChild 
            className="bg-tenda-green hover:bg-tenda-olive text-white"
          >
            <Link to="/galeria">
              Ver Galeria Completa
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default GalleryPreview;
