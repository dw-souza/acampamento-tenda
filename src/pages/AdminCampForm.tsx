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
    couple_price: 250.00,
    child_price: 25.00,
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
      const campData = {
        name: formData.name.toUpperCase(),
        stage_id: formData.stage_id,
        parish_id: formData.parish_id,
        start_date: formData.start_date,
        end_date: formData.end_date,
        max_families: formData.max_families,
        couple_price: formData.couple_price,
        child_price: formData.child_price,
        registration_start_date: formData.registration_start_date,
        registration_end_date: formData.registration_end_date,
        status: formData.status,
      };

      if (id) {
        const { error } = await supabase
          .from("camps")
          .update(campData)
          .eq("id", id);

        if (error) throw error;
        toast.success("Acampamento atualizado com sucesso!");
      } else {
        const { error } = await supabase
          .from("camps")
          .insert(campData);

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
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">
            {id ? "Editar Acampamento" : "Novo Acampamento"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome do Acampamento</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stage_id">Etapa</Label>
                  <Select
                    value={formData.stage_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, stage_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a etapa" />
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
                  <Label htmlFor="parish_id">Paróquia</Label>
                  <Select
                    value={formData.parish_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, parish_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a paróquia" />
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Data de Início</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="end_date">Data de Término</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="registration_start_date">
                    Data de Início das Inscrições
                  </Label>
                  <Input
                    id="registration_start_date"
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
                  <Label htmlFor="registration_end_date">
                    Data de Término das Inscrições
                  </Label>
                  <Input
                    id="registration_end_date"
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="max_families">Máximo de Famílias</Label>
                  <Input
                    id="max_families"
                    type="number"
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

                <div>
                  <Label htmlFor="couple_price">Valor por Casal (R$)</Label>
                  <Input
                    id="couple_price"
                    type="number"
                    step="0.01"
                    value={formData.couple_price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        couple_price: parseFloat(e.target.value),
                      })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="child_price">Valor por Filho (R$)</Label>
                  <Input
                    id="child_price"
                    type="number"
                    step="0.01"
                    value={formData.child_price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        child_price: parseFloat(e.target.value),
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Rascunho</SelectItem>
                    <SelectItem value="open">Aberto</SelectItem>
                    <SelectItem value="closed">Fechado</SelectItem>
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
      </div>
    </Layout>
  );
} 