import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, User, Tag, Share2 } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import type { BlogPost } from '../types';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import Layout from '../components/Layout';

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;

      setPost(data);
      
      // Fetch related posts (same tags or recent posts)
      if (data?.tags && data.tags.length > 0) {
        const { data: related } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('status', 'published')
          .neq('id', data.id)
          .overlaps('tags', data.tags)
          .order('published_at', { ascending: false })
          .limit(3);

        if (related && related.length > 0) {
          setRelatedPosts(related);
        } else {
          // If no related posts by tags, get recent posts
          const { data: recent } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('status', 'published')
            .neq('id', data.id)
            .order('published_at', { ascending: false })
            .limit(3);

          setRelatedPosts(recent || []);
        }
      }
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderMarkdownContent = (content: string) => {
    // Enhanced markdown rendering with HTML support
    let rendered = content;
    
    // Headers
    rendered = rendered.replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-8 mb-4 text-gray-800">$1</h3>');
    rendered = rendered.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-10 mb-6 text-gray-900">$1</h2>');
    rendered = rendered.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-12 mb-8 text-gray-900">$1</h1>');
    
    // Bold and italic
    rendered = rendered.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
    rendered = rendered.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    
    // Imagens markdown ![alt](url) - convert to HTML
    rendered = rendered.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="my-6 rounded-lg shadow max-w-full mx-auto" />');
    
    // Lists
    rendered = rendered.replace(/^- (.*$)/gim, '<li class="ml-6 mb-2">$1</li>');
    rendered = rendered.replace(/(<li.*<\/li>)/s, '<ul class="list-disc mb-6 space-y-2">$1</ul>');
    
    // Code blocks
    rendered = rendered.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto my-6"><code>$1</code></pre>');
    rendered = rendered.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm">$1</code>');
    
    // Links
    rendered = rendered.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Paragraphs - but preserve HTML tags
    const paragraphs = rendered.split(/\n\n/);
    const processedParagraphs = paragraphs.map(p => {
      // If paragraph contains HTML tags, don't wrap in <p>
      if (/<[^>]+>/.test(p.trim())) {
        return p.trim();
      }
      return `<p class="mb-6 leading-relaxed">${p.trim()}</p>`;
    });
    
    return processedParagraphs.join('\n');
  };

  const sharePost = () => {
    if (navigator.share && post) {
      navigator.share({
        title: post.title,
        text: post.excerpt || post.title,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copiado para a área de transferência!');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Carregando post...</div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Post não encontrado</h1>
            <p className="text-gray-600 mb-6">O post que você está procurando não existe ou foi removido.</p>
            <Link to="/blog">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar ao Blog
              </Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link to="/blog">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao Blog
            </Button>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            {post.featured_image_url && (
              <div className="aspect-[16/9] overflow-hidden rounded-lg mb-8 shadow-lg">
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}

            <h1 className="text-4xl font-bold mb-4 text-gray-900">{post.title}</h1>
            
            {post.excerpt && (
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                {post.excerpt}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {post.author_name}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(post.published_at || post.created_at)}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {post.reading_time || 'N/A'} min de leitura
              </div>
              <Button variant="outline" size="sm" onClick={sharePost}>
                <Share2 className="w-4 h-4 mr-2" />
                Compartilhar
              </Button>
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none mb-12">
            <div 
              className="text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: renderMarkdownContent(post.content) }}
            />
          </div>

          {/* Author Info */}
          <Card className="mb-12">
            <CardHeader>
              <h3 className="text-lg font-semibold">Sobre o autor</h3>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium">{post.author_name}</p>
                  <p className="text-sm text-gray-600">
                    Contribuiu com artigos sobre acampamentos familiares e organização de eventos.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Posts relacionados</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Card key={relatedPost.id} className="h-full flex flex-col hover:shadow-lg transition-all duration-300 overflow-hidden group">
                    {relatedPost.featured_image_url ? (
                      <div className="aspect-[4/3] overflow-hidden relative">
                        <img
                          src={relatedPost.featured_image_url}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    ) : (
                      <div className="aspect-[4/3] bg-gradient-to-br from-tenda-beige/30 to-tenda-brown/30 flex items-center justify-center relative overflow-hidden">
                        <div className="text-center text-gray-400 z-10">
                          <div className="text-3xl mb-1">📝</div>
                          <div className="text-xs font-medium">Sem imagem</div>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-br from-tenda-beige/10 to-tenda-brown/10" />
                      </div>
                    )}
                    <CardHeader className="flex-1">
                      <h3 className="text-lg font-semibold mb-2 line-clamp-2 group-hover:text-tenda-brown/80 transition-colors">
                        {relatedPost.title}
                      </h3>
                      {relatedPost.excerpt && (
                        <p className="text-gray-600 line-clamp-3 mb-4 text-sm">
                          {relatedPost.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {formatDate(relatedPost.published_at || relatedPost.created_at)}
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Link to={`/blog/${relatedPost.slug}`}>
                        <Button className="w-full group-hover:bg-tenda-brown group-hover:text-white transition-colors" variant="outline" size="sm">
                          Ler mais
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 