import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { BlogPost } from "@/types";

export default function AdminBlogForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");
  const [tags, setTags] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [readingTime, setReadingTime] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchBlogPost();
    }
  }, [id]);

  const fetchBlogPost = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      const blogPost: BlogPost = data;
      setTitle(blogPost.title);
      setSlug(blogPost.slug);
      setExcerpt(blogPost.excerpt || "");
      setContent(blogPost.content);
      setFeaturedImageUrl(blogPost.featured_image_url || "");
      setAuthorName(blogPost.author_name);
      setStatus(blogPost.status as "draft" | "published" | "archived");
      setTags(blogPost.tags ? blogPost.tags.join(", ") : "");
      setMetaTitle(blogPost.meta_title || "");
      setMetaDescription(blogPost.meta_description || "");
      setReadingTime(blogPost.reading_time || 0);
    } catch (error: any) {
      toast.error("Erro ao carregar post: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const blogData = {
        title,
        slug: slug || title.toLowerCase().replace(/\s+/g, '-'),
        excerpt,
        content,
        featured_image_url: featuredImageUrl,
        author_name: authorName,
        status: status as string, // Cast to string to avoid type error
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        meta_title: metaTitle,
        meta_description: metaDescription,
        reading_time: readingTime,
        published_at: status === 'published' ? new Date().toISOString() : null,
      };

      if (id) {
        const { error } = await supabase
          .from("blog_posts")
          .update(blogData)
          .eq("id", id);

        if (error) throw error;
        toast.success("Post atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from("blog_posts")
          .insert(blogData);

        if (error) throw error;
        toast.success("Post criado com sucesso!");
      }

      navigate("/admin/blog");
    } catch (error: any) {
      toast.error("Erro ao salvar post: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">{id ? "Editar Post" : "Novo Post"}</h1>
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Título</label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Slug</label>
              <Input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Imagem de Destaque URL</label>
              <Input
                type="text"
                value={featuredImageUrl}
                onChange={(e) => setFeaturedImageUrl(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Resumo</label>
              <Textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Conteúdo</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Autor</label>
              <Input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <Select value={status} onValueChange={(value) => setStatus(value as "draft" | "published" | "archived")}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="archived">Arquivado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tags (separadas por vírgula)</label>
              <Input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Meta Título</label>
              <Input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Meta Descrição</label>
              <Textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tempo de Leitura (minutos)</label>
              <Input
                type="number"
                value={readingTime}
                onChange={(e) => setReadingTime(Number(e.target.value))}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
