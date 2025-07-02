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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Tables } from "@/integrations/supabase/types";
import { formatDateForInput } from "@/lib/utils";

type Camp = Tables<"camps">;
type Stage = Tables<"stages">;
type Parish = Tables<"parishes">;
type Tent = Tables<"tents"> & {
  parishes: Tables<"parishes">;
};

export default function AdminCampForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [stages, setStages] = useState<Stage[]>([]);
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [tents, setTents] = useState<Tent[]>([]);
  const [selectedParishes, setSelectedParishes] = useState<string[]>([]);
  const [selectedTents, setSelectedTents] = useState<string[]>([]);
  const [isKerigmaStage, setIsKerigmaStage] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    stage_id: "",
    start_date: "",
    end_date: "",
    max_families: 16,
    registration_start_date: "",
    registration_end_date: "",
    status: "draft",
    couple_price: 250.00,
    child_price: 25.00,
  });

  // Verificar se a etapa selecionada é Kergima
  const checkIfKergimaStage = (stageId: string) => {
    const selectedStage = stages.find(stage => stage.id === stageId);
    const isKerigma = selectedStage?.name?.toLowerCase().includes('kergima') || 
                     selectedStage?.name?.toLowerCase().includes('kerigma');
    setIsKerigmaStage(isKerigma);
    
    // Se não for Kergima, limpar datas de inscrição
    if (!isKerigma) {
      setFormData(prev => ({
        ...prev,
        registration_start_date: "",
        registration_end_date: "",
        max_families: 0
      }));
    }
  };

  useEffect(() => {
    fetchStages();
    fetchParishes();
    fetchTents();
    if (id) {
      fetchCamp();
    }
  }, [id]);

  // Verificar se é Kergima quando a etapa muda
  useEffect(() => {
    if (formData.stage_id) {
      checkIfKergimaStage(formData.stage_id);
    }
  }, [formData.stage_id, stages]);

  const fetchStages = async () => {
    try {
      const { data, error } = await supabase
        .from("stages")
        .select("*")
        .eq("is_camp", true)
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

  const fetchTents = async () => {
    try {
      const { data, error } = await supabase
        .from("tents")
        .select(`
          *,
          parishes (*)
        `)
        .eq("status", "active")
        .order("name");

      if (error) throw error;
      setTents(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar tendas: " + error.message);
    }
  };

  const fetchCamp = async () => {
    try {
      const { data, error } = await supabase
        .from("camps")
        .select(`
          *,
          camp_parishes (
            parish_id
          ),
          camp_tents (
            tent_id
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      setFormData({
        name: data.name || "",
        stage_id: data.stage_id || "",
        start_date: formatDateForInput(data.start_date),
        end_date: formatDateForInput(data.end_date),
        max_families: data.max_families || 0,
        couple_price: data.couple_price || 250.00,
        child_price: data.child_price || 25.00,
        registration_start_date: formatDateForInput(data.registration_start_date),
        registration_end_date: formatDateForInput(data.registration_end_date),
        status: data.status || "active",
      });

      // Verificar se é Kergima
      checkIfKergimaStage(data.stage_id);

      // Extrair IDs das paróquias selecionadas
      const parishIds = data.camp_parishes?.map((cp: any) => cp.parish_id) || [];
      setSelectedParishes(parishIds);

      // Extrair IDs das tendas selecionadas
      const tentIds = data.camp_tents?.map((ct: any) => ct.tent_id) || [];
      setSelectedTents(tentIds);
    } catch (error: any) {
      toast.error("Erro ao carregar acampamento: " + error.message);
      navigate("/admin/camps");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar e limpar IDs vazios antes de salvar
      const cleanSelectedParishes = selectedParishes.filter(id => id && id.trim() !== '');
      const cleanSelectedTents = selectedTents.filter(id => id && id.trim() !== '');

      console.log('Original selectedParishes:', selectedParishes);
      console.log('Original selectedTents:', selectedTents);
      console.log('Clean selectedParishes:', cleanSelectedParishes);
      console.log('Clean selectedTents:', cleanSelectedTents);

      const campData = {
        name: formData.name.toUpperCase(),
        stage_id: formData.stage_id,
        start_date: formData.start_date,
        end_date: formData.end_date,
        max_families: isKerigmaStage ? formData.max_families : 0,
        couple_price: formData.couple_price,
        child_price: formData.child_price,
        registration_start_date: isKerigmaStage ? formData.registration_start_date : null,
        registration_end_date: isKerigmaStage ? formData.registration_end_date : null,
        status: formData.status,
      };

      if (id) {
        // Atualizar acampamento
        const { error: campError } = await supabase
          .from("camps")
          .update(campData)
          .eq("id", id);

        if (campError) throw campError;

        if (isKerigmaStage) {
          // Remover relacionamentos existentes de paróquias
          await supabase
            .from("camp_parishes")
            .delete()
            .eq("camp_id", id);

          // Inserir novos relacionamentos com paróquias
          if (cleanSelectedParishes.length > 0) {
            const parishRelations = cleanSelectedParishes.map(parishId => ({
              camp_id: id,
              parish_id: parishId
            }));

            const { error: parishError } = await supabase
              .from("camp_parishes")
              .insert(parishRelations);

            if (parishError) throw parishError;
          }
        } else {
          // Remover relacionamentos existentes de tendas
          await supabase
            .from("camp_tents")
            .delete()
            .eq("camp_id", id);

          // Inserir novos relacionamentos com tendas
          if (cleanSelectedTents.length > 0) {
            const tentRelations = cleanSelectedTents
              .map(tentId => ({
                camp_id: id,
                tent_id: tentId
              }));

            if (tentRelations.length > 0) {
              const { error: tentError } = await supabase
                .from("camp_tents")
                .insert(tentRelations);

              if (tentError) throw tentError;
            }
          }
        }

        toast.success("Acampamento atualizado com sucesso!");
      } else {
        // Criar novo acampamento
        const { data: newCamp, error: campError } = await supabase
          .from("camps")
          .insert(campData)
          .select()
          .single();

        if (campError) throw campError;

        if (isKerigmaStage) {
          // Inserir relacionamentos com paróquias
          if (cleanSelectedParishes.length > 0) {
            const parishRelations = cleanSelectedParishes.map(parishId => ({
              camp_id: newCamp.id,
              parish_id: parishId
            }));

            const { error: parishError } = await supabase
              .from("camp_parishes")
              .insert(parishRelations);

            if (parishError) throw parishError;
          }
        } else {
          // Inserir relacionamentos com tendas
          if (cleanSelectedTents.length > 0) {
            const tentRelations = cleanSelectedTents
              .map(tentId => ({
                camp_id: newCamp.id,
                tent_id: tentId
              }));

            if (tentRelations.length > 0) {
              const { error: tentError } = await supabase
                .from("camp_tents")
                .insert(tentRelations);

              if (tentError) throw tentError;
            }
          }
        }

        toast.success("Acampamento criado com sucesso!");
      }

      navigate("/admin/camps");
    } catch (error: any) {
      toast.error("Erro ao salvar acampamento: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleParishToggle = (parishId: string, checked: boolean | "indeterminate") => {
    // Garantir que parishId não seja vazio
    if (!parishId || parishId.trim() === '') {
      console.warn('Parish ID is empty, skipping toggle');
      return;
    }

    if (checked === true) {
      setSelectedParishes(prev => 
        prev.includes(parishId) ? prev : [...prev, parishId]
      );
    } else {
      setSelectedParishes(prev => 
        prev.filter(id => id !== parishId && id.trim() !== '')
      );
    }
  };

  const handleTentToggle = (tentId: string, checked: boolean | "indeterminate") => {
    console.log('handleTentToggle called with:', { tentId, checked });
    
    // Garantir que tentId não seja vazio
    if (!tentId || tentId.trim() === '') {
      console.warn('Tent ID is empty, skipping toggle');
      return;
    }

    if (checked === true) {
      setSelectedTents(prev => {
        const newSelection = prev.includes(tentId) ? prev : [...prev, tentId];
        console.log('Adding tent, new selection:', newSelection);
        return newSelection;
      });
    } else {
      setSelectedTents(prev => {
        const newSelection = prev.filter(id => id !== tentId && id.trim() !== '');
        console.log('Removing tent, new selection:', newSelection);
        return newSelection;
      });
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
                <Label>{isKerigmaStage ? "Paróquias" : "Tendas Participantes"}</Label>
                {isKerigmaStage ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 max-h-60 overflow-y-auto border rounded-md p-4">
                    {parishes.map((parish) => (
                      <div key={parish.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={parish.id}
                          checked={selectedParishes.includes(parish.id)}
                          onCheckedChange={(checked) => handleParishToggle(parish.id, checked)}
                        />
                        <Label
                          htmlFor={parish.id}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {parish.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2 max-h-60 overflow-y-auto border rounded-md p-4">
                    {tents.map((tent) => (
                      <div key={tent.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={tent.id}
                          checked={selectedTents.includes(tent.id)}
                          onCheckedChange={(checked) => handleTentToggle(tent.id, checked)}
                        />
                        <Label
                          htmlFor={tent.id}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {tent.name} - {tent.parishes?.name || "Paróquia não definida"}
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
                {(isKerigmaStage ? selectedParishes.length === 0 : selectedTents.length === 0) && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {isKerigmaStage ? "Selecione pelo menos uma paróquia" : "Selecione pelo menos uma tenda"}
                  </p>
                )}
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

              {isKerigmaStage && (
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
                      required={isKerigmaStage}
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
                      required={isKerigmaStage}
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {isKerigmaStage && (
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
                      required={isKerigmaStage}
                    />
                  </div>
                )}

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
              <Button 
                type="submit" 
                disabled={loading || (isKerigmaStage ? selectedParishes.length === 0 : selectedTents.length === 0)}
              >
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
} 