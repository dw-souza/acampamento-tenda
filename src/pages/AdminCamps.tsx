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
  stages: Tables<"stages">;
  parishes: Tables<"parishes">;
};

export default function AdminCamps() {
  const navigate = useNavigate();
  const [camps, setCamps] = useState<Camp[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [campToDelete, setCampToDelete] = useState<Camp | null>(null);

  useEffect(() => {
    fetchCamps();
  }, []);

  const fetchCamps = async () => {
    try {
      const { data, error } = await supabase
        .from("camps")
        .select(`
          *,
          stages (*),
          parishes (*)
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
    if (!campToDelete) return;

    try {
      const { error } = await supabase
        .from("camps")
        .delete()
        .eq("id", campToDelete.id);

      if (error) throw error;

      setCamps((prev) => prev.filter((camp) => camp.id !== campToDelete.id));
      toast.success("Acampamento excluído com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao excluir acampamento: " + error.message);
    } finally {
      setCampToDelete(null);
    }
  };

  const filteredCamps = camps.filter((camp) =>
    camp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR");
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
              {filteredCamps.map((camp) => (
                <TableRow key={camp.id}>
                  <TableCell>{camp.name}</TableCell>
                  <TableCell>{camp.stages.name}</TableCell>
                  <TableCell>{camp.parishes.name}</TableCell>
                  <TableCell>{formatDate(camp.start_date)}</TableCell>
                  <TableCell>{formatDate(camp.end_date)}</TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        camp.status === "open"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {camp.status === "open" ? "Ativo" : "Inativo"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      onClick={() => navigate(`/admin/camps/edit/${camp.id}`)}
                    >
                      Editar
                    </Button>
                    {camp.stages.name.toLowerCase() === "kerigma" ? (
                      <Button
                        variant="ghost"
                        onClick={() => navigate(`/admin/camps/registrations/${camp.id}`)}
                      >
                        Inscrições
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        onClick={() => navigate(`/admin/camps/tents/${camp.id}`)}
                      >
                        Tendas
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      className="text-red-600 hover:text-red-900"
                      onClick={() => setCampToDelete(camp)}
                    >
                      Excluir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <AlertDialog
          open={!!campToDelete}
          onOpenChange={(open) => !open && setCampToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir Acampamento</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este acampamento? Esta ação não pode
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