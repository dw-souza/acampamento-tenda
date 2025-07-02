import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Plus, Search, Pencil, Trash2, Users, Users2, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Camp = Tables<"camps"> & {
  stages: Tables<"stages">;
  camp_parishes: {
    parishes: Tables<"parishes">;
  }[];
  camp_tents: {
    tents: Tables<"tents"> & {
      parishes: Tables<"parishes">;
    };
  }[];
};

export default function AdminCamps() {
  const navigate = useNavigate();
  const [camps, setCamps] = useState<Camp[]>([]);
  const [stages, setStages] = useState<Tables<"stages">[]>([]);
  const [parishes, setParishes] = useState<Tables<"parishes">[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [selectedParish, setSelectedParish] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [campToDelete, setCampToDelete] = useState<Camp | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
          camp_parishes (
            parishes (*)
          ),
          camp_tents (
            tents (
              *,
              parishes (*)
            )
          )
        `)
        .order("start_date", { ascending: false });

      if (error) throw error;
      setCamps(data || []);

      // Buscar etapas para filtros
      const { data: stagesData, error: stagesError } = await supabase
        .from("stages")
        .select("*")
        .order("name");

      if (stagesError) throw stagesError;
      setStages(stagesData || []);

      // Buscar paróquias para filtros
      const { data: parishesData, error: parishesError } = await supabase
        .from("parishes")
        .select("*")
        .order("name");

      if (parishesError) throw parishesError;
      setParishes(parishesData || []);
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
      setShowDeleteDialog(false);
    }
  };

  const getParishNames = (camp: Camp) => {
    return camp.camp_parishes?.map(cp => cp.parishes.name).join("\n") || "Nenhuma paróquia";
  };

  const getTentInfo = (camp: Camp) => {
    if (camp.stages.name.toUpperCase() === 'KERIGMA') {
      return getParishNames(camp);
    } else {
      const tentInfo = camp.camp_tents?.map(ct => 
        `${ct.tents.name} - ${ct.tents.parishes.name}`
      ).join("\n");
      return tentInfo || "Nenhuma tenda";
    }
  };

  const filteredCamps = camps.filter((camp) => {
    const matchesSearch = camp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camp.stages.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getTentInfo(camp).toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStage = selectedStage === "all" || camp.stage_id === selectedStage;
    const matchesParish = selectedParish === "all" || 
      (camp.stages.name.toUpperCase() === 'KERIGMA' 
        ? camp.camp_parishes?.some(cp => cp.parishes.id === selectedParish)
        : camp.camp_tents?.some(ct => ct.tents.parishes.id === selectedParish)
      );
    const matchesYear = selectedYear === "all" || new Date(camp.start_date).getFullYear().toString() === selectedYear;
    const matchesStatus = selectedStatus === "all" || camp.status === selectedStatus;

    return matchesSearch && matchesStage && matchesParish && matchesYear && matchesStatus;
  });

  const years = Array.from(
    new Set(camps.map((camp) => new Date(camp.start_date).getFullYear()))
  ).sort((a, b) => b - a);

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

        {/* Filtros Avançados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
          <Select value={selectedStage} onValueChange={setSelectedStage}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por etapa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as etapas</SelectItem>
              {stages.map((stage) => (
                <SelectItem key={stage.id} value={stage.id}>
                  {stage.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedParish} onValueChange={setSelectedParish}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por paróquia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as paróquias</SelectItem>
              {parishes.map((parish) => (
                <SelectItem key={parish.id} value={parish.id}>
                  {parish.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os anos</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="open">Ativo</SelectItem>
              <SelectItem value="closed">Fechado</SelectItem>
              <SelectItem value="completed">Concluído</SelectItem>
              <SelectItem value="draft">Rascunho</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[150px]">Nome</TableHead>
                <TableHead className="min-w-[100px]">Etapa</TableHead>
                <TableHead className="min-w-[120px]">Paróquia/Tendas</TableHead>
                <TableHead className="min-w-[100px]">Data de Início</TableHead>
                <TableHead className="min-w-[100px]">Data de Término</TableHead>
                <TableHead className="min-w-[80px]">Status</TableHead>
                <TableHead className="text-right min-w-[150px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCamps.map((camp) => (
                <TableRow key={camp.id}>
                  <TableCell className="font-medium">{camp.name}</TableCell>
                  <TableCell>{camp.stages.name}</TableCell>
                  <TableCell className="whitespace-pre-line">{getTentInfo(camp)}</TableCell>
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
                  <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1 sm:space-x-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/admin/camps/dashboard/${camp.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Ver Dashboard</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/admin/camps/registrations/${camp.id}`)}
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Ver Inscrições</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/admin/camps/work-teams/${camp.id}`)}
                          >
                            <Users2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Ver Equipes</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/admin/camps/edit/${camp.id}`)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Editar Acampamento</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600 hover:text-red-900"
                            onClick={() => {
                              setCampToDelete(camp);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Excluir Acampamento</p>
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