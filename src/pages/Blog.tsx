import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, Clock, User, Tag, ArrowRight } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import type { BlogPost } from '../types';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import Layout from '../components/Layout';

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (error) throw error;

      setPosts(data || []);
      
      // Extract unique tags
      const tags = new Set<string>();
      data?.forEach(post => {
        post.tags?.forEach(tag => tags.add(tag));
      });
      setAllTags(Array.from(tags));
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTag = !selectedTag || post.tags?.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderMarkdownContent = (content: string) => {
    // Simple markdown rendering
    let rendered = content;
    
    // Headers
    rendered = rendered.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>');
    rendered = rendered.replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>');
    rendered = rendered.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>');
    
    // Bold and italic
    rendered = rendered.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    rendered = rendered.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Lists
    rendered = rendered.replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>');
    rendered = rendered.replace(/(<li.*<\/li>)/s, '<ul class="list-disc ml-6 mb-4">$1</ul>');
    
    // Paragraphs
    rendered = rendered.replace(/\n\n/g, '</p><p class="mb-4">');
    rendered = `<p class="mb-4">${rendered}</p>`;
    
    return rendered;
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Carregando posts...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Blog</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Artigos, notícias e dicas sobre acampamentos familiares e organização de eventos
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedTag === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTag('')}
              >
                Todos
              </Button>
              {allTags.map(tag => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTag(tag)}
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Posts Grid */}
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Card key={post.id} className="h-full flex flex-col hover:shadow-lg transition-all duration-300 overflow-hidden group">
                {post.featured_image_url ? (
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <img
                      src={post.featured_image_url}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                ) : (
                  <div className="aspect-[4/3] bg-gradient-to-br from-tenda-beige/30 to-tenda-brown/30 flex items-center justify-center relative overflow-hidden">
                    <div className="text-center text-gray-400 z-10">
                      <div className="text-4xl mb-2">📝</div>
                      <div className="text-sm font-medium">Sem imagem</div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-tenda-beige/10 to-tenda-brown/10" />
                  </div>
                )}
                <CardHeader className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <User className="w-4 h-4" />
                    {post.author_name}
                  </div>
                  <h2 className="text-xl font-semibold mb-2 line-clamp-2 group-hover:text-tenda-brown/80 transition-colors">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-gray-600 line-clamp-3 mb-4">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(post.published_at || post.created_at)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {post.reading_time || 'N/A'} min
                    </div>
                  </div>
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {post.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{post.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <Link to={`/blog/${post.slug}`}>
                    <Button className="w-full group-hover:bg-tenda-brown group-hover:text-white transition-colors" variant="outline">
                      Ler mais
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              {searchTerm || selectedTag 
                ? 'Nenhum post encontrado para sua busca.' 
                : 'Nenhum post publicado ainda.'}
            </div>
            {(searchTerm || selectedTag) && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedTag('');
                }}
              >
                Limpar filtros
              </Button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
} 