import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
import { Tables } from "@/integrations/supabase/types";

type Stage = Tables<"stages">;

export default function AdminStages() {
  const navigate = useNavigate();
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [stageToDelete, setStageToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchStages();
  }, []);

  const fetchStages = async () => {
    try {
      const { data, error } = await supabase
        .from("stages")
        .select("*")
        .order("name");

      if (error) throw error;

      setStages(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar etapas: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("stages")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Etapa excluída com sucesso!");
      fetchStages();
    } catch (error: any) {
      toast.error("Erro ao excluir etapa: " + error.message);
    } finally {
      setDeleteDialogOpen(false);
      setStageToDelete(null);
    }
  };

  const filteredStages = stages.filter(
    (stage) =>
      stage.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (stage.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Etapas</h1>
          <Button onClick={() => navigate("/admin/stages/new")}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Etapa
          </Button>
        </div>

        <div className="mb-4">
          <Input
            placeholder="Buscar por nome ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredStages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Nenhuma etapa encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredStages.map((stage) => (
                  <TableRow key={stage.id}>
                    <TableCell>{stage.name}</TableCell>
                    <TableCell>{stage.description || "-"}</TableCell>
                    <TableCell>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        stage.is_camp 
                          ? "bg-blue-100 text-blue-800" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {stage.is_camp ? "Acampamento" : "Etapa"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          navigate(`/admin/stages/edit/${stage.id}`)
                        }
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setStageToDelete(stage.id);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta etapa? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => stageToDelete && handleDelete(stageToDelete)}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
} 