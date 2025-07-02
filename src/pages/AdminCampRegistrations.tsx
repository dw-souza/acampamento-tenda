
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Tables } from "@/integrations/supabase/types";
import { Search, Plus, Pencil, Trash2, FileText } from "lucide-react";
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
import { CampRegistration } from "@/types";

type Camp = Tables<"camps"> & {
  stages: Tables<"stages">;
  camp_parishes: {
    parishes: Tables<"parishes">;
  }[];
  couple_price: number;
  child_price: number;
};

type Tent = Tables<"tents"> & {
  tent_families: (Tables<"tent_families"> & {
    tent_children: Tables<"tent_children">[];
  })[];
  parishes: Tables<"parishes">;
};

export default function AdminCampRegistrations() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [camp, setCamp] = useState<Camp | null>(null);
  const [registrations, setRegistrations] = useState<CampRegistration[]>([]);
  const [tents, setTents] = useState<Tent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegistration, setSelectedRegistration] = useState<CampRegistration | null>(null);
  const [registrationToDelete, setRegistrationToDelete] = useState<CampRegistration | null>(null);
  const [notes, setNotes] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCamp();
    }
  }, [id]);

  const fetchCamp = async () => {
    try {
      console.log("Fetching camp with ID:", id);
      const { data, error } = await supabase
        .from("camps")
        .select(`
          *,
          stages (*),
          camp_parishes (
            parishes (*)
          )
        `)
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching camp:", error);
        throw error;
      }
      
      console.log("Camp data:", data);
      setCamp(data);
    } catch (error: any) {
      console.error("Failed to fetch camp:", error);
      toast.error("Erro ao carregar acampamento: " + error.message);
      navigate("/admin/camps");
    }
  };

  const fetchRegistrations = async () => {
    try {
      console.log("Fetching registrations for camp:", id);
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

      if (error) {
        console.error("Error fetching registrations:", error);
        throw error;
      }
      
      console.log("Registrations data:", data);
      setRegistrations(data || []);
    } catch (error: any) {
      console.error("Failed to fetch registrations:", error);
      toast.error("Erro ao carregar inscrições: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTents = async () => {
    try {
      console.log("Fetching tents for camp:", id);
      const { data, error } = await supabase
        .from("camp_tents")
        .select(`
          tents (
            *,
            parishes (*),
            tent_families (
              *,
              tent_children (*)
            )
          )
        `)
        .eq("camp_id", id);

      if (error) {
        console.error("Error fetching tents:", error);
        throw error;
      }
      
      console.log("Tents data:", data);
      // Extrair as tendas dos dados retornados e ordenar
      const tentsData = data?.map(item => item.tents).filter(Boolean) || [];
      tentsData.sort((a: any, b: any) => a.name.localeCompare(b.name));
      setTents(tentsData as unknown as Tent[]);
    } catch (error: any) {
      console.error("Failed to fetch tents:", error);
      toast.error("Erro ao carregar tendas: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (camp) {
      const isKerigma = camp.stages.name.toUpperCase() === 'KERIGMA';
      if (isKerigma) {
        fetchRegistrations();
      } else {
        fetchTents();
      }
    }
  }, [camp]);

  const handleStatusChange = async (registrationId: string, newStatus: "pending" | "confirmed" | "waitlist" | "cancelled") => {
    try {
      const { error } = await supabase
        .from("camp_registrations")
        .update({ status: newStatus })
        .eq("id", registrationId);

      if (error) throw error;

      setRegistrations((prev) =>
        prev.map((reg) =>
          reg.id === registrationId ? { ...reg, status: newStatus } : reg
        )
      );

      toast.success("Status atualizado com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao atualizar status: " + error.message);
    }
  };

  const handleNotesUpdate = async () => {
    if (!selectedRegistration) return;

    try {
      const { error } = await supabase
        .from("camp_registrations")
        .update({ notes })
        .eq("id", selectedRegistration.id);

      if (error) throw error;

      setRegistrations((prev) =>
        prev.map((reg) =>
          reg.id === selectedRegistration.id ? { ...reg, notes } : reg
        )
      );

      toast.success("Notas atualizadas com sucesso!");
      setSelectedRegistration(null);
      setNotes("");
    } catch (error: any) {
      toast.error("Erro ao atualizar notas: " + error.message);
    }
  };

  const handleDelete = async () => {
    if (!registrationToDelete) return;

    try {
      const { error } = await supabase
        .from("camp_registrations")
        .delete()
        .eq("id", registrationToDelete.id);

      if (error) throw error;

      setRegistrations((prev) =>
        prev.filter((reg) => reg.id !== registrationToDelete.id)
      );

      toast.success("Inscrição excluída com sucesso!");
      setShowDeleteDialog(false);
      setRegistrationToDelete(null);
    } catch (error: any) {
      toast.error("Erro ao excluir inscrição: " + error.message);
    }
  };

  const handlePaymentMethodChange = async (registrationId: string, method: "pix" | "dinheiro" | "cartao" | "transferencia") => {
    try {
      const { error } = await supabase
        .from("camp_registrations")
        .update({ payment_method: method })
        .eq("id", registrationId);

      if (error) throw error;

      setRegistrations((prev) =>
        prev.map((reg) =>
          reg.id === registrationId ? { ...reg, payment_method: method } : reg
        )
      );

      toast.success("Método de pagamento atualizado!");
    } catch (error: any) {
      toast.error("Erro ao atualizar método de pagamento: " + error.message);
    }
  };

  const handlePaymentStatusChange = async (registrationId: string, isPaid: boolean) => {
    try {
      const { error } = await supabase
        .from("camp_registrations")
        .update({ is_paid: isPaid })
        .eq("id", registrationId);

      if (error) throw error;

      setRegistrations((prev) =>
        prev.map((reg) =>
          reg.id === registrationId ? { ...reg, is_paid: isPaid } : reg
        )
      );

      toast.success(`Status de pagamento atualizado para ${isPaid ? "Pago" : "Não Pago"}!`);
    } catch (error: any) {
      toast.error("Erro ao atualizar status de pagamento: " + error.message);
    }
  };

  const filteredRegistrations = registrations.filter((registration) => {
    if (!registration.families) return false;
    return `${registration.families.esposo_nome} ${registration.families.esposa_nome}`.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "waitlist":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente";
      case "confirmed":
        return "Confirmado";
      case "waitlist":
        return "Lista de Espera";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  const formatName = (fullName: string) => {
    const names = fullName.split(' ');
    if (names.length <= 2) {
      return fullName;
    }
    return `${names[0]} ${names[names.length - 1]}`;
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

  if (!camp) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Acampamento não encontrado</h1>
            <Button onClick={() => navigate("/admin/camps")}>
              Voltar para Acampamentos
            </Button>
            <Button 
              variant="outline" 
              className="ml-2"
              onClick={() => window.location.reload()}
            >
              Tentar Novamente
            </Button>
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
            {camp?.stages.name.toUpperCase() === 'KERIGMA' ? 'Inscrições' : 'Tendas Participantes'} - {camp?.name}
          </h1>
          <p className="text-gray-600">
            {camp?.stages.name} - {camp?.camp_parishes.map(parish => parish.parishes.name).join(', ')}
          </p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex-1 max-w-sm">
            <Input
              placeholder={camp?.stages.name.toUpperCase() === 'KERIGMA' ? "Buscar família..." : "Buscar tenda..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {camp?.stages.name.toUpperCase() === 'KERIGMA' ? (
            <Button onClick={() => navigate(`/admin/camps/registrations/${id}/new`)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Inscrição
            </Button>
          ) : (
            <Button onClick={() => navigate(`/admin/camps/${id}/tents`)}>
              <Plus className="w-4 h-4 mr-2" />
              Gerenciar Tendas
            </Button>
          )}
        </div>

        {camp?.stages.name.toUpperCase() === 'KERIGMA' && registrations.some(reg => !reg.families) && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Aviso: Algumas inscrições têm famílias não encontradas
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Existem inscrições onde a família associada foi removida ou não existe mais. 
                    Essas inscrições serão exibidas com uma mensagem de erro.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {camp?.stages.name.toUpperCase() === 'KERIGMA' ? (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Família
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data de Inscrição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pagamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notas
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tenda
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paróquia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Famílias
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Crianças
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {camp?.stages.name.toUpperCase() === 'KERIGMA' ? (
                // Renderizar inscrições de famílias para acampamentos Kerigma
                filteredRegistrations.map((registration) => {
                  if (!registration.families) {
                    return (
                      <tr key={registration.id} className="bg-red-50">
                        <td className="px-6 py-4 whitespace-nowrap" colSpan={7}>
                          <div className="text-sm text-red-600">
                            Família não encontrada (ID: {registration.family_id})
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  const childrenCount = registration.families.family_children?.filter(
                    child => child.vai_acampamento
                  ).length || 0;
                  const totalValue = camp ? 
                    camp.couple_price + (childrenCount * camp.child_price) : 0;

                  return (
                    <tr key={registration.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          <div>{formatName(registration.families.esposo_nome)}</div>
                          <div>{formatName(registration.families.esposa_nome)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(registration.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Select
                          value={registration.status}
                          onValueChange={(value) =>
                            handleStatusChange(registration.id, value as "pending" | "confirmed" | "waitlist" | "cancelled")
                          }
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                  registration.status
                                )}`}
                              >
                                {getStatusLabel(registration.status)}
                              </span>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pendente</SelectItem>
                            <SelectItem value="confirmed">Confirmado</SelectItem>
                            <SelectItem value="waitlist">Lista de Espera</SelectItem>
                            <SelectItem value="cancelled">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          R$ {totalValue.toFixed(2)}
                          <div className="text-xs text-gray-500">
                            {childrenCount} {childrenCount === 1 ? 'filho' : 'filhos'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant={registration.is_paid ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePaymentStatusChange(registration.id, !registration.is_paid)}
                          >
                            {registration.is_paid ? "Pago" : "Não Pago"}
                          </Button>
                          <Select
                            value={registration.payment_method || ""}
                            onValueChange={(value) =>
                              handlePaymentMethodChange(registration.id, value as "pix" | "dinheiro" | "cartao" | "transferencia")
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Método" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pix">PIX</SelectItem>
                              <SelectItem value="dinheiro">Dinheiro</SelectItem>
                              <SelectItem value="cartao">Cartão</SelectItem>
                              <SelectItem value="transferencia">Transferência</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {registration.notes || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/admin/families/${registration.families.id}`)}
                          disabled={!registration.families}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedRegistration(registration);
                            setNotes(registration.notes || "");
                          }}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-900"
                          onClick={() => {
                            setRegistrationToDelete(registration);
                            setShowDeleteDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                // Renderizar tendas para outros tipos de acampamento
                tents
                  .filter(tent => tent.name.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map((tent) => {
                    const familiesCount = tent.tent_families?.length || 0;
                    const childrenCount = tent.tent_families?.reduce((total, family) => 
                      total + (family.tent_children?.length || 0), 0
                    ) || 0;

                    return (
                      <tr key={tent.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {tent.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {tent.guardian_husband_name} & {tent.guardian_wife_name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {tent.parishes.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {familiesCount} {familiesCount === 1 ? 'família' : 'famílias'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {childrenCount} {childrenCount === 1 ? 'criança' : 'crianças'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              tent.status === 'active' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {tent.status === 'active' ? 'Ativa' : 'Inativa'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/admin/tents/${tent.id}`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/admin/tents/${tent.id}/families`)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>

        {camp?.stages.name.toUpperCase() === 'KERIGMA' && (
          <>
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir Inscrição</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir esta inscrição? Esta ação não pode
                    ser desfeita.
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

            <AlertDialog
              open={!!selectedRegistration}
              onOpenChange={(open) => {
                if (!open) {
                  setSelectedRegistration(null);
                  setNotes("");
                }
              }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Editar Notas</AlertDialogTitle>
                  <AlertDialogDescription>
                    Adicione ou edite as notas para esta inscrição.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                  <Input
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Digite as notas..."
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleNotesUpdate}>
                    Salvar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </Layout>
  );
}
