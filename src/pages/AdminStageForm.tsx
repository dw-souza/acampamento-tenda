import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Tables } from "@/integrations/supabase/types";

type Stage = Tables<"stages">;

export default function AdminStageForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Stage>>({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (id) {
      fetchStage();
    }
  }, [id]);

  const fetchStage = async () => {
    try {
      const { data, error } = await supabase
        .from("stages")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData(data);
      }
    } catch (error: any) {
      toast.error("Erro ao carregar etapa: " + error.message);
      navigate("/admin/stages");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id) {
        const { error } = await supabase
          .from("stages")
          .update(formData)
          .eq("id", id);

        if (error) throw error;
        toast.success("Etapa atualizada com sucesso!");
      } else {
        const { error } = await supabase.from("stages").insert({
          name: formData.name!,
          description: formData.description,
        });

        if (error) throw error;
        toast.success("Etapa cadastrada com sucesso!");
      }

      navigate("/admin/stages");
    } catch (error: any) {
      toast.error("Erro ao salvar etapa: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            {id ? "Editar Etapa" : "Nova Etapa"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome da Etapa</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <Textarea
                name="description"
                value={formData.description || ""}
                onChange={handleInputChange}
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/stages")}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
} 