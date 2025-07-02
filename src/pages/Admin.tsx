import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Tables } from "@/integrations/supabase/types";
import { 
  Plus, 
  Calendar, 
  Users, 
  MapPin, 
  Building2,
  Baby,
  User,
  Eye,
  Pencil,
  Users2
} from "lucide-react";

type Camp = Tables<"camps"> & {
  stages: Tables<"stages">;
  camp_parishes: {
    parishes: Tables<"parishes">;
  }[];
  camp_tents?: {
    tent_id: string;
    tents: Tables<"tents"> & {
      parishes: Tables<"parishes">;
    };
  }[];
  couple_price: number;
  child_price: number;
  _count?: {
    registrations: number;
  };
};

type Stage = Tables<"stages">;
type Parish = Tables<"parishes">;
type Tent = Tables<"tents">;
type TentFamily = Tables<"tent_families">;
type TentChild = {
  id: string;
  tent_family_id: string;
  full_name: string;
  birth_date: string;
  vai_encontros: boolean;
  dietary_restrictions: string;
  special_needs: string;
  created_at: string;
  updated_at: string;
};

interface DashboardStats {
  totalParishes: number;
  totalTents: number;
  totalFamilies: number;
  totalChildren: number;
  tentsByStage: {
    stageName: string;
    tentCount: number;
    familyCount: number;
  }[];
}

