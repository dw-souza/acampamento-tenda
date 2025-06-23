-- Create blog_posts table
CREATE TABLE blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image_url TEXT,
    author_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    published_at TIMESTAMP WITH TIME ZONE,
    meta_title VARCHAR(60),
    meta_description VARCHAR(160),
    tags TEXT[],
    reading_time INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published posts
CREATE POLICY "Public can view published blog posts" ON blog_posts
    FOR SELECT USING (status = 'published');

-- Allow authenticated users to manage blog posts (admin functionality)
CREATE POLICY "Authenticated users can manage blog posts" ON blog_posts
    FOR ALL USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_blog_posts_updated_at 
    BEFORE UPDATE ON blog_posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(
                regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'),
                '\s+', '-', 'g'
            ),
            '-+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Insert some sample blog posts
INSERT INTO blog_posts (
    title, 
    slug, 
    excerpt, 
    content, 
    author_name, 
    status, 
    published_at,
    meta_title,
    meta_description,
    tags,
    reading_time
) VALUES 
(
    'Bem-vindo ao Tenda Família Digital',
    'bem-vindo-ao-tenda-familia-digital',
    'Descubra como nossa plataforma está revolucionando a gestão de acampamentos familiares.',
    '# Bem-vindo ao Tenda Família Digital

Estamos muito felizes em apresentar nossa nova plataforma digital que está transformando a forma como organizamos e gerenciamos acampamentos familiares.

## O que oferecemos

- **Gestão completa de acampamentos**: Desde o planejamento até a execução
- **Sistema de tendas inteligente**: Organização eficiente das famílias
- **Controle de equipes de trabalho**: Distribuição equilibrada de responsabilidades
- **Interface intuitiva**: Fácil de usar para coordenadores e participantes

## Nossa missão

Queremos facilitar a organização de acampamentos que fortaleçam os laços familiares e a fé, proporcionando experiências inesquecíveis para todas as famílias participantes.

*Junte-se a nós nesta jornada!*',
    'Equipe Tenda Família',
    'published',
    NOW(),
    'Bem-vindo ao Tenda Família Digital - Revolucionando Acampamentos',
    'Descubra como nossa plataforma está revolucionando a gestão de acampamentos familiares com tecnologia moderna e interface intuitiva.',
    ARRAY['acampamento', 'família', 'tecnologia', 'organização'],
    3
),
(
    'Dicas para um Acampamento Familiar de Sucesso',
    'dicas-para-um-acampamento-familiar-de-sucesso',
    'Aprenda as melhores práticas para organizar um acampamento familiar memorável e bem-sucedido.',
    '# Dicas para um Acampamento Familiar de Sucesso

Organizar um acampamento familiar pode ser uma experiência gratificante, mas também desafiadora. Aqui estão algumas dicas essenciais para garantir o sucesso do seu evento.

## 1. Planejamento Antecipado

- **Defina objetivos claros**: O que você quer alcançar com o acampamento?
- **Estabeleça datas com antecedência**: Permita tempo suficiente para organização
- **Crie um cronograma detalhado**: Atividades, refeições, momentos de oração

## 2. Organização das Tendas

- **Agrupe famílias compatíveis**: Considere idades das crianças e interesses
- **Distribua responsabilidades**: Cada família pode contribuir com diferentes habilidades
- **Mantenha flexibilidade**: Esteja preparado para ajustes durante o evento

## 3. Atividades para Todas as Idades

- **Crianças**: Jogos, artesanato, contação de histórias
- **Adolescentes**: Esportes, desafios, momentos de socialização
- **Adultos**: Momentos de reflexão, compartilhamento, oração

## 4. Alimentação e Logística

- **Planeje refeições equilibradas**: Considere restrições alimentares
- **Organize equipes de cozinha**: Rotação de responsabilidades
- **Mantenha higiene**: Água potável e limpeza adequada

## 5. Momentos Espirituais

- **Orações em família**: Momentos de intimidade espiritual
- **Celebrações comunitárias**: Missas, adoração, partilha
- **Reflexão pessoal**: Tempo para meditação individual

*Lembre-se: o mais importante é criar memórias que fortaleçam os laços familiares!*',
    'Maria Silva',
    'published',
    NOW() - INTERVAL '2 days',
    'Dicas para Acampamento Familiar - Guia Completo',
    'Descubra as melhores práticas para organizar um acampamento familiar memorável e bem-sucedido com dicas práticas e organização.',
    ARRAY['dicas', 'organização', 'família', 'planejamento'],
    5
),
(
    'A Importância da Tecnologia na Organização de Eventos',
    'a-importancia-da-tecnologia-na-organizacao-de-eventos',
    'Como a digitalização está facilitando a gestão de acampamentos e eventos familiares.',
    '# A Importância da Tecnologia na Organização de Eventos

Nos dias de hoje, a tecnologia se tornou uma aliada fundamental na organização de eventos, especialmente acampamentos familiares. Vamos explorar como ela está transformando nossa forma de trabalhar.

## Benefícios da Digitalização

### 1. Eficiência Operacional
- **Automatização de processos**: Redução de trabalho manual
- **Comunicação instantânea**: Coordenação em tempo real
- **Gestão centralizada**: Tudo em um só lugar

### 2. Melhor Experiência do Usuário
- **Inscrições online**: Processo simplificado para famílias
- **Informações em tempo real**: Atualizações automáticas
- **Acesso mobile**: Conveniência para todos os participantes

### 3. Dados e Analytics
- **Relatórios detalhados**: Insights sobre participação
- **Histórico de eventos**: Aprendizado contínuo
- **Métricas de sucesso**: Avaliação de resultados

## Nossa Plataforma

O Tenda Família Digital foi desenvolvido pensando especificamente nas necessidades de acampamentos familiares:

- **Gestão de tendas**: Organização inteligente das famílias
- **Controle de equipes**: Distribuição equilibrada de tarefas
- **Sistema de inscrições**: Processo simplificado
- **Relatórios**: Análise completa dos eventos

## O Futuro

A tecnologia continuará evoluindo, e estamos comprometidos em acompanhar essas mudanças para oferecer sempre a melhor experiência possível para organizadores e participantes.

*A tecnologia não substitui o contato humano, mas o potencializa!*',
    'João Santos',
    'published',
    NOW() - INTERVAL '5 days',
    'Tecnologia na Organização de Eventos - Tenda Família Digital',
    'Descubra como a tecnologia está revolucionando a organização de acampamentos familiares e eventos com a plataforma Tenda Família Digital.',
    ARRAY['tecnologia', 'digitalização', 'organização', 'eventos'],
    4
); 