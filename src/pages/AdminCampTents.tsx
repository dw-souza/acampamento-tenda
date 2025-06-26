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

type Camp = Tables<"camps"> & {
  stages: Tables<"stages">;
  camp_parishes: {
    parishes: Tables<"parishes">;
  }[];
};

type Tent = Tables<"tents"> & {
  tent_families: (Tables<"tent_families"> & {
    tent_children: Tables<"tent_children">[];
  })[];
};

export default function AdminCampTents() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [camp, setCamp] = useState<Camp | null>(null);
  const [loading, setLoading] = useState(true);
  const [tents, setTents] = useState<Tent[]>([]);
  const [selectedTent, setSelectedTent] = useState<Tent | null>(null);
  const [tentName, setTentName] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCamp();
      fetchTents();
    }
  }, [id]);

  const fetchCamp = async () => {
    try {
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

      if (error) throw error;
      setCamp(data);
    } catch (error: any) {
      toast.error("Erro ao carregar acampamento: " + error.message);
      navigate("/admin/camps");
    }
  };

  const fetchTents = async () => {
    try {
      const { data, error } = await supabase
        .from("camp_tents")
        .select(`
          tents (
            *,
            tent_families (
              *,
              tent_children (*)
            )
          )
        `)
        .eq("camp_id", id);

      if (error) throw error;
      
      // Extrair as tendas dos dados retornados e ordenar
      const tentsData = data?.map(item => item.tents).filter(Boolean) || [];
      tentsData.sort((a: any, b: any) => a.name.localeCompare(b.name));
      setTents(tentsData as unknown as Tent[]);
    } catch (error: any) {
      toast.error("Erro ao carregar tendas: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!camp) return;

    try {
      if (selectedTent) {
        // Atualizar tenda existente
        const { error } = await supabase
          .from("tents")
          .update({
            name: tentName,
          })
          .eq("id", selectedTent.id);

        if (error) throw error;
        toast.success("Tenda atualizada com sucesso!");
      } else {
        // Criar nova tenda e relacionar com o acampamento
        const { data: tentData, error: tentError } = await supabase
          .from("tents")
          .insert({
            name: tentName,
            formation_date: new Date().toISOString().split('T')[0],
            guardian_husband_name: 'A definir',
            guardian_wife_name: 'A definir',
            parish_id: camp.camp_parishes[0]?.parishes.id || '',
            status: 'active'
          })
          .select()
          .single();

        if (tentError) throw tentError;

        // Relacionar a tenda com o acampamento
        const { error: relationError } = await supabase
          .from("camp_tents")
          .insert({
            camp_id: camp.id,
            tent_id: tentData.id
          });

        if (relationError) throw relationError;
        toast.success("Tenda criada com sucesso!");
      }

      fetchTents();
      setSelectedTent(null);
      setTentName("");
    } catch (error: any) {
      toast.error("Erro ao salvar tenda: " + error.message);
    }
  };

  const handleDelete = async () => {
    if (!selectedTent) return;

    try {
      // Remover o relacionamento com o acampamento
      const { error: relationError } = await supabase
        .from("camp_tents")
        .delete()
        .eq("camp_id", camp?.id)
        .eq("tent_id", selectedTent.id);

      if (relationError) throw relationError;

      // Remover a tenda
      const { error } = await supabase
        .from("tents")
        .delete()
        .eq("id", selectedTent.id);

      if (error) throw error;

      setTents((prev) =>
        prev.filter((tent) => tent.id !== selectedTent.id)
      );

      toast.success("Tenda removida com sucesso!");
      setShowDeleteDialog(false);
      setSelectedTent(null);
    } catch (error: any) {
      toast.error("Erro ao remover tenda: " + error.message);
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
            Tendas - {camp?.name}
          </h1>
          <p className="text-gray-600">
            {camp?.stages.name} - {camp?.camp_parishes.map(p => p.parishes.name).join(', ')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mb-8">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nome da Tenda</label>
              <Input
                value={tentName}
                onChange={(e) => setTentName(e.target.value)}
                placeholder="Digite o nome da tenda..."
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSelectedTent(null);
                setTentName("");
              }}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {selectedTent ? "Atualizar" : "Criar"} Tenda
            </Button>
          </div>
        </form>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participantes
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tents.map((tent) => (
                <tr key={tent.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {tent.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {tent.tent_families?.reduce((total, family) => 
                        total + (family.tent_children?.length || 0), 0
                      ) || 0} participantes
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setSelectedTent(tent);
                          setTentName(tent.name);
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="ghost"
                        className="text-red-600 hover:text-red-900"
                        onClick={() => {
                          setSelectedTent(tent);
                          setShowDeleteDialog(true);
                        }}
                      >
                        Remover
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover Tenda</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja remover esta tenda? Esta ação não pode
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