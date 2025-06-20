import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
    is_camp: false,
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
      const stageData = {
        name: formData.name.toUpperCase(),
        description: formData.description.toUpperCase(),
        is_camp: formData.is_camp,
      };

      if (id) {
        const { error } = await supabase
          .from("stages")
          .update(stageData)
          .eq("id", id);

        if (error) throw error;
        toast.success("Etapa atualizada com sucesso!");
      } else {
        const { error } = await supabase
          .from("stages")
          .insert(stageData);

        if (error) throw error;
        toast.success("Etapa criada com sucesso!");
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
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">
            {id ? "Editar Etapa" : "Nova Etapa"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Etapa</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_camp"
                  checked={formData.is_camp}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, is_camp: checked as boolean }))
                  }
                />
                <Label htmlFor="is_camp" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  É um acampamento
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Marque esta opção se esta etapa é um acampamento. Apenas etapas marcadas como acampamento aparecerão na lista ao criar um novo acampamento.
              </p>
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
      </div>
    </Layout>
  );
} 