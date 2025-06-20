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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
import { Plus, Search, Pencil, Trash2, Users, Filter, X } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatDate } from "@/lib/utils";

type Tent = Tables<"tents"> & {
  parishes: Tables<"parishes">;
  stages: Tables<"stages">;
  _count?: {
    active_families: number;
  };
};

type Parish = Tables<"parishes">;
type Stage = Tables<"stages">;

export default function AdminTents() {
  const navigate = useNavigate();
  const [tents, setTents] = useState<Tent[]>([]);
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [tentToDelete, setTentToDelete] = useState<Tent | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    parish_id: "all",
    stage_id: "all",
    status: "active" as "active" | "inactive" | "disbanded" | "all",
    showInactive: false,
  });

  useEffect(() => {
    fetchParishes();
    fetchStages();
  }, []);

  const fetchParishes = async () => {
    try {
      const { data, error } = await supabase
        .from("parishes")
        .select("*")
        .eq("status", "active")
        .order("name");

      if (error) throw error;
      setParishes(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar paróquias: " + error.message);
    }
  };

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
    }
  };

  const fetchTents = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("tents")
        .select(`
          *,
          parishes (*),
          stages (*)
        `)
        .order("created_at", { ascending: false });

      // Aplicar filtros
      if (filters.parish_id !== "all") {
        query = query.eq("parish_id", filters.parish_id);
      }

      if (filters.stage_id !== "all") {
        query = query.eq("stage_id", filters.stage_id);
      }

      if (filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      if (!filters.showInactive) {
        query = query.eq("status", "active");
      }

      const { data: tentsData, error: tentsError } = await query;

      if (tentsError) throw tentsError;

      // Buscar contagem de famílias ativas por tenda
      const { data: familiesCount, error: familiesError } = await supabase
        .from("tent_families")
        .select(`
          tent_id,
          status
        `)
        .eq("status", "active");

      if (familiesError) throw familiesError;

      // Processar os dados para incluir a contagem
      const processedData = tentsData?.map(tent => {
        const activeFamiliesCount = familiesCount?.filter(
          family => family.tent_id === tent.id
        ).length || 0;

        return {
          ...tent,
          _count: {
            active_families: activeFamiliesCount
          }
        };
      }) || [];

      setTents(processedData);
    } catch (error: any) {
      toast.error("Erro ao carregar tendas: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    fetchTents();
  };

  const handleClearFilters = () => {
    setFilters({
      parish_id: "all",
      stage_id: "all",
      status: "active",
      showInactive: false,
    });
    setSearchTerm("");
    setTents([]);
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

        {/* Filtros */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              {Object.values(filters).some(value => value !== "all" && value !== "active" && value !== false) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                >
                  <X className="w-4 h-4 mr-2" />
                  Limpar Filtros
                </Button>
              )}
            </div>
            <Button onClick={handleApplyFilters} disabled={loading}>
              {loading ? "Carregando..." : "Aplicar Filtros"}
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-gray-50">
              <div>
                <Label htmlFor="parish_filter">Paróquia</Label>
                <Select
                  value={filters.parish_id}
                  onValueChange={(value) => handleFilterChange("parish_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as paróquias" />
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
              </div>

              <div>
                <Label htmlFor="stage_filter">Etapa</Label>
                <Select
                  value={filters.stage_id}
                  onValueChange={(value) => handleFilterChange("stage_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as etapas" />
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
              </div>

              <div>
                <Label htmlFor="status_filter">Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value: "active" | "inactive" | "disbanded" | "all") => 
                    handleFilterChange("status", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativas</SelectItem>
                    <SelectItem value="inactive">Inativas</SelectItem>
                    <SelectItem value="disbanded">Dissolvidas</SelectItem>
                    <SelectItem value="all">Todos os status</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show_inactive"
                  checked={filters.showInactive}
                  onCheckedChange={(checked) => 
                    handleFilterChange("showInactive", checked as boolean)
                  }
                />
                <Label htmlFor="show_inactive" className="text-sm">
                  Mostrar inativas
                </Label>
              </div>
            </div>
          )}

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tendas por nome ou guardiões..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Tabela */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Paróquia</TableHead>
                <TableHead>Guardiões</TableHead>
                <TableHead>Etapa</TableHead>
                <TableHead>Data de Formação</TableHead>
                <TableHead>Data da Reunião</TableHead>
                <TableHead>Famílias Ativas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      <span className="ml-2">Carregando...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredTents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    {tents.length === 0 ? (
                      <div className="text-gray-500">
                        <p>Nenhuma tenda encontrada com os filtros aplicados.</p>
                        <p className="text-sm mt-1">Aplique os filtros e clique em "Aplicar Filtros" para buscar.</p>
                      </div>
                    ) : (
                      <div className="text-gray-500">
                        Nenhuma tenda encontrada com os termos de busca.
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredTents.map((tent) => (
                  <TableRow key={tent.id}>
                    <TableCell className="font-medium">{tent.name}</TableCell>
                    <TableCell>{tent.parishes.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{tent.guardian_husband_name}</div>
                        <div>{tent.guardian_wife_name}</div>
                      </div>
                    </TableCell>
                    <TableCell>{tent.stages?.name || "-"}</TableCell>
                    <TableCell>{formatDate(tent.formation_date)}</TableCell>
                    <TableCell>
                      {tent.meeting_date ? formatDate(tent.meeting_date) : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {tent._count?.active_families || 0}
                      </span>
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
                              onClick={() => navigate(`/admin/tents/edit/${tent.id}`)}
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
                ))
              )}
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