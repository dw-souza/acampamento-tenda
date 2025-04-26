
import Layout from "@/components/Layout";

const About = () => {
  return (
    <Layout>
      <div className="bg-tenda-beige py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-tenda-brown text-center mb-8">
            Sobre a Comunidade Tenda
          </h1>
        </div>
      </div>
      
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg mx-auto">
            <h2 className="text-2xl font-bold text-tenda-brown">Nossa História</h2>
            <p className="text-tenda-brown/80 mb-6">
              A Comunidade Tenda surgiu em 2010, quando um grupo de famílias católicas
              sentiu a necessidade de criar um espaço onde os laços familiares pudessem
              ser fortalecidos através da fé e do convívio com a natureza.
            </p>
            <p className="text-tenda-brown/80 mb-12">
              O nome "Tenda" foi inspirado nas tendas bíblicas, que simbolizam o encontro
              com Deus e o acolhimento. Assim como Deus habitava na Tenda da Reunião no
              meio do povo de Israel, queremos que cada família seja uma tenda onde Deus
              habita e onde os valores cristãos são vividos com alegria.
            </p>
            
            <h2 className="text-2xl font-bold text-tenda-brown">Nossa Missão</h2>
            <p className="text-tenda-brown/80 mb-6">
              Nossa missão é ajudar as famílias a se reconectarem com Deus e entre si,
              através de experiências significativas de fé e comunhão, em um ambiente
              acolhedor e em contato com a natureza.
            </p>
            <p className="text-tenda-brown/80 mb-12">
              Buscamos promover momentos de oração, partilha, formação e lazer que
              fortaleçam os laços familiares e a vivência dos valores cristãos no
              cotidiano das famílias.
            </p>
            
            <h2 className="text-2xl font-bold text-tenda-brown">Nossos Valores</h2>
            <ul className="list-disc pl-6 text-tenda-brown/80 mb-12">
              <li>Família como igreja doméstica e base da sociedade</li>
              <li>Fé católica como fundamento de todas as nossas atividades</li>
              <li>Comunhão e partilha entre as famílias</li>
              <li>Respeito e valorização de cada membro da família</li>
              <li>Simplicidade e contato com a natureza</li>
              <li>Alegria e celebração da vida em família</li>
            </ul>
            
            <h2 className="text-2xl font-bold text-tenda-brown">Nossa Equipe</h2>
            <p className="text-tenda-brown/80 mb-6">
              A Comunidade Tenda é coordenada por um grupo de famílias voluntárias,
              com o apoio espiritual de sacerdotes da diocese. Contamos também com o
              apoio de jovens monitores que auxiliam nas atividades com as crianças
              e adolescentes durante os acampamentos.
            </p>
            <p className="text-tenda-brown/80">
              Todos os membros da equipe são famílias que já participaram de nossos
              acampamentos e sentiram o chamado para servir e ajudar outras famílias
              a viverem esta experiência transformadora.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
