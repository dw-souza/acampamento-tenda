import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { Plus, Search, Pencil, Trash2, Users } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Tent = Tables<"tents"> & {
  parishes: Tables<"parishes">;
};

export default function AdminTents() {
  const navigate = useNavigate();
  const [tents, setTents] = useState<Tent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [tentToDelete, setTentToDelete] = useState<Tent | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    fetchTents();
  }, []);

  const fetchTents = async () => {
    try {
      const { data, error } = await supabase
        .from("tents")
        .select(`
          *,
          parishes (*)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTents(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar tendas: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!tentToDelete) return;

    try {
      const { error } = await supabase
        .from("tents")
        .delete()
        .eq("id", tentToDelete.id);

      if (error) throw error;

      setTents((prev) => prev.filter((tent) => tent.id !== tentToDelete.id));
      toast.success("Tenda excluída com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao excluir tenda: " + error.message);
    } finally {
      setTentToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  const filteredTents = tents.filter((tent) =>
    tent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tent.guardian_husband_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tent.guardian_wife_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-yellow-100 text-yellow-800";
      case "disbanded":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Ativa";
      case "inactive":
        return "Inativa";
      case "disbanded":
        return "Dissolvida";
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Tendas</h1>
          <Button onClick={() => navigate("/admin/tents/new")}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Tenda
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tendas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Guardiões</TableHead>
                <TableHead>Paróquia</TableHead>
                <TableHead>Data de Formação</TableHead>
                <TableHead>Data da Reunião</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTents.map((tent) => (
                <TableRow key={tent.id}>
                  <TableCell className="font-medium">{tent.name}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{tent.guardian_husband_name}</div>
                      <div>{tent.guardian_wife_name}</div>
                    </div>
                  </TableCell>
                  <TableCell>{tent.parishes.name}</TableCell>
                  <TableCell>{formatDate(tent.formation_date)}</TableCell>
                  <TableCell>
                    {tent.meeting_date ? formatDate(tent.meeting_date) : "-"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        tent.status
                      )}`}
                    >
                      {getStatusLabel(tent.status)}
                    </span>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/admin/tents/${tent.id}/participants`)}
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Ver Participantes</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/admin/tents/${tent.id}`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Editar Tenda</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-900"
                            onClick={() => {
                              setTentToDelete(tent);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Excluir Tenda</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <AlertDialog
          open={showDeleteDialog}
          onOpenChange={(open) => !open && setTentToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Tenda</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir esta tenda? Esta ação não pode
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
      </div>
    </Layout>
  );
} 