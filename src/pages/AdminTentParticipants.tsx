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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Search, Plus, Pencil, Trash2, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";

type Tent = Tables<"tents"> & {
  parishes: Tables<"parishes">;
};

type TentFamily = Tables<"tent_families"> & {
  tent_children: Tables<"tent_children">[];
};

export default function AdminTentParticipants() {
  const navigate = useNavigate();
  const { tentId } = useParams();
  const [tent, setTent] = useState<Tent | null>(null);
  const [participants, setParticipants] = useState<TentFamily[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [participantToDelete, setParticipantToDelete] = useState<TentFamily | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (tentId) {
      fetchTent();
      fetchParticipants();
    }
  }, [tentId]);

  const fetchTent = async () => {
    try {
      const { data, error } = await supabase
        .from("tents")
        .select(`
          *,
          parishes (*)
        `)
        .eq("id", tentId)
        .single();

      if (error) throw error;
      setTent(data);
    } catch (error: any) {
      toast.error("Erro ao carregar tenda: " + error.message);
      navigate("/admin/tents");
    }
  };

  const fetchParticipants = async () => {
    try {
      // Primeiro, tentar carregar com join
      const { data, error } = await supabase
        .from("tent_families")
        .select(`
          *,
          tent_children (*)
        `)
        .eq("tent_id", tentId)
        .order("joined_date", { ascending: false });

      if (error) {
        console.error("Erro no join, tentando carregar separadamente:", error);
        // Se o join falhar, carregar separadamente
        const { data: familiesData, error: familiesError } = await supabase
          .from("tent_families")
          .select("*")
          .eq("tent_id", tentId)
          .order("joined_date", { ascending: false });

        if (familiesError) throw familiesError;

        // Carregar filhos separadamente
        const familiesWithChildren = await Promise.all(
          familiesData.map(async (family) => {
            const { data: childrenData } = await supabase
              .from("tent_children")
              .select("*")
              .eq("tent_family_id", family.id);
            
            return {
              ...family,
              tent_children: childrenData || []
            };
          })
        );

        console.log("Dados carregados separadamente:", familiesWithChildren);
        setParticipants(familiesWithChildren);
      } else {
        console.log("Dados carregados com join:", data);
        setParticipants(data || []);
      }
    } catch (error: any) {
      console.error("Erro detalhado:", error);
      toast.error("Erro ao carregar participantes: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteParticipant = async () => {
    if (!participantToDelete) return;

    try {
      const { error } = await supabase
        .from("tent_families")
        .delete()
        .eq("id", participantToDelete.id);

      if (error) throw error;

      setParticipants((prev) =>
        prev.filter((p) => p.id !== participantToDelete.id)
      );

      toast.success("Participante removido com sucesso!");
      setShowDeleteDialog(false);
      setParticipantToDelete(null);
    } catch (error: any) {
      toast.error("Erro ao remover participante: " + error.message);
    }
  };

  const handleStatusChange = async (participantId: string, newStatus: "active" | "inactive" | "left") => {
    try {
      const { error } = await supabase
        .from("tent_families")
        .update({ status: newStatus })
        .eq("id", participantId);

      if (error) throw error;

      setParticipants((prev) =>
        prev.map((p) =>
          p.id === participantId ? { ...p, status: newStatus } : p
        )
      );

      toast.success("Status atualizado com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao atualizar status: " + error.message);
    }
  };

  const filteredParticipants = participants.filter((participant) =>
    `${participant.esposo_nome} ${participant.esposa_nome}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-yellow-100 text-yellow-800";
      case "left":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Ativo";
      case "inactive":
        return "Inativo";
      case "left":
        return "Saiu";
      default:
        return status;
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
            Participantes - {tent?.name}
          </h1>
          <p className="text-gray-600">
            {tent?.parishes.name} - Guardiões: {tent?.guardian_husband_name} e {tent?.guardian_wife_name}
          </p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex-1 max-w-sm">
            <Input
              placeholder="Buscar família..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => navigate(`/admin/tents/${tentId}/family/add`)}>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Família
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Família
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data de Entrada
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Filhos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredParticipants.map((participant) => (
                <tr key={participant.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      <div>{participant.esposo_nome}</div>
                      <div>{participant.esposa_nome}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatDate(participant.joined_date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {participant.tent_children?.length || 0} {participant.tent_children?.length === 1 ? 'filho' : 'filhos'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Select
                      value={participant.status}
                      onValueChange={(value) =>
                        handleStatusChange(participant.id, value as "active" | "inactive" | "left")
                      }
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              participant.status
                            )}`}
                          >
                            {getStatusLabel(participant.status)}
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                        <SelectItem value="left">Saiu</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/admin/tents/${tentId}/family/${participant.id}`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-900"
                      onClick={() => {
                        setParticipantToDelete(participant);
                        setShowDeleteDialog(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Dialog de confirmação de exclusão */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover Participante</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover esta família da tenda? Esta ação não pode
                ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteParticipant}>
                Confirmar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
} 