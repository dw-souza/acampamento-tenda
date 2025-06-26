import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Users, Users2, Baby } from "lucide-react";
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
  parish: Tables<"parishes">;
};

type WorkTeam = Tables<"work_teams">;

type CampWorkAssignment = Tables<"camp_work_assignments"> & {
  work_team: WorkTeam;
  tent: Tent;
  coordinator_family: Tables<"tent_families"> | null;
};

type CampFamilyAssignment = {
  id: string;
  camp_id: string;
  family_id: string;
  work_team_id: string;
  is_coordinator: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
  work_team: WorkTeam;
  family: Tables<"tent_families">;
};

type BadgePerson = {
  id: string;
  name: string;
  spouseName?: string;
  parentsName?: string;
  type: 'adult_camper' | 'adult_worker' | 'child';
  teamName?: string;
  tribeName?: string;
  teamColor?: string;
  isCoordinator?: boolean;
};

export default function AdminCampBadges() {
  const navigate = useNavigate();
  const { campId } = useParams();
  const [camp, setCamp] = useState<Camp | null>(null);
  const [loading, setLoading] = useState(true);
  const [badgePeople, setBadgePeople] = useState<BadgePerson[]>([]);
  const [stats, setStats] = useState({
    totalAdults: 0,
    totalChildren: 0,
    totalWorkers: 0,
    totalCoordinators: 0
  });

  useEffect(() => {
    console.log('🔄 useEffect executado, campId:', campId);
    console.log('🔄 Tipo do campId:', typeof campId);
    console.log('🔄 campId é válido?', campId && campId.length > 0);
    
    if (campId && campId.length > 0) {
      console.log('🔄 Iniciando fetchCampData');
      fetchCampData();
    } else {
      console.log('⚠️ campId não encontrado ou inválido');
      setLoading(false);
    }
  }, [campId]);

  const fetchCampData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Iniciando fetchCampData para camp ID:', campId);

      // Buscar dados do acampamento
      console.log('🔄 Buscando dados do acampamento...');
      const { data: campData, error: campError } = await supabase
        .from("camps")
        .select("*")
        .eq("id", campId)
        .single();

      if (campError) throw campError;
      console.log('✅ Dados básicos do acampamento carregados:', campData);

      // Buscar stage separadamente
      const { data: stageData, error: stageError } = await supabase
        .from("stages")
        .select("*")
        .eq("id", campData.stage_id)
        .single();

      if (stageError) throw stageError;
      console.log('✅ Dados do stage carregados:', stageData);

      // Buscar paróquias separadamente
      const { data: parishesData, error: parishesError } = await supabase
        .from("camp_parishes")
        .select(`
          parishes (*)
        `)
        .eq("camp_id", campId);

      if (parishesError) {
        console.log('⚠️ Erro ao buscar paróquias:', parishesError);
      }

      const campWithRelations = {
        ...campData,
        stages: stageData,
        camp_parishes: parishesData || []
      };

      console.log('✅ Dados completos do acampamento montados:', campWithRelations);
      setCamp(campWithRelations);

      // Verificar se é um acampamento Kergima ou outro tipo
      const isKergima = campWithRelations.stages.name.toUpperCase() === 'KERIGMA';
      console.log('🔍 Tipo de acampamento:', isKergima ? 'Kergima' : 'Outro');
      console.log('🔍 Nome do stage:', campWithRelations.stages.name);

      if (isKergima) {
        console.log('🔄 Iniciando fetchKergimaData');
        await fetchKergimaData();
      } else {
        console.log('🔄 Iniciando fetchTentBasedData');
        await fetchTentBasedData();
      }

    } catch (error: any) {
      console.error('❌ Erro em fetchCampData:', error);
      toast.error("Erro ao carregar dados: " + error.message);
      navigate("/admin/camps");
    } finally {
      console.log('✅ fetchCampData finalizado');
      setLoading(false);
    }
  };

  const fetchKergimaData = async () => {
    console.log('🔄 fetchKergimaData iniciado');
    try {
      // Para Kergima: buscar registros individuais de famílias
      console.log('🔄 Buscando camp_registrations para Kergima...');
      const { data: registrations, error: regError } = await supabase
        .from("camp_registrations")
        .select(`
          *,
          family:families (
            *,
            family_children (*)
          )
        `)
        .eq("camp_id", campId)
        .eq("status", "confirmed");

      if (regError) throw regError;
      console.log('✅ Registros Kergima carregados:', registrations?.length || 0);

      const people: BadgePerson[] = [];

      registrations?.forEach(registration => {
        const family = registration.family;
        console.log('🔄 Processando família:', family.esposo_nome, 'e', family.esposa_nome);
        
        // Adicionar adultos (campistas)
        people.push({
          id: `adult-${family.id}-husband`,
          name: family.esposo_nome.split(' ')[0], // Primeiro nome
          spouseName: family.esposa_nome.split(' ')[0], // Primeiro nome da esposa
          type: 'adult_camper',
          tribeName: 'Kergima' // Para Kergima, todos são da mesma "tribo"
        });

        people.push({
          id: `adult-${family.id}-wife`,
          name: family.esposa_nome.split(' ')[0], // Primeiro nome
          spouseName: family.esposo_nome.split(' ')[0], // Primeiro nome do esposo
          type: 'adult_camper',
          tribeName: 'Kergima'
        });

        // Adicionar crianças
        family.family_children?.forEach(child => {
          if (child.vai_acampamento) {
            people.push({
              id: `child-${child.id}`,
              name: child.full_name,
              parentsName: `${family.esposo_nome.split(' ')[0]} e ${family.esposa_nome.split(' ')[0]}`,
              type: 'child'
            });
          }
        });
      });

      console.log('✅ Pessoas Kergima processadas:', people.length);

      // Buscar equipes de trabalho para Kergima
      await fetchWorkTeamsData(people);
    } catch (error: any) {
      console.error('❌ Erro em fetchKergimaData:', error);
      throw error;
    }
  };

  const fetchTentBasedData = async () => {
    console.log('🔄 fetchTentBasedData iniciado');
    try {
      // Para outros acampamentos: buscar tendas e famílias
      console.log('🔄 Buscando camp_tents...');
      const { data: campTents, error: tentsError } = await supabase
        .from("camp_tents")
        .select("tent_id")
        .eq("camp_id", campId);

      if (tentsError) throw tentsError;
      console.log('✅ Camp tents carregadas:', campTents?.length || 0);

      if (!campTents || campTents.length === 0) {
        console.log('⚠️ Nenhuma tenda encontrada para este acampamento');
        await fetchWorkTeamsData([]);
        return;
      }

      // Buscar dados das tendas separadamente
      const tentIds = campTents.map(ct => ct.tent_id);
      console.log('🔄 Buscando dados das tendas:', tentIds);

      const { data: tentsData, error: tentsDataError } = await supabase
        .from("tents")
        .select(`
          *,
          tent_families (
            *,
            tent_children (*)
          ),
          parish:parishes (*)
        `)
        .in("id", tentIds);

      if (tentsDataError) throw tentsDataError;
      console.log('✅ Dados das tendas carregados:', tentsData?.length || 0);

      const people: BadgePerson[] = [];

      tentsData?.forEach(tent => {
        tent.tent_families?.forEach(family => {
          // Adicionar adultos (campistas)
          people.push({
            id: `adult-${family.id}-husband`,
            name: family.esposo_nome.split(' ')[0], // Primeiro nome
            spouseName: family.esposa_nome.split(' ')[0], // Primeiro nome da esposa
            type: 'adult_camper',
            tribeName: tent.name // Nome da tenda como "tribo"
          });

          people.push({
            id: `adult-${family.id}-wife`,
            name: family.esposa_nome.split(' ')[0], // Primeiro nome
            spouseName: family.esposo_nome.split(' ')[0], // Primeiro nome do esposo
            type: 'adult_camper',
            tribeName: tent.name
          });

          // Adicionar crianças
          family.tent_children?.forEach(child => {
            if (child.vai_encontros) {
              people.push({
                id: `child-${child.id}`,
                name: child.full_name,
                parentsName: `${family.esposo_nome.split(' ')[0]} e ${family.esposa_nome.split(' ')[0]}`,
                type: 'child'
              });
            }
          });
        });
      });

      console.log('✅ Pessoas de tendas processadas:', people.length);

      // Buscar equipes de trabalho
      await fetchWorkTeamsData(people);
    } catch (error: any) {
      console.error('❌ Erro em fetchTentBasedData:', error);
      throw error;
    }
  };

  const fetchWorkTeamsData = async (people: BadgePerson[]) => {
    console.log('🔄 fetchWorkTeamsData iniciado com', people.length, 'pessoas');
    try {
      // Buscar designações de equipes de trabalho
      console.log('🔄 Buscando camp_work_assignments...');
      const { data: workAssignments, error: workError } = await supabase
        .from("camp_work_assignments")
        .select(`
          *,
          work_team:work_teams (*),
          tent:tents (
            *,
            tent_families (
              *,
              tent_children (*)
            )
          ),
          coordinator_family:tent_families (*)
        `)
        .eq("camp_id", campId);

      if (workError) {
        console.log('⚠️ Erro ao buscar camp_work_assignments:', workError);
      } else {
        console.log('✅ Designações de equipes carregadas:', workAssignments?.length || 0);
      }

      // Buscar designações de famílias para equipes especiais
      let familyAssignments: any[] = [];
      try {
        const { data: familyAssignmentsData, error: familyError } = await supabase
          .from("camp_family_assignments")
          .select(`
            *,
            work_team:work_teams (*),
            family:tent_families (*)
          `)
          .eq("camp_id", campId);

        if (familyError) {
          console.log('⚠️ Tabela camp_family_assignments não encontrada ou erro:', familyError);
        } else {
          familyAssignments = familyAssignmentsData || [];
          console.log('✅ Designações de famílias carregadas:', familyAssignments.length);
        }
      } catch (error) {
        console.log('⚠️ Erro ao buscar camp_family_assignments:', error);
      }

      // Processar trabalhadores das equipes
      workAssignments?.forEach(assignment => {
        console.log('🔄 Processando designação de equipe:', assignment.work_team?.name);
        
        if (assignment.tent) {
          const tent = assignment.tent;
          
          // Adicionar coordenadores se existirem
          if (assignment.coordinator_family) {
            const family = assignment.coordinator_family;
            
            people.push({
              id: `worker-${family.id}-husband-coord`,
              name: family.esposo_nome.split(' ')[0],
              spouseName: family.esposa_nome.split(' ')[0],
              type: 'adult_worker',
              teamName: assignment.work_team.name,
              teamColor: assignment.work_team.color,
              isCoordinator: true
            });

            people.push({
              id: `worker-${family.id}-wife-coord`,
              name: family.esposa_nome.split(' ')[0],
              spouseName: family.esposo_nome.split(' ')[0],
              type: 'adult_worker',
              teamName: assignment.work_team.name,
              teamColor: assignment.work_team.color,
              isCoordinator: true
            });
          }

          // Adicionar todas as famílias da tenda como trabalhadores
          tent.tent_families?.forEach(family => {
            // Verificar se já não foi adicionado como coordenador
            const isCoordinator = assignment.coordinator_family?.id === family.id;
            
            if (!isCoordinator) {
              people.push({
                id: `worker-${family.id}-husband`,
                name: family.esposo_nome.split(' ')[0],
                spouseName: family.esposa_nome.split(' ')[0],
                type: 'adult_worker',
                teamName: assignment.work_team.name,
                teamColor: assignment.work_team.color
              });

              people.push({
                id: `worker-${family.id}-wife`,
                name: family.esposa_nome.split(' ')[0],
                spouseName: family.esposo_nome.split(' ')[0],
                type: 'adult_worker',
                teamName: assignment.work_team.name,
                teamColor: assignment.work_team.color
              });
            }
          });
        }
      });

      // Processar trabalhadores das equipes especiais
      familyAssignments?.forEach(assignment => {
        console.log('🔄 Processando designação de família especial:', assignment.work_team?.name);
        const family = assignment.family;
        
        people.push({
          id: `worker-${family.id}-husband-special`,
          name: family.esposo_nome.split(' ')[0],
          spouseName: family.esposa_nome.split(' ')[0],
          type: 'adult_worker',
          teamName: assignment.work_team.name,
          teamColor: assignment.work_team.color,
          isCoordinator: assignment.is_coordinator
        });

        people.push({
          id: `worker-${family.id}-wife-special`,
          name: family.esposa_nome.split(' ')[0],
          spouseName: family.esposo_nome.split(' ')[0],
          type: 'adult_worker',
          teamName: assignment.work_team.name,
          teamColor: assignment.work_team.color,
          isCoordinator: assignment.is_coordinator
        });
      });

      // Calcular estatísticas
      const totalAdults = people.filter(p => p.type === 'adult_camper').length;
      const totalChildren = people.filter(p => p.type === 'child').length;
      const totalWorkers = people.filter(p => p.type === 'adult_worker').length;
      const totalCoordinators = people.filter(p => p.isCoordinator).length;

      setStats({
        totalAdults,
        totalChildren,
        totalWorkers,
        totalCoordinators
      });

      setBadgePeople(people);
      console.log('✅ fetchWorkTeamsData finalizado. Total de pessoas:', people.length);
    } catch (error: any) {
      console.error('❌ Erro em fetchWorkTeamsData:', error);
      throw error;
    }
  };

  const generateBadges = () => {
    // Aqui você implementaria a geração dos crachás
    // Por enquanto, vamos apenas mostrar os dados
    toast.success(`Gerados ${badgePeople.length} crachás!`);
  };

  const downloadBadges = () => {
    // Aqui você implementaria o download dos crachás
    toast.success("Download iniciado!");
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Carregando dados do acampamento...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate('/admin/camps')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Geração de Crachás</h1>
            <p className="text-muted-foreground">{camp?.name}</p>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Campistas Adultos</p>
                  <p className="text-2xl font-bold">{stats.totalAdults}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Baby className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Crianças</p>
                  <p className="text-2xl font-bold">{stats.totalChildren}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users2 className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Equipes de Trabalho</p>
                  <p className="text-2xl font-bold">{stats.totalWorkers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users2 className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Coordenadores</p>
                  <p className="text-2xl font-bold">{stats.totalCoordinators}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações */}
        <div className="flex gap-4 mb-6">
          <Button onClick={generateBadges} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Gerar Crachás ({badgePeople.length})
          </Button>
          <Button variant="outline" onClick={downloadBadges}>
            Download
          </Button>
        </div>

        {/* Lista de pessoas */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Pessoas para Crachás</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {badgePeople.map((person) => (
                <div
                  key={person.id}
                  className={`p-4 border rounded-lg ${
                    person.type === 'adult_camper' 
                      ? 'border-green-200 bg-green-50' 
                      : person.type === 'adult_worker'
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-orange-200 bg-orange-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{person.name}</h3>
                    <Badge
                      variant={person.type === 'adult_camper' ? 'default' : 'secondary'}
                      className={
                        person.type === 'adult_camper' 
                          ? 'bg-green-600' 
                          : person.type === 'adult_worker'
                          ? 'bg-blue-600'
                          : 'bg-orange-600'
                      }
                    >
                      {person.type === 'adult_camper' ? 'Campista' : 
                       person.type === 'adult_worker' ? 'Equipe' : 'Criança'}
                    </Badge>
                  </div>
                  
                  {person.spouseName && (
                    <p className="text-sm text-gray-600 mb-1">
                      Cônjuge: {person.spouseName}
                    </p>
                  )}
                  
                  {person.parentsName && (
                    <p className="text-sm text-gray-600 mb-1">
                      Pais: {person.parentsName}
                    </p>
                  )}
                  
                  {person.tribeName && (
                    <p className="text-sm text-green-700 font-medium">
                      Tribo: {person.tribeName}
                    </p>
                  )}
                  
                  {person.teamName && (
                    <div className="flex items-center gap-2 mt-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: person.teamColor }}
                      />
                      <span className="text-sm font-medium">
                        {person.teamName}
                        {person.isCoordinator && ' (Coordenador)'}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
} 