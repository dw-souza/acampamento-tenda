import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Tables } from "@/integrations/supabase/types";
import { 
  Users, 
  Calendar, 
  MapPin, 
  Tent,
  ClipboardList,
  ArrowLeft,
  Users2,
  Baby
} from "lucide-react";
import { CampWorkAssignment, CampFamilyAssignment } from "@/types";

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
};

export default function AdminCampDashboard() {
  const navigate = useNavigate();
  const { campId } = useParams();
  const [camp, setCamp] = useState<Camp | null>(null);
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    confirmedRegistrations: 0,
    totalTents: 0,
    totalWorkTeams: 0,
    totalFamilyAssignments: 0,
    totalWorkAssignments: 0,
    totalAdults: 0,
    totalChildren: 0,
    totalWorkers: 0,
    totalCoordinators: 0,
    totalCampistas: 0,
    expectedRevenue: 0,
    actualRevenue: 0,
    ageGroups: {
      '0-3': 0,
      '4-5': 0,
      '6-8': 0,
      '9-10': 0,
      '11-13': 0,
      '14+': 0,
      '18+': 0
    },
    workTeamStats: [] as Array<{
      teamName: string;
      adults: number;
      children: number;
      total: number;
    }>
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (campId && campId.trim() !== '') {
      fetchCampData();
    } else {
      console.log("useEffect: no valid ID provided");
    }
  }, [campId]);

  const fetchCampData = async () => {
    try {
      if (!campId) {
        toast.error("ID do acampamento não fornecido");
        navigate("/admin/camps");
        return;
      }

      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(campId)) {
        toast.error("Formato de ID inválido");
        navigate("/admin/camps");
        return;
      }

      // Fetch camp details with timeout
      const campPromise = supabase
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
        .eq("id", campId)
        .single();

      const campResult = await Promise.race([
        campPromise,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout fetching camp details')), 10000)
        )
      ]) as any;

      if (campResult.error) {
        throw campResult.error;
      }

      setCamp(campResult.data);

      // Fetch all other data in parallel with timeouts
      
      const registrationsPromise = supabase
        .from("camp_registrations")
        .select("*")
        .eq("camp_id", campId);

      const workAssignmentsPromise = supabase
        .from("camp_work_assignments")
        .select(`
          *,
          work_teams (*),
          tents (
            *,
            tent_families (
              *,
              tent_children (*)
            )
          )
        `)
        .eq("camp_id", campId);

      const familyAssignmentsPromise = supabase
        .from("camp_family_assignments")
        .select(`
          *,
          work_teams (*),
          tent_families (
            *,
            tent_children (*)
          )
        `)
        .eq("camp_id", campId);

      const campTentsPromise = supabase
        .from("camp_tents")
        .select("*")
        .eq("camp_id", campId);

      const workTeamsPromise = supabase
        .from("work_teams")
        .select("*");

      // Novas consultas para dados detalhados
      const familiesPromise = supabase
        .from("families")
        .select(`
          *,
          family_children (*)
        `);

      const tentFamiliesPromise = supabase
        .from("tent_families")
        .select(`
          *,
          tent_children (*)
        `);

      // Execute all promises with timeout
      const [registrations, workAssignments, familyAssignments, campTents, workTeams, families, tentFamilies] = await Promise.allSettled([
        Promise.race([registrationsPromise, new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))]),
        Promise.race([workAssignmentsPromise, new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))]),
        Promise.race([familyAssignmentsPromise, new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))]),
        Promise.race([campTentsPromise, new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))]),
        Promise.race([workTeamsPromise, new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))]),
        Promise.race([familiesPromise, new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))]),
        Promise.race([tentFamiliesPromise, new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000))])
      ]);

      // Extract data from results
      const registrationsData = registrations.status === 'fulfilled' ? (registrations.value as any).data : [];
      const workAssignmentsData = workAssignments.status === 'fulfilled' ? (workAssignments.value as any).data : [];
      const familyAssignmentsData = familyAssignments.status === 'fulfilled' ? (familyAssignments.value as any).data : [];
      const campTentsData = campTents.status === 'fulfilled' ? (campTents.value as any).data : [];
      const workTeamsData = workTeams.status === 'fulfilled' ? (workTeams.value as any).data : [];
      const familiesData = families.status === 'fulfilled' ? (families.value as any).data : [];
      const tentFamiliesData = tentFamilies.status === 'fulfilled' ? (tentFamilies.value as any).data : [];

      // Calcular estatísticas detalhadas
      const isKerigma = campResult.data.stages.name.toUpperCase() === 'KERIGMA';
      
      let totalAdults = 0;
      let totalChildren = 0;
      let expectedRevenue = 0;
      let actualRevenue = 0;
      const ageGroups = {
        '0-3': 0,
        '4-5': 0,
        '6-8': 0,
        '9-10': 0,
        '11-13': 0,
        '14+': 0,
        '18+': 0
      };
      const workTeamStats: Array<{teamName: string; adults: number; children: number; total: number}> = [];

      // Obter IDs das tendas registradas no acampamento
      const campTentIds = campTentsData?.map((ct: any) => ct.tent_id) || [];

      if (isKerigma) {
        // Para acampamentos Kerigma: usar families e camp_registrations
        const confirmedRegistrations = registrationsData?.filter((r: any) => r.status === 'confirmed') || [];
        
        confirmedRegistrations.forEach((registration: any) => {
          const family = familiesData?.find((f: any) => f.id === registration.family_id);
          if (family) {
            // Adicionar adultos (casal)
            totalAdults += 2;
            
            // Adicionar crianças
            family.family_children?.forEach((child: any) => {
              if (child.vai_acampamento) {
                totalChildren += 1;
                
                // Calcular idade e adicionar ao grupo etário
                if (child.birth_date) {
                  const birthDate = new Date(child.birth_date);
                  const today = new Date();
                  let age = today.getFullYear() - birthDate.getFullYear();
                  const monthDiff = today.getMonth() - birthDate.getMonth();
                  
                  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                  }
                  
                  if (age <= 3) ageGroups['0-3']++;
                  else if (age <= 5) ageGroups['4-5']++;
                  else if (age <= 8) ageGroups['6-8']++;
                  else if (age <= 10) ageGroups['9-10']++;
                  else if (age <= 13) ageGroups['11-13']++;
                  else if (age < 18) ageGroups['14+']++;
                  else ageGroups['18+']++;
                }
              }
            });
            
            // Calcular valores
            expectedRevenue += (family.valor_casal || 0) + (family.valor_filhos || 0) + (family.valor_pajem || 0);
            actualRevenue += family.valor_pago || 0;
          }
        });
      } else {
        // Para outros acampamentos: usar tent_families
        // Primeiro, vamos identificar todas as tendas que estão atribuídas às equipes
        const assignedTentIds = workAssignmentsData?.map((wa: any) => wa.tent_id) || [];
        const assignedFamilyIds = familyAssignmentsData?.map((fa: any) => fa.tent_family_id) || [];
        
        // Contar pessoas das famílias das tendas atribuídas às equipes
        const assignedTentFamilies = tentFamiliesData?.filter((tf: any) => 
          assignedTentIds.includes(tf.tent_id) || assignedFamilyIds.includes(tf.id)
        ) || [];
        
        // Também contar pessoas das famílias das tendas que são campistas (estão em camp_tents)
        const campistaTentFamilies = tentFamiliesData?.filter((tf: any) => 
          campTentIds.includes(tf.tent_id) && 
          !assignedTentIds.includes(tf.tent_id) && 
          !assignedFamilyIds.includes(tf.id)
        ) || [];
        
        // Contar todas as famílias (trabalhadores + campistas)
        const allRelevantFamilies = [...assignedTentFamilies, ...campistaTentFamilies];
        
        allRelevantFamilies.forEach((tentFamily: any) => {
          // Adicionar adultos (casal)
          totalAdults += 2;
          
          // Adicionar crianças
          tentFamily.tent_children?.forEach((child: any) => {
            if (child.vai_encontros) {
              totalChildren += 1;
              
              // Calcular idade e adicionar ao grupo etário
              if (child.birth_date) {
                const birthDate = new Date(child.birth_date);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                  age--;
                }
                
                if (age <= 3) ageGroups['0-3']++;
                else if (age <= 5) ageGroups['4-5']++;
                else if (age <= 8) ageGroups['6-8']++;
                else if (age <= 10) ageGroups['9-10']++;
                else if (age <= 13) ageGroups['11-13']++;
                else if (age < 18) ageGroups['14+']++;
                else ageGroups['18+']++;
              }
            }
          });
        });
      }

      // 1. Contar pessoas atribuídas às equipes de trabalho (sempre igual)
      let totalAssignedAdults = 0;
      let totalAssignedChildren = 0;
      workTeamStats.length = 0; // Limpa o array antes de popular
      workTeamsData?.forEach((team: any) => {
        let teamAdults = 0;
        let teamChildren = 0;
        // Work assignments (tendas)
        const teamWorkAssignments = workAssignmentsData?.filter((wa: any) => wa.work_team_id === team.id) || [];
        teamWorkAssignments.forEach((wa: any) => {
          if (wa.tents && wa.tents.tent_families) {
            wa.tents.tent_families.forEach((tf: any) => {
              teamAdults += 2;
              teamChildren += tf.tent_children?.filter((tc: any) => tc.vai_encontros).length || 0;
            });
          }
        });
        // Family assignments
        const teamFamilyAssignments = familyAssignmentsData?.filter((fa: any) => fa.work_team_id === team.id) || [];
        teamFamilyAssignments.forEach((fa: any) => {
          if (fa.tent_families) {
            teamAdults += 2;
            teamChildren += fa.tent_families.tent_children?.filter((tc: any) => tc.vai_encontros).length || 0;
          }
        });
        totalAssignedAdults += teamAdults;
        totalAssignedChildren += teamChildren;
        if (teamAdults > 0 || teamChildren > 0) {
          workTeamStats.push({
            teamName: team.name,
            adults: teamAdults,
            children: teamChildren,
            total: teamAdults + teamChildren,
          });
        }
      });

      // 2. Contar campistas e totais
      let campistasAdults = 0;
      let campistasChildren = 0;
      totalAdults = 0;
      totalChildren = 0;
      if (isKerigma) {
        // Campistas = famílias confirmadas em camp_registrations que não estão em nenhuma equipe
        const confirmedRegistrations = registrationsData?.filter((r: any) => r.status === 'confirmed') || [];
        const assignedFamilyIds = familyAssignmentsData?.map((fa: any) => fa.family_id) || [];
        confirmedRegistrations.forEach((registration: any) => {
          if (!assignedFamilyIds.includes(registration.family_id)) {
            const family = familiesData?.find((f: any) => f.id === registration.family_id);
            if (family) {
              campistasAdults += 2;
              family.family_children?.forEach((child: any) => {
                if (child.vai_acampamento) campistasChildren += 1;
              });
            }
          }
        });
        // Total = todos os confirmados
        confirmedRegistrations.forEach((registration: any) => {
          const family = familiesData?.find((f: any) => f.id === registration.family_id);
          if (family) {
            totalAdults += 2;
            family.family_children?.forEach((child: any) => {
              if (child.vai_acampamento) totalChildren += 1;
            });
          }
        });
      } else {
        // Campistas = famílias das tendas em camp_tents que não estão em nenhuma equipe
        const campTentIds = campTentsData?.map((ct: any) => ct.tent_id) || [];
        const assignedTentIds = workAssignmentsData?.map((wa: any) => wa.tent_id) || [];
        const assignedFamilyIds = familyAssignmentsData?.map((fa: any) => fa.tent_family_id) || [];
        const campistaTentFamilies = tentFamiliesData?.filter((tf: any) =>
          campTentIds.includes(tf.tent_id) &&
          !assignedTentIds.includes(tf.tent_id) &&
          !assignedFamilyIds.includes(tf.id)
        ) || [];
        campistaTentFamilies.forEach((tentFamily: any) => {
          campistasAdults += 2;
          tentFamily.tent_children?.forEach((child: any) => {
            if (child.vai_encontros) campistasChildren += 1;
          });
        });
        // Total = todas as famílias das tendas participantes
        const allRelevantFamilies = tentFamiliesData?.filter((tf: any) => campTentIds.includes(tf.tent_id)) || [];
        allRelevantFamilies.forEach((tentFamily: any) => {
          totalAdults += 2;
          tentFamily.tent_children?.forEach((child: any) => {
            if (child.vai_encontros) totalChildren += 1;
          });
        });
      }

      // Adicionar linha de campistas na tabela
      if (campistasAdults > 0 || campistasChildren > 0) {
        workTeamStats.push({
          teamName: "Campistas",
          adults: campistasAdults,
          children: campistasChildren,
          total: campistasAdults + campistasChildren
        });
      }

      // Contar coordenadores
      const totalCoordinators = familyAssignmentsData?.filter((fa: any) => fa.is_coordinator).length || 0;

      // Calcular totais finais (equipes + campistas)
      const totalAdultsFinal = totalAssignedAdults + campistasAdults;
      const totalChildrenFinal = totalAssignedChildren + campistasChildren;
      const totalWorkersFinal = totalAdultsFinal + totalChildrenFinal;

      setStats({
        totalRegistrations: registrationsData?.length || 0,
        confirmedRegistrations: registrationsData?.filter((r: any) => r.status === 'confirmed').length || 0,
        totalTents: campTentsData?.length || 0,
        totalWorkTeams: workTeamsData?.length || 0,
        totalFamilyAssignments: familyAssignmentsData?.length || 0,
        totalWorkAssignments: workAssignmentsData?.length || 0,
        totalAdults: totalAdultsFinal,
        totalChildren: totalChildrenFinal,
        totalWorkers: totalWorkersFinal,
        totalCoordinators,
        totalCampistas: campistasAdults + campistasChildren,
        expectedRevenue,
        actualRevenue,
        ageGroups,
        workTeamStats
      });

    } catch (error: any) {
      toast.error("Erro ao carregar dados do acampamento: " + error.message);
      navigate("/admin/camps");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return "Data não definida";
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getRevenuePercentage = (): number => {
    if (stats.expectedRevenue === 0) return 0;
    return Math.round((stats.actualRevenue / stats.expectedRevenue) * 100);
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

  if (!camp) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Acampamento não encontrado</h1>
            <Button onClick={() => navigate("/admin/camps")}>
              Voltar para Acampamentos
            </Button>
            <Button 
              variant="outline" 
              className="ml-2"
              onClick={() => window.location.reload()}
            >
              Tentar Novamente
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Button onClick={() => navigate("/admin/camps")}><ArrowLeft className="mr-2 w-4 h-4" />Voltar</Button>
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{camp.name}</h1>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">{camp.stages.name}</Badge>
            <Badge variant="outline">{formatDate(camp.start_date)} - {formatDate(camp.end_date)}</Badge>
            {camp.camp_parishes.map(cp => (
              <Badge key={cp.parishes.id} variant="outline">{cp.parishes.name}</Badge>
            ))}
          </div>
        </div>

        {/* Resumo Geral do Acampamento */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Resumo Geral do Acampamento</h2>
          
          {/* Estatísticas Gerais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Total de Pessoas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{stats.totalWorkers}</div>
                <div className="text-sm text-gray-600">
                  {stats.totalAdults} adultos + {stats.totalChildren} crianças
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Valor Previsto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(stats.expectedRevenue)}
                </div>
                <div className="text-sm text-gray-600">Receita esperada</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Valor Recebido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">
                  {formatCurrency(stats.actualRevenue)}
                </div>
                <div className="text-sm text-gray-600 mb-2">Receita realizada</div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getRevenuePercentage()}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {getRevenuePercentage()}% do valor previsto
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Estatísticas por Equipe */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users2 className="mr-2 w-5 h-5" />
                Números por Equipe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-semibold">Equipe</th>
                      <th className="text-center py-2 font-semibold">Adultos/Babás</th>
                      <th className="text-center py-2 font-semibold">Filhos</th>
                      <th className="text-center py-2 font-semibold">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.workTeamStats.map((team, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-2 font-medium">{team.teamName}</td>
                        <td className="py-2 text-center">{team.adults}</td>
                        <td className="py-2 text-center">{team.children}</td>
                        <td className="py-2 text-center font-bold">{team.total}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-100 font-bold">
                      <td className="py-2">TOTAL</td>
                      <td className="py-2 text-center">{stats.totalAdults}</td>
                      <td className="py-2 text-center">{stats.totalChildren}</td>
                      <td className="py-2 text-center">{stats.totalWorkers}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Observação sobre ensinos */}
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Observação sobre Ensinos
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Os ensinos não ficam o tempo todo no acampamento. A quantidade de pessoas mostrada não representa casais, mas indivíduos.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Faixas Etárias */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Baby className="mr-2 w-5 h-5" />
                Faixas Etárias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.ageGroups['0-3']}</div>
                  <div className="text-sm text-gray-600">0 - 3 anos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.ageGroups['4-5']}</div>
                  <div className="text-sm text-gray-600">4 - 5 anos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.ageGroups['6-8']}</div>
                  <div className="text-sm text-gray-600">6 - 8 anos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.ageGroups['9-10']}</div>
                  <div className="text-sm text-gray-600">9 - 10 anos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.ageGroups['11-13']}</div>
                  <div className="text-sm text-gray-600">11 - 13 anos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.ageGroups['14+']}</div>
                  <div className="text-sm text-gray-600">Acima de 14 anos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.ageGroups['18+']}</div>
                  <div className="text-sm text-gray-600">Maiores de 18 anos</div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="text-lg font-bold text-gray-800">
                  TOTAL: {Object.values(stats.ageGroups).reduce((a, b) => a + b, 0)} crianças
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex flex-wrap gap-4 mb-6">
            <Button 
              onClick={() => navigate(`/admin/camps/badges/${campId}`)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Users className="mr-2 w-4 h-4" />
              Gerenciar Crachás
            </Button>
          </div>
        </div>

        {/* Cards de Informações Básicas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card de Inscrições - apenas para Kerigma */}
          {camp.stages.name.toUpperCase() === 'KERIGMA' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Users className="mr-2 w-5 h-5" /> Inscrições</CardTitle>
                <CardDescription>Informações sobre as inscrições no acampamento.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>Total de Inscrições: <span className="font-bold">{stats.totalRegistrations}</span></p>
                  <p>Inscrições Confirmadas: <span className="font-bold">{stats.confirmedRegistrations}</span></p>
                  <Button variant="secondary" size="sm" onClick={() => navigate(`/admin/camps/registrations/${campId}`)}>
                    Gerenciar Inscrições
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Card de Tendas - apenas para não-Kerigma */}
          {camp.stages.name.toUpperCase() !== 'KERIGMA' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><Tent className="mr-2 w-5 h-5" /> Tendas</CardTitle>
                <CardDescription>Detalhes sobre a organização das tendas.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>Total de Tendas: <span className="font-bold">{stats.totalTents}</span></p>
                  <div className="text-sm text-muted-foreground mb-3">
                    <p>Tendas participantes:</p>
                    <div className="mt-1 space-y-1">
                      {camp.camp_tents?.map((ct: any) => (
                        <div key={ct.tent_id} className="text-xs">
                          • {ct.tents?.name} - {ct.tents?.parishes?.name || "Paróquia não definida"}
                        </div>
                      )) || (
                        <div className="text-xs text-gray-500">Nenhuma tenda associada</div>
                      )}
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => navigate('/admin/tents')}>
                    Gerenciar Tendas
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><ClipboardList className="mr-2 w-5 h-5" /> Equipes de Trabalho</CardTitle>
              <CardDescription>Gerencie as equipes de trabalho e suas atribuições.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>Total de Equipes: <span className="font-bold">{stats.totalWorkTeams}</span></p>
                <p>Atribuições de Trabalho: <span className="font-bold">{stats.totalWorkAssignments}</span></p>
                <p>Atribuições de Família: <span className="font-bold">{stats.totalFamilyAssignments}</span></p>
                <Button variant="secondary" size="sm" onClick={() => navigate(`/admin/camps/work-teams/${campId}`)}>
                  Gerenciar Equipes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}