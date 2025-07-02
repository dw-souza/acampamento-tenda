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

type TentFamily = Tables<"tent_families">;

export default function AdminTentFamilyForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [tentFamily, setTentFamily] = useState<TentFamily | null>(null);
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [notes, setNotes] = useState("");

  // Campos do esposo
  const [esposoNome, setEsposoNome] = useState("");
  const [esposoPhone, setEsposoPhone] = useState("");
  const [esposoEmail, setEsposoEmail] = useState("");
  const [esposoProfissao, setEsposoProfissao] = useState("");

  // Campos da esposa
  const [esposaNome, setEsposaNome] = useState("");
  const [esposaPhone, setEsposaPhone] = useState("");
  const [esposaEmail, setEsposaEmail] = useState("");
  const [esposaProfissao, setEsposaProfissao] = useState("");

  // Campos de endereço
  const [address, setAddress] = useState("");
  const [bairro, setBairro] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [dataCasamento, setDataCasamento] = useState("");
  const [contatoPrincipal, setContatoPrincipal] = useState<"esposo" | "esposa">("esposo");
  const [joinedDate, setJoinedDate] = useState("");

  useEffect(() => {
    if (id) {
      fetchTentFamily();
    }
  }, [id]);

  const fetchTentFamily = async () => {
    try {
      const { data, error } = await supabase
        .from("tent_families")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setTentFamily(data);
      setEsposoNome(data.esposo_nome);
      setEsposoPhone(data.esposo_phone || "");
      setEsposoEmail(data.esposo_email || "");
      setEsposoProfissao(data.esposo_profissao || "");
      
      setEsposaNome(data.esposa_nome);
      setEsposaPhone(data.esposa_phone || "");
      setEsposaEmail(data.esposa_email || "");
      setEsposaProfissao(data.esposa_profissao || "");

      setAddress(data.address || "");
      setBairro(data.bairro || "");
      setCity(data.city || "");
      setState(data.state || "");
      setZipCode(data.zip_code || "");
      setDataCasamento(data.data_casamento || "");
      setContatoPrincipal(data.contato_principal as "esposo" | "esposa");
      setStatus(data.status as "active" | "inactive");
      setJoinedDate(data.joined_date);
      setNotes(data.notes || "");
    } catch (error: any) {
      toast.error("Erro ao carregar família: " + error.message);
      navigate("/admin/tents");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        esposo_nome: esposoNome.toUpperCase(),
        esposa_nome: esposaNome.toUpperCase(),
        esposo_phone: esposoPhone,
        esposo_email: esposoEmail,
        esposo_profissao: esposoProfissao?.toUpperCase(),
        esposa_phone: esposaPhone,
        esposa_email: esposaEmail,
        esposa_profissao: esposaProfissao?.toUpperCase(),
        contato_principal: contatoPrincipal as string, // Cast to string
        status: status as string, // Cast to string
        data_casamento: dataCasamento || null,
        address: address?.toUpperCase(),
        bairro: bairro?.toUpperCase(),
        city: city?.toUpperCase(),
        state: state?.toUpperCase(),
        zip_code: zipCode?.toUpperCase(),
        joined_date: joinedDate,
      };

      const { error } = await supabase
        .from("tent_families")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      toast.success("Família atualizada com sucesso!");
      navigate("/admin/tents");
    } catch (error: any) {
      toast.error("Erro ao atualizar família: " + error.message);
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

  if (!tentFamily) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <p>Família não encontrada</p>
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
            <h1 className="text-2xl font-bold">Editar Família</h1>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Dados do Casal</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dados do Esposo */}
                <div className="space-y-4">
                  <h3 className="font-medium">Esposo</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome</label>
                    <Input
                      value={esposoNome}
                      onChange={(e) => setEsposoNome(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Telefone</label>
                    <Input
                      value={esposoPhone}
                      onChange={(e) => setEsposoPhone(e.target.value)}
                      type="tel"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <Input
                      value={esposoEmail}
                      onChange={(e) => setEsposoEmail(e.target.value)}
                      type="email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Profissão</label>
                    <Input
                      value={esposoProfissao}
                      onChange={(e) => setEsposoProfissao(e.target.value)}
                    />
                  </div>
                </div>

                {/* Dados da Esposa */}
                <div className="space-y-4">
                  <h3 className="font-medium">Esposa</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome</label>
                    <Input
                      value={esposaNome}
                      onChange={(e) => setEsposaNome(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Telefone</label>
                    <Input
                      value={esposaPhone}
                      onChange={(e) => setEsposaPhone(e.target.value)}
                      type="tel"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <Input
                      value={esposaEmail}
                      onChange={(e) => setEsposaEmail(e.target.value)}
                      type="email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Profissão</label>
                    <Input
                      value={esposaProfissao}
                      onChange={(e) => setEsposaProfissao(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Contato Principal */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contato Principal
                </label>
                <Select
                  value={contatoPrincipal}
                  onValueChange={(value: "esposo" | "esposa") => setContatoPrincipal(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="esposo">Esposo</SelectItem>
                    <SelectItem value="esposa">Esposa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Data de Casamento */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Casamento
                </label>
                <Input
                  type="date"
                  value={dataCasamento}
                  onChange={(e) => setDataCasamento(e.target.value)}
                />
              </div>

              {/* Endereço */}
              <div className="mt-6">
                <h3 className="font-medium mb-4">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Endereço</label>
                    <Input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bairro</label>
                    <Input
                      value={bairro}
                      onChange={(e) => setBairro(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cidade</label>
                    <Input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                    <Input
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CEP</label>
                    <Input
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Status e Observações */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={status}
                  onValueChange={(value: any) => setStatus(value)}
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Observações</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1">
                Atualizar Família
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(`/admin/tents`)}
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
