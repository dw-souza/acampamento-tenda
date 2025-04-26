
import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Mission from "@/components/Mission";
import UpcomingEvents from "@/components/UpcomingEvents";
import Testimonials from "@/components/Testimonials";
import GalleryPreview from "@/components/GalleryPreview";
import RegistrationCTA from "@/components/RegistrationCTA";

const Index = () => {
  return (
    <Layout>
      <Hero />
      <Features />
      <Mission />
      <UpcomingEvents />
      <Testimonials />
      <GalleryPreview />
      <RegistrationCTA />
    </Layout>
  );
};

export default Index;
