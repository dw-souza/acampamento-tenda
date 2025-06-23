import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye, EyeOff, Hash, Clock } from 'lucide-react';
import { supabase } from '../integrations/supabase/client';
import { BlogPost } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useToast } from '../hooks/use-toast';
import Layout from '../components/Layout';
import ImageUpload from '../components/ImageUpload';
import ContentImageUpload from '../components/ContentImageUpload';

export default function AdminBlogForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [newTag, setNewTag] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image_url: '',
    author_name: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    meta_title: '',
    meta_description: '',
    tags: [] as string[],
    reading_time: 0
  });

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  useEffect(() => {
    // Auto-generate slug from title
    if (formData.title && !id) {
      const slug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.title, id]);

  useEffect(() => {
    // Calculate reading time (average 200 words per minute)
    const wordCount = formData.content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);
    setFormData(prev => ({ ...prev, reading_time: readingTime }));
  }, [formData.content]);

  const fetchPost = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          title: data.title || '',
          slug: data.slug || '',
          excerpt: data.excerpt || '',
          content: data.content || '',
          featured_image_url: data.featured_image_url || '',
          author_name: data.author_name || '',
          status: data.status || 'draft',
          meta_title: data.meta_title || '',
          meta_description: data.meta_description || '',
          tags: data.tags || [],
          reading_time: data.reading_time || 0
        });
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar post",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const postData = {
        ...formData,
        published_at: formData.status === 'published' ? new Date().toISOString() : null
      };

      let result;
      if (id) {
        result = await supabase
          .from('blog_posts')
          .update(postData)
          .eq('id', id);
      } else {
        result = await supabase
          .from('blog_posts')
          .insert([postData]);
      }

      if (result.error) throw result.error;

      toast({
        title: "Sucesso",
        description: id ? "Post atualizado com sucesso" : "Post criado com sucesso",
      });

      navigate('/admin/blog');
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar post",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const renderMarkdownPreview = () => {
    let content = formData.content;
    
    // Process paragraphs first - preserve HTML tags
    const paragraphs = content.split(/\n\n/);
    const processedParagraphs = paragraphs.map(p => {
      const trimmed = p.trim();
      if (!trimmed) return '';
      
      // If paragraph contains HTML tags, return as is
      if (/<[^>]+>/.test(trimmed)) {
        return trimmed;
      }
      
      // Process markdown in non-HTML paragraphs
      let processed = trimmed;
      
      // Headers
      processed = processed.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>');
      processed = processed.replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>');
      processed = processed.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>');
      
      // Bold and italic
      processed = processed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      processed = processed.replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      // Imagens markdown
      processed = processed.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="my-4 rounded-lg shadow max-w-full mx-auto" />');
      
      // Lists
      processed = processed.replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>');
      processed = processed.replace(/(<li.*<\/li>)/s, '<ul class="list-disc ml-6 mb-4">$1</ul>');
      
      // Links
      processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>');
      
      return `<p class="mb-4">${processed}</p>`;
    });
    
    return processedParagraphs.join('\n');
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate('/admin/blog')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {id ? 'Editar Post' : 'Novo Post'}
            </h1>
            <p className="text-gray-600">
              {id ? 'Edite as informações do post' : 'Crie um novo post para o blog'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Conteúdo</CardTitle>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPreviewMode(!previewMode)}
                    >
                      {previewMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                      {previewMode ? 'Editar' : 'Visualizar'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Digite o título do post"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="url-do-post"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="excerpt">Resumo</Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => handleInputChange('excerpt', e.target.value)}
                      placeholder="Breve descrição do post"
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="content">Conteúdo *</Label>
                    {!previewMode && (
                      <div className="mb-4">
                        <ContentImageUpload
                          onImageUploaded={(html) => {
                            setFormData(prev => ({
                              ...prev,
                              content: prev.content + `\n\n${html}\n\n`
                            }));
                          }}
                          className="max-w-md"
                        />
                        <span className="text-xs text-gray-500 mt-2 block">
                          Para inserir imagens no conteúdo, faça upload e configure o tamanho. O HTML será inserido automaticamente.
                        </span>
                      </div>
                    )}
                    {previewMode ? (
                      <div 
                        className="border rounded-md p-4 min-h-[400px] max-w-none"
                        style={{ 
                          lineHeight: '1.6',
                          fontSize: '14px'
                        }}
                        dangerouslySetInnerHTML={{ __html: renderMarkdownPreview() }}
                      />
                    ) : (
                      <Textarea
                        id="content"
                        value={formData.content}
                        onChange={(e) => handleInputChange('content', e.target.value)}
                        placeholder="Digite o conteúdo do post (suporte a Markdown e HTML inline)"
                        rows={20}
                        className="font-mono text-sm"
                      />
                    )}
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      Tempo de leitura estimado: {formData.reading_time} minutos
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publish Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Configurações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="author">Autor *</Label>
                    <Input
                      id="author"
                      value={formData.author_name}
                      onChange={(e) => handleInputChange('author_name', e.target.value)}
                      placeholder="Nome do autor"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: 'draft' | 'published' | 'archived') => 
                        handleInputChange('status', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Rascunho</SelectItem>
                        <SelectItem value="published">Publicado</SelectItem>
                        <SelectItem value="archived">Arquivado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="featured_image">Imagem de Destaque</Label>
                    <ImageUpload
                      onImageUploaded={(url) => handleInputChange('featured_image_url', url)}
                      currentImage={formData.featured_image_url}
                      aspectRatio="video"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* SEO Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>SEO</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="meta_title">Meta Título</Label>
                    <Input
                      id="meta_title"
                      value={formData.meta_title}
                      onChange={(e) => handleInputChange('meta_title', e.target.value)}
                      placeholder="Título para SEO (máx. 60 caracteres)"
                      maxLength={60}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {formData.meta_title.length}/60
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="meta_description">Meta Descrição</Label>
                    <Textarea
                      id="meta_description"
                      value={formData.meta_description}
                      onChange={(e) => handleInputChange('meta_description', e.target.value)}
                      placeholder="Descrição para SEO (máx. 160 caracteres)"
                      rows={3}
                      maxLength={160}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      {formData.meta_description.length}/160
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Adicionar tag"
                    />
                    <Button type="button" onClick={addTag} size="sm">
                      <Hash className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-500"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/blog')}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Salvando...' : (id ? 'Atualizar' : 'Criar')}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
} 