export default function Admin() {
  const navigate = useNavigate();
  const [camps, setCamps] = useState<Camp[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [tents, setTents] = useState<Tent[]>([]);
  const [tentFamilies, setTentFamilies] = useState<TentFamily[]>([]);
  const [tentChildren, setTentChildren] = useState<TentChild[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalParishes: 0,
    totalTents: 0,
    totalFamilies: 0,
    totalChildren: 0,
    tentsByStage: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Buscar acampamentos com contagem de inscrições
      const { data: campsData, error: campsError } = await supabase
        .from("camps")
        .select(`
          *,
          stages (*),
          camp_parishes (
            parishes (*)
          ),
          camp_tents (
            tent_id,
            tents (
              *,
              parishes (*)
            )
          )
        `)
        .order("start_date", { ascending: false });

      if (campsError) throw campsError;

      // Buscar a contagem de inscrições para cada acampamento
      const campsWithCounts = await Promise.all(
        campsData?.map(async (camp) => {
          const { count, error: countError } = await supabase
            .from("camp_registrations")
            .select("*", { count: "exact", head: true })
            .eq("camp_id", camp.id);
      
          if (countError) throw countError;

          return {
            ...camp,
            _count: {
              registrations: count || 0
            }
          };
        }) || []
      );

      // Buscar etapas
      const { data: stagesData, error: stagesError } = await supabase
        .from("stages")
        .select("*")
        .order("name");

      if (stagesError) throw stagesError;

      // Buscar paróquias
      const { data: parishesData, error: parishesError } = await supabase
        .from("parishes")
        .select("*")
        .order("name");

      if (parishesError) throw parishesError;

      // Buscar tendas
      const { data: tentsData, error: tentsError } = await supabase
        .from("tents")
        .select("*")
        .order("name");

      if (tentsError) throw tentsError;

      // Buscar famílias das tendas
      const { data: tentFamiliesData, error: tentFamiliesError } = await supabase
        .from("tent_families")
        .select("*")
        .eq("status", "active")
        .order("esposo_nome");

      if (tentFamiliesError) throw tentFamiliesError;

      // Buscar filhos das famílias das tendas
      const { data: tentChildrenData, error: tentChildrenError } = await supabase
        .from("tent_children")
        .select("id, tent_family_id, full_name, birth_date, vai_encontros, dietary_restrictions, special_needs, created_at, updated_at")
        .order("full_name");

      if (tentChildrenError) throw tentChildrenError;

      setCamps(campsWithCounts);
      setStages(stagesData || []);
      setParishes(parishesData || []);
      setTents(tentsData || []);
      setTentFamilies(tentFamiliesData || []);
      setTentChildren(tentChildrenData || []);

      // Calcular estatísticas
      calculateStats(campsWithCounts, parishesData || [], tentsData || [], tentFamiliesData || [], tentChildrenData || [], stagesData || []);

    } catch (error: any) {
      toast.error("Erro ao carregar dados: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (
    campsData: Camp[], 
    parishesData: Parish[], 
    tentsData: Tent[], 
    tentFamiliesData: TentFamily[], 
    tentChildrenData: TentChild[],
    stagesData: Stage[]
  ) => {
    const totalParishes = parishesData.length;
    const totalTents = tentsData.length;
    const totalFamilies = tentFamiliesData.length;
    const totalChildren = tentChildrenData.length;

    // Criar um mapa de tendas por ID para facilitar a busca
    const tentsMap = new Map(tentsData.map(tent => [tent.id, tent]));
    
    // Agrupar famílias por etapa
    const familiesByStage = new Map<string, { stageName: string; tentIds: Set<string>; familyCount: number }>();
    
    // Inicializar com todas as etapas
    stagesData.forEach(stage => {
      familiesByStage.set(stage.id, {
        stageName: stage.name,
        tentIds: new Set(),
        familyCount: 0
      });
    });
    
    // Adicionar uma categoria para tendas sem etapa definida
    familiesByStage.set('no-stage', {
      stageName: 'Sem etapa definida',
      tentIds: new Set(),
      familyCount: 0
    });
    
    // Processar cada família
    tentFamiliesData.forEach(tf => {
      const tent = tentsMap.get(tf.tent_id);
      if (tent) {
        const stageKey = tent.stage_id || 'no-stage';
        const stageData = familiesByStage.get(stageKey);
        if (stageData) {
          stageData.tentIds.add(tent.id);
          stageData.familyCount++;
        }
      }
    });
    
    // Converter para o formato esperado
    const tentsByStage = Array.from(familiesByStage.values())
      .filter(stage => stage.familyCount > 0) // Só mostrar etapas com famílias
      .map(stage => ({
        stageName: stage.stageName,
        tentCount: stage.tentIds.size,
        familyCount: stage.familyCount
      }));

    setStats({
      totalParishes,
      totalTents,
      totalFamilies,
      totalChildren,
      tentsByStage,
    });
  };

  const getRegistrationStatus = (camp: Camp) => {
    const confirmedCount = camp._count?.registrations || 0;
    const maxFamilies = camp.max_families || 0;
    const percentage = (confirmedCount / maxFamilies) * 100;

    if (percentage >= 100) return "bg-red-100 text-red-800";
    if (percentage >= 80) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const formatParishColumn = (camp: Camp) => {
    const isKerigma = camp.stages.name.toUpperCase() === 'KERIGMA';
    
    if (isKerigma) {
      // Para acampamentos Kerigma: mostrar paróquias com quebra de linha
      return camp.camp_parishes.map(p => p.parishes.name).join('\n');
    } else {
      // Para outros acampamentos: mostrar tendas com suas paróquias
      if (camp.camp_tents && camp.camp_tents.length > 0) {
        return camp.camp_tents.map((ct: any) => 
          `${ct.tents?.name} - ${ct.tents?.parishes?.name || "Paróquia não definida"}`
        ).join('\n');
      } else {
        return camp.camp_parishes.map(p => p.parishes.name).join('\n');
      }
    }
  };

  // Filtrar apenas acampamentos ativos
  const activeCamps = camps.filter(camp => camp.status === "open");

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard - Comunidade Tenda</h1>
          <Button onClick={() => navigate("/admin/camps/new")}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Acampamento
          </Button>
        </div>

        {/* Cards de Estatísticas da Comunidade Tenda */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paróquias</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalParishes}</div>
              <p className="text-xs text-muted-foreground">
                Paróquias participantes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tendas</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTents}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalFamilies} famílias ativas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Filhos</CardTitle>
              <Baby className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalChildren}</div>
              <p className="text-xs text-muted-foreground">
                Filhos das famílias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Etapas</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stages.length}</div>
              <p className="text-xs text-muted-foreground">
                Etapas da formação
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Resumo por Etapa */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Tendas por Etapa
              </CardTitle>
              <CardDescription>
                Distribuição de tendas e famílias por etapa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.tentsByStage.map((stage) => (
                  <div key={stage.stageName} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{stage.stageName}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{stage.tentCount} tendas</Badge>
                      <Badge variant="secondary">{stage.familyCount} famílias</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Resumo Geral
              </CardTitle>
              <CardDescription>
                Visão geral da Comunidade Tenda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Paróquias:</span>
                  <span className="text-sm font-medium">{stats.totalParishes}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Tendas:</span>
                  <span className="text-sm font-medium">{stats.totalTents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Famílias:</span>
                  <span className="text-sm font-medium">{stats.totalFamilies}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Filhos:</span>
                  <span className="text-sm font-medium">{stats.totalChildren}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium">Total de pessoas:</span>
                  <span className="text-sm font-bold">{stats.totalFamilies * 2 + stats.totalChildren}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Acampamentos Ativos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Acampamentos Ativos
            </CardTitle>
            <CardDescription>
              Lista de acampamentos com inscrições abertas
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Nome</TableHead>
                    <TableHead className="min-w-[100px]">Etapa</TableHead>
                    <TableHead className="min-w-[120px]">Paróquia</TableHead>
                    <TableHead className="min-w-[120px]">Data</TableHead>
                    <TableHead className="min-w-[100px]">Inscrições</TableHead>
                    <TableHead className="text-right min-w-[120px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : activeCamps.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        Nenhum acampamento ativo encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    activeCamps.map((camp) => (
                      <TableRow key={camp.id}>
                        <TableCell className="font-medium">{camp.name}</TableCell>
                        <TableCell>{camp.stages.name}</TableCell>
                        <TableCell className="whitespace-pre-line text-sm">{formatParishColumn(camp)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{new Date(camp.start_date).toLocaleDateString()}</div>
                            <div className="text-muted-foreground">até {new Date(camp.end_date).toLocaleDateString()}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${getRegistrationStatus(camp)}`}>
                            {camp._count?.registrations || 0} / {camp.max_families}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1 sm:gap-2">
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
                            </TooltipProvider>
                            
                            <TooltipProvider>
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
                            </TooltipProvider>
                            
                            <TooltipProvider>
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
                            </TooltipProvider>
                            
                            <TooltipProvider>
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
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
