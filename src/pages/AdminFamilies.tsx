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

type Family = Tables<"families">;
type Participant = Tables<"participants">;

export default function AdminFamilies() {
  const navigate = useNavigate();
  const [families, setFamilies] = useState<(Family & { children: Participant[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [familyToDelete, setFamilyToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchFamilies();
  }, []);

  const fetchFamilies = async () => {
    try {
      const { data: familiesData, error: familiesError } = await supabase
        .from("families")
        .select("*")
        .order("esposo_nome");

      if (familiesError) throw familiesError;

      if (familiesData) {
        // Busca os filhos de cada família
        const familiesWithChildren = await Promise.all(
          familiesData.map(async (family) => {
            const { data: children, error: childrenError } = await supabase
              .from("participants")
              .select("*")
              .eq("family_id", family.id)
              .eq("is_child", true);

            if (childrenError) throw childrenError;

            return {
              ...family,
              children: children || [],
            };
          })
        );

        setFamilies(familiesWithChildren);
      }
    } catch (error: any) {
      toast.error("Erro ao carregar famílias: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Primeiro remove os filhos
      const { error: childrenError } = await supabase
        .from("participants")
        .delete()
        .eq("family_id", id);

      if (childrenError) throw childrenError;

      // Depois remove a família
      const { error: familyError } = await supabase
        .from("families")
        .delete()
        .eq("id", id);

      if (familyError) throw familyError;

      toast.success("Família excluída com sucesso!");
      fetchFamilies();
    } catch (error: any) {
      toast.error("Erro ao excluir família: " + error.message);
    } finally {
      setDeleteDialogOpen(false);
      setFamilyToDelete(null);
    }
  };

  const filteredFamilies = families.filter(
    (family) =>
      family.esposo_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      family.esposa_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      family.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      family.state?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Famílias</h1>
          <Button onClick={() => navigate("/admin/families/new")}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Família
          </Button>
        </div>

        <div className="mb-4">
          <Input
            placeholder="Buscar por nome ou localização..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Esposo</TableHead>
                <TableHead>Esposa</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Cidade/UF</TableHead>
                <TableHead>Filhos</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredFamilies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Nenhuma família encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredFamilies.map((family) => (
                  <TableRow key={family.id}>
                    <TableCell>{family.esposo_nome}</TableCell>
                    <TableCell>{family.esposa_nome}</TableCell>
                    <TableCell>
                      {family.contato_principal === "esposo"
                        ? family.esposo_phone || family.esposo_email
                        : family.esposa_phone || family.esposa_email}
                    </TableCell>
                    <TableCell>
                      {family.city && family.state
                        ? `${family.city}/${family.state}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {family.children.length > 0
                        ? `${family.children.length} filho${
                            family.children.length > 1 ? "s" : ""
                          }`
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          navigate(`/admin/families/edit/${family.id}`)
                        }
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setFamilyToDelete(family.id);
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
              Tem certeza que deseja excluir esta família? Esta ação não pode
              ser desfeita e excluirá também todos os filhos registrados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => familyToDelete && handleDelete(familyToDelete)}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
