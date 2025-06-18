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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Tables } from "@/integrations/supabase/types";

type Camp = Tables<"camps">;
type Stage = Tables<"stages">;
type Parish = Tables<"parishes">;

export default function AdminCampForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [stages, setStages] = useState<Stage[]>([]);
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    stage_id: "",
    parish_id: "",
    start_date: "",
    end_date: "",
    max_families: 16,
    registration_start_date: "",
    registration_end_date: "",
    status: "draft",
  });

  useEffect(() => {
    fetchStages();
    fetchParishes();
    if (id) {
      fetchCamp();
    }
  }, [id]);

  const fetchStages = async () => {
    try {
      const { data, error } = await supabase
        .from("stages")
        .select("*")
        .order("name");

      if (error) throw error;
      setStages(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar etapas: " + error.message);
    }
  };

  const fetchParishes = async () => {
    try {
      const { data, error } = await supabase
        .from("parishes")
        .select("*")
        .order("name");

      if (error) throw error;
      setParishes(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar paróquias: " + error.message);
    }
  };

  const fetchCamp = async () => {
    try {
      const { data, error } = await supabase
        .from("camps")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setFormData({
        ...data,
        start_date: data.start_date.split("T")[0],
        end_date: data.end_date.split("T")[0],
        registration_start_date: data.registration_start_date.split("T")[0],
        registration_end_date: data.registration_end_date.split("T")[0],
      });
    } catch (error: any) {
      toast.error("Erro ao carregar acampamento: " + error.message);
      navigate("/admin/camps");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        registration_start_date: new Date(formData.registration_start_date).toISOString(),
        registration_end_date: new Date(formData.registration_end_date).toISOString(),
      };

      if (id) {
        const { error } = await supabase
          .from("camps")
          .update(data)
          .eq("id", id);

        if (error) throw error;
        toast.success("Acampamento atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from("camps")
          .insert(data);

        if (error) throw error;
        toast.success("Acampamento criado com sucesso!");
      }

      navigate("/admin/camps");
    } catch (error: any) {
      toast.error("Erro ao salvar acampamento: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            {id ? "Editar Acampamento" : "Novo Acampamento"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome</label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Etapa</label>
              <Select
                value={formData.stage_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, stage_id: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma etapa" />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Paróquia</label>
              <Select
                value={formData.parish_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, parish_id: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma paróquia" />
                </SelectTrigger>
                <SelectContent>
                  {parishes.map((parish) => (
                    <SelectItem key={parish.id} value={parish.id}>
                      {parish.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Data de Início</label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Data de Término</label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Máximo de Famílias</label>
              <Input
                type="number"
                min="1"
                value={formData.max_families}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_families: parseInt(e.target.value),
                  })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">
                  Início das Inscrições
                </label>
                <Input
                  type="date"
                  value={formData.registration_start_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      registration_start_date: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Término das Inscrições
                </label>
                <Input
                  type="date"
                  value={formData.registration_end_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      registration_end_date: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Status</label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Rascunho</SelectItem>
                  <SelectItem value="open">Inscrições Abertas</SelectItem>
                  <SelectItem value="closed">Inscrições Encerradas</SelectItem>
                  <SelectItem value="in_progress">Em Andamento</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/camps")}
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