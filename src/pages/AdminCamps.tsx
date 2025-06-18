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
import { Plus, Search } from "lucide-react";

type Camp = Tables<"camps"> & {
  stage: Tables<"stages">;
  parish: Tables<"parishes">;
};

export default function AdminCamps() {
  const navigate = useNavigate();
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    campId: string | null;
  }>({
    open: false,
    campId: null,
  });

  useEffect(() => {
    fetchCamps();
  }, []);

  const fetchCamps = async () => {
    try {
      const { data, error } = await supabase
        .from("camps")
        .select(`
          *,
          stage:stages(*),
          parish:parishes(*)
        `)
        .order("start_date", { ascending: false });

      if (error) throw error;

      setCamps(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar acampamentos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.campId) return;

    try {
      const { error } = await supabase
        .from("camps")
        .delete()
        .eq("id", deleteDialog.campId);

      if (error) throw error;

      toast.success("Acampamento excluído com sucesso!");
      fetchCamps();
    } catch (error: any) {
      toast.error("Erro ao excluir acampamento: " + error.message);
    } finally {
      setDeleteDialog({ open: false, campId: null });
    }
  };

  const filteredCamps = camps.filter((camp) =>
    camp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const getStatusColor = (status: Camp["status"]) => {
    switch (status) {
      case "draft":
        return "text-gray-500";
      case "open":
        return "text-green-500";
      case "closed":
        return "text-red-500";
      case "in_progress":
        return "text-blue-500";
      case "completed":
        return "text-purple-500";
      default:
        return "text-gray-500";
    }
  };

  const getStatusText = (status: Camp["status"]) => {
    switch (status) {
      case "draft":
        return "Rascunho";
      case "open":
        return "Inscrições Abertas";
      case "closed":
        return "Inscrições Encerradas";
      case "in_progress":
        return "Em Andamento";
      case "completed":
        return "Concluído";
      default:
        return status;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Acampamentos</h1>
          <Button onClick={() => navigate("/admin/camps/new")}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Acampamento
          </Button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar acampamentos..."
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
                <TableHead>Etapa</TableHead>
                <TableHead>Paróquia</TableHead>
                <TableHead>Data de Início</TableHead>
                <TableHead>Data de Término</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredCamps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Nenhum acampamento encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredCamps.map((camp) => (
                  <TableRow key={camp.id}>
                    <TableCell>{camp.name}</TableCell>
                    <TableCell>{camp.stage.name}</TableCell>
                    <TableCell>{camp.parish.name}</TableCell>
                    <TableCell>{formatDate(camp.start_date)}</TableCell>
                    <TableCell>{formatDate(camp.end_date)}</TableCell>
                    <TableCell>
                      <span className={getStatusColor(camp.status)}>
                        {getStatusText(camp.status)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/camps/registrations/${camp.id}`)}
                      >
                        Inscrições
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/camps/edit/${camp.id}`)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setDeleteDialog({ open: true, campId: camp.id })
                        }
                      >
                        Excluir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <AlertDialog
          open={deleteDialog.open}
          onOpenChange={(open) =>
            setDeleteDialog({ open, campId: open ? deleteDialog.campId : null })
          }
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Acampamento</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este acampamento? Esta ação não
                pode ser desfeita.
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