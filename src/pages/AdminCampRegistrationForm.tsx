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
  parishes: Tables<"parishes">;
};

type Family = Tables<"families">;
type FamilyChild = Tables<"family_children">;

type Child = {
  full_name: string;
  birth_date: string;
  vai_acampamento: boolean;
  dietary_restrictions?: string;
  special_needs?: string;
};

type Registration = Tables<"camp_registrations"> & {
  families: Family & {
    family_children: FamilyChild[];
  };
};

export default function AdminCampRegistrationForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [camp, setCamp] = useState<Camp | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"pending" | "confirmed" | "waitlist" | "cancelled">("pending");
  const [notes, setNotes] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [familyToDelete, setFamilyToDelete] = useState<Registration | null>(null);

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
  const [cep, setCep] = useState("");
  const [dataCasamento, setDataCasamento] = useState("");
  const [contatoPrincipal, setContatoPrincipal] = useState<"esposo" | "esposa">("esposo");
  const [needsPajem, setNeedsPajem] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);

  useEffect(() => {
    if (id) {
      fetchCamp();
      fetchRegistrations();
    }
  }, [id]);

  const fetchCamp = async () => {
    try {
      const { data, error } = await supabase
        .from("camps")
        .select(`
          *,
          stages (*),
          parishes (*)
        `)
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

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from("camp_registrations")
        .select(`
          *,
          families (
            *,
            family_children (*)
          )
        `)
        .eq("camp_id", id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar inscrições: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Converter todos os campos de texto para uppercase
      const familyData = {
        esposo_nome: esposoNome.toUpperCase(),
        esposo_phone: esposoPhone,
        esposo_email: esposoEmail,
        esposo_profissao: esposoProfissao.toUpperCase(),
        esposa_nome: esposaNome.toUpperCase(),
        esposa_phone: esposaPhone,
        esposa_email: esposaEmail,
        esposa_profissao: esposaProfissao.toUpperCase(),
        contato_principal: contatoPrincipal,
        data_casamento: dataCasamento,
        address: address.toUpperCase(),
        bairro: bairro.toUpperCase(),
        city: city.toUpperCase(),
        state: state.toUpperCase(),
        zip_code: cep.toUpperCase(),
        needs_pajem: needsPajem,
      };

      const { data: family, error: familyError } = await supabase
        .from("families")
        .insert(familyData)
        .select()
        .single();

      if (familyError) throw familyError;

      // Converter nomes dos filhos para uppercase
      const childrenData = children.map(child => ({
        ...child,
        full_name: child.full_name.toUpperCase(),
      }));

      if (childrenData.length > 0) {
        const { error: childrenError } = await supabase
          .from("family_children")
          .insert(
            childrenData.map((child) => ({
              family_id: family.id,
              full_name: child.full_name,
              birth_date: child.birth_date,
              vai_acampamento: child.vai_acampamento,
              dietary_restrictions: child.dietary_restrictions,
              special_needs: child.special_needs,
            }))
          );

        if (childrenError) throw childrenError;
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

      const { error: registrationError } = await supabase
        .from("camp_registrations")
        .insert({
          camp_id: camp.id,
          family_id: family.id,
          status,
          notes,
        });

      if (registrationError) throw registrationError;

      toast.success("Família inscrita com sucesso!");
      fetchRegistrations();
      resetForm();
    } catch (error: any) {
      toast.error("Erro ao realizar inscrição: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!familyToDelete) return;

    try {
      const { error } = await supabase
        .from("camp_registrations")
        .delete()
        .eq("id", familyToDelete.id);

      if (error) throw error;

      setRegistrations((prev) =>
        prev.filter((reg) => reg.id !== familyToDelete.id)
      );

      toast.success("Família removida com sucesso!");
      setShowDeleteDialog(false);
      setFamilyToDelete(null);
    } catch (error: any) {
      toast.error("Erro ao remover família: " + error.message);
    }
  };

  const addChild = () => {
    setChildren([
      ...children,
      {
        full_name: "",
        birth_date: "",
        vai_acampamento: true,
        dietary_restrictions: "",
        special_needs: "",
      },
    ]);
  };

  const removeChild = (index: number) => {
    setChildren(children.filter((_, i) => i !== index));
  };

  const updateChild = (index: number, field: keyof Child, value: any) => {
    const newChildren = [...children];
    newChildren[index] = {
      ...newChildren[index],
      [field]: value,
    };
    setChildren(newChildren);
  };

  const resetForm = () => {
    setEsposoNome("");
    setEsposaNome("");
    setAddress("");
    setBairro("");
    setCity("");
    setState("");
    setCep("");
    setEsposoPhone("");
    setEsposoEmail("");
    setEsposoProfissao("");
    setEsposaPhone("");
    setEsposaEmail("");
    setEsposaProfissao("");
    setDataCasamento("");
    setContatoPrincipal("esposo");
    setNeedsPajem(false);
    setChildren([]);
    setNotes("");
    setStatus("pending");
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

  if (!camp) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <p>Acampamento não encontrado</p>
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
            <h1 className="text-2xl font-bold">Nova Inscrição - {camp.name}</h1>
            <p className="text-gray-500">
              {camp.stages.name} - {camp.parishes.name}
            </p>
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
                      value={cep}
                      onChange={(e) => setCep(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Necessita Pajem */}
              <div className="mt-6">
                <label className="flex items-center gap-2">
                  <Checkbox
                    checked={needsPajem}
                    onCheckedChange={(checked) => setNeedsPajem(checked === true)}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Necessita de Pajem
                  </span>
                </label>
              </div>
            </div>

            {/* Filhos */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Filhos</h3>
                <Button type="button" onClick={addChild}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Filho
                </Button>
              </div>

              {children.map((child, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-md font-medium">Filho {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeChild(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Nome</label>
                      <Input
                        value={child.full_name}
                        onChange={(e) =>
                          updateChild(index, "full_name", e.target.value)
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Data de Nascimento
                      </label>
                      <Input
                        type="date"
                        value={child.birth_date}
                        onChange={(e) =>
                          updateChild(index, "birth_date", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Restrições Alimentares
                      </label>
                      <Input
                        value={child.dietary_restrictions || ""}
                        onChange={(e) =>
                          updateChild(
                            index,
                            "dietary_restrictions",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Necessidades Especiais
                      </label>
                      <Input
                        value={child.special_needs || ""}
                        onChange={(e) =>
                          updateChild(index, "special_needs", e.target.value)
                        }
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={child.vai_acampamento}
                        onChange={(e) =>
                          updateChild(
                            index,
                            "vai_acampamento",
                            e.target.checked
                          )
                        }
                        className="h-4 w-4"
                      />
                      <label className="text-sm font-medium">
                        Vai ao Acampamento
                      </label>
                    </div>
                  </div>
                </div>
              ))}
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
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
                    <SelectItem value="waitlist">Lista de Espera</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
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
                Registrar Família
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(`/admin/camps/registrations/${id}`)}
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
                Tem certeza que deseja remover esta família do acampamento? Esta
                ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}