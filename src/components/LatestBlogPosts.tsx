import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import type { BlogPost } from '../types';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

export default function LatestBlogPosts() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestPosts();
  }, []);

  const fetchLatestPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching latest posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <section className="py-16 bg-tenda-beige/10">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-lg">Carregando posts...</div>
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return null; // Don't show section if no posts
  }

  return (
    <section className="py-16 bg-tenda-beige/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-tenda-brown">Últimas do Blog</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Fique por dentro das novidades, dicas e notícias sobre acampamentos familiares
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {posts.map((post) => (
            <Card key={post.id} className="h-full flex flex-col hover:shadow-lg transition-all duration-300 bg-white overflow-hidden group">
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
                <h3 className="text-xl font-semibold mb-2 line-clamp-2 text-tenda-brown group-hover:text-tenda-brown/80 transition-colors">
                  {post.title}
                </h3>
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
                    {post.tags.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {post.tags.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{post.tags.length - 2}
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

        <div className="text-center">
          <Link to="/blog">
            <Button size="lg" className="bg-tenda-brown hover:bg-tenda-brown/90">
              Ver todos os posts
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
} 