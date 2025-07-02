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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Tables } from "@/integrations/supabase/types";
import { Plus, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

type Camp = Tables<"camps"> & {
  stages: Tables<"stages">;
  camp_parishes: {
    parishes: Tables<"parishes">;
  }[];
};

type Parish = Tables<"parishes">;
type Stage = Tables<"stages">;

type Tent = Tables<"tents"> & {
  parishes: Parish;
  stages: Stage;
};

export default function AdminTentForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [tent, setTent] = useState<Tent | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [guardianHusbandName, setGuardianHusbandName] = useState("");
  const [guardianWifeName, setGuardianWifeName] = useState("");
  const [parishId, setParishId] = useState("");
  const [stageId, setStageId] = useState<string | null>(null);
  const [formationDate, setFormationDate] = useState("");
  const [meetingDate, setMeetingDate] = useState<string | null>(null);
  const [meetingLocation, setMeetingLocation] = useState<string | null>("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: tentData, error: tentError } = id
        ? await supabase
            .from("tents")
            .select(`*, parishes (*), stages (*)`)
            .eq("id", id)
            .single()
        : { data: null, error: null };

      if (tentError) throw tentError;

      if (tentData) {
        setTent(tentData);
        setName(tentData.name);
        setGuardianHusbandName(tentData.guardian_husband_name);
        setGuardianWifeName(tentData.guardian_wife_name);
        setParishId(tentData.parish_id);
        setStageId(tentData.stage_id);
        setFormationDate(tentData.formation_date);
        setMeetingDate(tentData.meeting_date || null);
        setMeetingLocation(tentData.meeting_location || "");
        setStatus(tentData.status as "active" | "inactive");
      }

      const { data: parishesData, error: parishesError } = await supabase
        .from("parishes")
        .select("*");

      if (parishesError) throw parishesError;
      setParishes(parishesData || []);

      const { data: stagesData, error: stagesError } = await supabase
        .from("stages")
        .select("*");

      if (stagesError) throw stagesError;
      setStages(stagesData || []);
    } catch (error: any) {
      toast.error("Erro ao carregar dados: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tentData = {
        name: name.toUpperCase(),
        guardian_husband_name: guardianHusbandName.toUpperCase(),
        guardian_wife_name: guardianWifeName.toUpperCase(),
        parish_id: parishId,
        stage_id: stageId || null,
        formation_date: formationDate,
        meeting_date: meetingDate || null,
        meeting_location: meetingLocation?.toUpperCase(),
        status: status as string, // Cast to string
      };

      if (id) {
        const { error } = await supabase
          .from("tents")
          .update(tentData)
          .eq("id", id);

        if (error) throw error;
        toast.success("Tenda atualizada com sucesso!");
      } else {
        const { error } = await supabase.from("tents").insert(tentData);
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

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <p>Carregando...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              {id ? "Editar Tenda" : "Nova Tenda"}
            </h1>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Dados da Tenda</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nome
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Casal Guardião
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Nome do Esposo"
                      value={guardianHusbandName}
                      onChange={(e) => setGuardianHusbandName(e.target.value)}
                      required
                    />
                    <Input
                      placeholder="Nome da Esposa"
                      value={guardianWifeName}
                      onChange={(e) => setGuardianWifeName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Paróquia
                  </label>
                  <Select
                    value={parishId}
                    onValueChange={(value) => setParishId(value)}
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
                  <label className="block text-sm font-medium text-gray-700">
                    Etapa
                  </label>
                  <Select
                    value={stageId || ""}
                    onValueChange={(value) => setStageId(value)}
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
                  <label className="block text-sm font-medium text-gray-700">
                    Data de Formação
                  </label>
                  <Input
                    type="date"
                    value={formationDate}
                    onChange={(e) => setFormationDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Data da Reunião
                  </label>
                  <Input
                    type="date"
                    value={meetingDate || ""}
                    onChange={(e) => setMeetingDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Local da Reunião
                  </label>
                  <Input
                    value={meetingLocation || ""}
                    onChange={(e) => setMeetingLocation(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <Select
                    value={status}
                    onValueChange={(value) =>
                      setStatus(value as "active" | "inactive")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1">
                Salvar Tenda
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin/tents")}
              >
                Voltar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
