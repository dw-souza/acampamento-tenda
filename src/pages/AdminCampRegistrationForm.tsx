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
import { Tables } from "@/integrations/supabase/types";

type Camp = Tables<"camps">;
type Family = Tables<"families">;

export default function AdminCampRegistrationForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [camp, setCamp] = useState<Camp | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [families, setFamilies] = useState<Family[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<"pending" | "confirmed" | "waitlist" | "cancelled">("pending");

  useEffect(() => {
    if (id) {
      fetchCamp();
    }
  }, [id]);

  const fetchCamp = async () => {
    try {
      const { data, error } = await supabase
        .from("camps")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setCamp(data);
    } catch (error: any) {
      toast.error("Erro ao carregar acampamento: " + error.message);
      navigate("/admin/camps");
    } finally {
      setLoading(false);
    }
  };

  const searchFamilies = async () => {
    if (!searchTerm) return;

    try {
      const { data, error } = await supabase
        .from("families")
        .select("*")
        .or(`esposo_nome.ilike.%${searchTerm}%,esposa_nome.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) throw error;
      setFamilies(data || []);
    } catch (error: any) {
      toast.error("Erro ao buscar famílias: " + error.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFamily || !camp) return;

    try {
      // Verificar se a família já está inscrita
      const { data: existingRegistration, error: checkError } = await supabase
        .from("camp_registrations")
        .select("*")
        .eq("camp_id", camp.id)
        .eq("family_id", selectedFamily.id)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError;
      }

      if (existingRegistration) {
        toast.error("Esta família já está inscrita neste acampamento.");
        return;
      }

      // Verificar se o acampamento já atingiu o limite de famílias
      if (status === "confirmed") {
        const { count, error: countError } = await supabase
          .from("camp_registrations")
          .select("*", { count: "exact", head: true })
          .eq("camp_id", camp.id)
          .eq("status", "confirmed");

        if (countError) throw countError;

        if (count && count >= camp.max_families) {
          toast.error("O acampamento já atingiu o limite de famílias.");
          setStatus("waitlist");
        }
      }

      // Criar a inscrição
      const { error } = await supabase.from("camp_registrations").insert({
        camp_id: camp.id,
        family_id: selectedFamily.id,
        status,
        notes,
      });

      if (error) throw error;

      toast.success("Inscrição realizada com sucesso!");
      navigate(`/admin/camps/registrations/${camp.id}`);
    } catch (error: any) {
      toast.error("Erro ao realizar inscrição: " + error.message);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">
            Nova Inscrição - {camp?.name}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Buscar Família</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Digite o nome do esposo ou esposa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button type="button" onClick={searchFamilies}>
                  Buscar
                </Button>
              </div>
            </div>

            {families.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Selecione a Família</label>
                <div className="grid gap-2">
                  {families.map((family) => (
                    <div
                      key={family.id}
                      className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        selectedFamily?.id === family.id
                          ? "border-primary bg-primary/5"
                          : ""
                      }`}
                      onClick={() => setSelectedFamily(family)}
                    >
                      <div className="font-medium">
                        {family.esposo_nome} e {family.esposa_nome}
                      </div>
                      <div className="text-sm text-gray-500">
                        {family.address}, {family.bairro}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedFamily && (
              <>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={status}
                    onValueChange={(value: typeof status) => setStatus(value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="confirmed">Confirmado</SelectItem>
                      <SelectItem value="waitlist">Lista de Espera</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Notas</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Adicione notas sobre esta inscrição..."
                    rows={4}
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/admin/camps/registrations/${id}`)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!selectedFamily}
            >
              Salvar
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}