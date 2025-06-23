import Layout from "@/components/Layout";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Mission from "@/components/Mission";
import LatestBlogPosts from "@/components/LatestBlogPosts";
import GalleryPreview from "@/components/GalleryPreview";
import RegistrationCTA from "@/components/RegistrationCTA";

const Index = () => {
  return (
    <Layout>
      <Hero />
      <Features />
      <Mission />
      <LatestBlogPosts />
      <GalleryPreview />
      <RegistrationCTA />
    </Layout>
  );
};

export default Index;
