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
import { formatDateForInput } from "@/lib/utils";

type Tent = Tables<"tents">;
type Parish = Tables<"parishes">;
type Stage = Tables<"stages">;

export default function AdminTentForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    formation_date: "",
    guardian_husband_name: "",
    guardian_wife_name: "",
    parish_id: "",
    stage_id: "",
    meeting_date: "",
    meeting_location: "",
    status: "active" as "active" | "inactive" | "disbanded",
  });

  useEffect(() => {
    fetchParishes();
    fetchStages();
    if (id) {
      fetchTent();
    }
  }, [id]);

  const fetchParishes = async () => {
    try {
      const { data, error } = await supabase
        .from("parishes")
        .select("*")
        .eq("status", "active")
        .order("name");

      if (error) throw error;
      setParishes(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar paróquias: " + error.message);
    }
  };

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

  const fetchTent = async () => {
    try {
      const { data, error } = await supabase
        .from("tents")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setFormData({
        name: data.name || "",
        formation_date: formatDateForInput(data.formation_date),
        guardian_husband_name: data.guardian_husband_name || "",
        guardian_wife_name: data.guardian_wife_name || "",
        parish_id: data.parish_id || "",
        stage_id: data.stage_id || "",
        meeting_date: formatDateForInput(data.meeting_date),
        meeting_location: data.meeting_location || "",
        status: data.status || "active",
      });
    } catch (error: any) {
      toast.error("Erro ao carregar tenda: " + error.message);
      navigate("/admin/tents");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tentData = {
        name: formData.name.toUpperCase(),
        formation_date: formData.formation_date,
        guardian_husband_name: formData.guardian_husband_name.toUpperCase(),
        guardian_wife_name: formData.guardian_wife_name.toUpperCase(),
        parish_id: formData.parish_id,
        stage_id: formData.stage_id || null,
        meeting_date: formData.meeting_date || null,
        meeting_location: formData.meeting_location ? formData.meeting_location.toUpperCase() : null,
        status: formData.status,
      };

      if (id) {
        // Atualizar tenda existente
        const { error } = await supabase
          .from("tents")
          .update(tentData)
          .eq("id", id);

        if (error) throw error;
        toast.success("Tenda atualizada com sucesso!");
      } else {
        // Criar nova tenda
        const { error } = await supabase
          .from("tents")
          .insert(tentData);

        if (error) throw error;
        toast.success("Tenda criada com sucesso!");
      }

      navigate("/admin/tents");
    } catch (error: any) {
      toast.error("Erro ao salvar tenda: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">
            {id ? "Editar Tenda" : "Nova Tenda"}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Tenda</Label>
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
                  <Label htmlFor="guardian_husband_name">Nome do Guardião (Esposo)</Label>
                  <Input
                    id="guardian_husband_name"
                    value={formData.guardian_husband_name}
                    onChange={(e) =>
                      setFormData({ ...formData, guardian_husband_name: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="guardian_wife_name">Nome da Guardiã (Esposa)</Label>
                  <Input
                    id="guardian_wife_name"
                    value={formData.guardian_wife_name}
                    onChange={(e) =>
                      setFormData({ ...formData, guardian_wife_name: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="formation_date">Data de Formação</Label>
                  <Input
                    id="formation_date"
                    type="date"
                    value={formData.formation_date}
                    onChange={(e) =>
                      setFormData({ ...formData, formation_date: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="meeting_date">Data da Reunião</Label>
                  <Input
                    id="meeting_date"
                    type="date"
                    value={formData.meeting_date}
                    onChange={(e) =>
                      setFormData({ ...formData, meeting_date: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="meeting_location">Local da Reunião</Label>
                <Input
                  id="meeting_location"
                  value={formData.meeting_location}
                  onChange={(e) =>
                    setFormData({ ...formData, meeting_location: e.target.value })
                  }
                  placeholder="Ex: Salão da paróquia, Casa dos guardiões..."
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "active" | "inactive" | "disbanded") =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativa</SelectItem>
                    <SelectItem value="inactive">Inativa</SelectItem>
                    <SelectItem value="disbanded">Dissolvida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/tents")}
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