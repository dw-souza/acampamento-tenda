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
import { Search } from "lucide-react";
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

type CampRegistration = Tables<"camp_registrations"> & {
  families: Tables<"families">;
};

type Camp = Tables<"camps"> & {
  stages: Tables<"stages">;
  parishes: Tables<"parishes">;
};

export default function AdminCampRegistrations() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [camp, setCamp] = useState<Camp | null>(null);
  const [registrations, setRegistrations] = useState<CampRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegistration, setSelectedRegistration] = useState<CampRegistration | null>(null);
  const [notes, setNotes] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
    }
  };

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from("camp_registrations")
        .select(`
          *,
          families (*)
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
    if (!selectedRegistration) return;

    try {
      const { error } = await supabase
        .from("camp_registrations")
        .delete()
        .eq("id", selectedRegistration.id);

      if (error) throw error;

      setRegistrations((prev) =>
        prev.filter((reg) => reg.id !== selectedRegistration.id)
      );

      toast.success("Inscrição excluída com sucesso!");
      setShowDeleteDialog(false);
      setSelectedRegistration(null);
    } catch (error: any) {
      toast.error("Erro ao excluir inscrição: " + error.message);
    }
  };

  const filteredRegistrations = registrations.filter((registration) =>
    `${registration.families.esposo_nome} ${registration.families.esposa_nome}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            Inscrições - {camp?.name}
          </h1>
          <p className="text-gray-600">
            {camp?.stages.name} - {camp?.parishes.name}
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
          <Button onClick={() => navigate(`/admin/camps/registrations/${id}/new`)}>
            Nova Inscrição
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
                  Data de Inscrição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notas
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRegistrations.map((registration) => (
                <tr key={registration.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {registration.families.esposo_nome} e {registration.families.esposa_nome}
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
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">
                      {registration.notes || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSelectedRegistration(registration);
                        setNotes(registration.notes || "");
                      }}
                    >
                      Editar Notas
                    </Button>
                    <Button
                      variant="ghost"
                      className="text-red-600 hover:text-red-900"
                      onClick={() => {
                        setSelectedRegistration(registration);
                        setShowDeleteDialog(true);
                      }}
                    >
                      Excluir
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
      </div>
    </Layout>
  );
} 