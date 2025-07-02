import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

type Tent = Tables<"tents">;

export default function AdminTentFamilyAdd() {
  const navigate = useNavigate();
  const [tentId, setTentId] = useState("");
  const [tents, setTents] = useState<Tent[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
  const [joinedDate, setJoinedDate] = useState("");
  const [contatoPrincipal, setContatoPrincipal] = useState<"esposo" | "esposa">("esposo");

  useEffect(() => {
    fetchTents();
  }, []);

  const fetchTents = async () => {
    try {
      const { data, error } = await supabase
        .from("tents")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setTents(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar tendas: " + error.message);
      navigate("/admin/tents");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const familyData = {
        tent_id: tentId,
        esposo_nome: esposoNome.toUpperCase(),
        esposa_nome: esposaNome.toUpperCase(),
        esposo_phone: esposoPhone,
        esposo_email: esposoEmail,
        esposo_profissao: esposoProfissao?.toUpperCase(),
        esposa_phone: esposaPhone,
        esposa_email: esposaEmail,
        esposa_profissao: esposaProfissao?.toUpperCase(),
        contato_principal: contatoPrincipal as string,
        data_casamento: dataCasamento || null,
        address: address?.toUpperCase(),
        bairro: bairro?.toUpperCase(),
        city: city?.toUpperCase(),
        state: state?.toUpperCase(),
        zip_code: zipCode?.toUpperCase(),
        status: 'active',
        joined_date: joinedDate || new Date().toISOString().split('T')[0],
      };

      const { error: insertError } = await supabase
        .from("tent_families")
        .insert(familyData);

      if (insertError) throw insertError;

      toast.success("Família adicionada com sucesso!");
      resetForm();
    } catch (error: any) {
      toast.error("Erro ao adicionar família: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEsposoNome("");
    setEsposaNome("");
    setAddress("");
    setBairro("");
    setCity("");
    setState("");
    setZipCode("");
    setEsposoPhone("");
    setEsposoEmail("");
    setEsposoProfissao("");
    setEsposaPhone("");
    setEsposaEmail("");
    setEsposaProfissao("");
    setDataCasamento("");
    setJoinedDate("");
    setContatoPrincipal("esposo");
    setStatus("active");
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
            <h1 className="text-2xl font-bold">Nova Família</h1>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Dados da Família</h2>

              {/* Tenda */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tenda
                </label>
                <Select
                  value={tentId}
                  onValueChange={(value) => setTentId(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a tenda" />
                  </SelectTrigger>
                  <SelectContent>
                    {tents.map((tent) => (
                      <SelectItem key={tent.id} value={tent.id}>
                        {tent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
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

              {/* Data de Entrada na Tenda */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data de Entrada na Tenda
                </label>
                <Input
                  type="date"
                  value={joinedDate}
                  onChange={(e) => setJoinedDate(e.target.value)}
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

            <div className="flex gap-4">
              <Button type="submit" className="flex-1">
                Adicionar Família
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

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover esta família da tenda? Esta ação
                não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={resetForm}>
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
