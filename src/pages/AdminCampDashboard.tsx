import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { Tables } from '@/integrations/supabase/types';
import { 
  ArrowLeft, 
  Users, 
  Baby, 
  DollarSign, 
  TrendingUp, 
  Building2,
  Calendar,
  MapPin,
  BarChart3,
  User,
  Eye,
  Edit,
  FileText
} from 'lucide-react';

type Camp = Tables<"camps"> & {
  stages: Tables<"stages">;
  parishes: Tables<"parishes">;
  couple_price: number;
  child_price: number;
};

type CampRegistration = Tables<"camp_registrations"> & {
  family: Tables<"families"> & {
    family_children: {
      id: string;
      family_id: string;
      full_name: string;
      birth_date: string;
      vai_acampamento: boolean;
      dietary_restrictions: string;
      special_needs: string;
      created_at: string;
      updated_at: string;
    }[];
  };
};

type WorkTeam = Tables<"work_teams">;
type CampWorkAssignment = Tables<"camp_work_assignments"> & {
  work_team: WorkTeam;
  tent: Tables<"tents"> & {
    parish: Tables<"parishes">;
  };
  coordinator_family: Tables<"tent_families">;
};

type CampFamilyAssignment = {
  id: string;
  camp_id: string;
  family_id: string;
  work_team_id: string;
  is_coordinator?: boolean;
  notes?: string;
  created_at: string;
  updated_at: string;
  work_team: WorkTeam;
  family: Tables<"tent_families">;
};

interface CampStats {
  totalRegistrations: number;
  totalChildren: number;
  childrenByAge: {
    '0-3': number;
    '4-6': number;
    '7-9': number;
    '10-11': number;
    '12+': number;
  };
  revenueStats: {
    expectedRevenue: number;
    actualRevenue: number;
    pendingRevenue: number;
    workTeamDiscount: number;
  };
  workTeamStats: {
    totalAssignments: number;
    totalFamilyAssignments: number;
    teamsWithCoordinators: number;
  };
}

export default function AdminCampDashboard() {
  const { campId } = useParams<{ campId: string }>();
  const navigate = useNavigate();
  const [camp, setCamp] = useState<Camp | null>(null);
  const [registrations, setRegistrations] = useState<CampRegistration[]>([]);
  const [workAssignments, setWorkAssignments] = useState<CampWorkAssignment[]>([]);
  const [familyAssignments, setFamilyAssignments] = useState<CampFamilyAssignment[]>([]);
  const [stats, setStats] = useState<CampStats>({
    totalRegistrations: 0,
    totalChildren: 0,
    childrenByAge: {
      '0-3': 0,
      '4-6': 0,
      '7-9': 0,
      '10-11': 0,
      '12+': 0
    },
    revenueStats: {
      expectedRevenue: 0,
      actualRevenue: 0,
      pendingRevenue: 0,
      workTeamDiscount: 0
    },
    workTeamStats: {
      totalAssignments: 0,
      totalFamilyAssignments: 0,
      teamsWithCoordinators: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (campId) {
      fetchData();
    }
  }, [campId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Buscar dados do acampamento
      const { data: campData, error: campError } = await supabase
        .from('camps')
        .select(`
          *,
          stages(*),
          parishes(*)
        `)
        .eq('id', campId)
        .single();

      if (campError) throw campError;
      setCamp(campData);

      // Buscar inscrições com famílias e filhos
      const { data: registrationsData, error: registrationsError } = await supabase
        .from('camp_registrations')
        .select(`
          *,
          families(
            *,
            family_children(
              id,
              family_id,
              full_name,
              birth_date,
              vai_acampamento,
              dietary_restrictions,
              special_needs,
              created_at,
              updated_at
            )
          )
        `)
        .eq('camp_id', campId)
        .eq('status', 'confirmed');

      if (registrationsError) throw registrationsError;
      setRegistrations(registrationsData || []);

      // Buscar designações de equipes por tenda
      const { data: workAssignmentsData, error: workAssignmentsError } = await supabase
        .from('camp_work_assignments')
        .select(`
          *,
          work_teams(*),
          tents(
            *,
            parishes(*)
          ),
          tent_families(*)
        `)
        .eq('camp_id', campId);

      if (workAssignmentsError) throw workAssignmentsError;
      setWorkAssignments(workAssignmentsData || []);

      // Buscar designações de equipes por família
      const { data: familyAssignmentsData, error: familyAssignmentsError } = await supabase
        .from('camp_family_assignments')
        .select(`
          *,
          work_teams(*),
          tent_families(*)
        `)
        .eq('camp_id', campId);

      if (familyAssignmentsError) throw familyAssignmentsError;
      setFamilyAssignments(familyAssignmentsData || []);

      // Calcular estatísticas
      calculateStats(campData, registrationsData || [], workAssignmentsData || [], familyAssignmentsData || []);

    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do acampamento');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (
    campData: Camp,
    registrationsData: CampRegistration[],
    workAssignmentsData: CampWorkAssignment[],
    familyAssignmentsData: CampFamilyAssignment[]
  ) => {
    const totalRegistrations = registrationsData.length;
    
    // Calcular total de crianças
    const allChildren = registrationsData.flatMap(reg => {
      if (!reg.family || !reg.family.family_children) return [];
      return reg.family.family_children.filter(child => child.vai_acampamento);
    });
    const totalChildren = allChildren.length;

    // Calcular distribuição por idade
    const childrenByAge = {
      '0-3': allChildren.filter(child => {
        if (!child.birth_date) return false;
        const age = new Date().getFullYear() - new Date(child.birth_date).getFullYear();
        return age >= 0 && age <= 3;
      }).length,
      '4-6': allChildren.filter(child => {
        if (!child.birth_date) return false;
        const age = new Date().getFullYear() - new Date(child.birth_date).getFullYear();
        return age >= 4 && age <= 6;
      }).length,
      '7-9': allChildren.filter(child => {
        if (!child.birth_date) return false;
        const age = new Date().getFullYear() - new Date(child.birth_date).getFullYear();
        return age >= 7 && age <= 9;
      }).length,
      '10-11': allChildren.filter(child => {
        if (!child.birth_date) return false;
        const age = new Date().getFullYear() - new Date(child.birth_date).getFullYear();
        return age >= 10 && age <= 11;
      }).length,
      '12+': allChildren.filter(child => {
        if (!child.birth_date) return false;
        const age = new Date().getFullYear() - new Date(child.birth_date).getFullYear();
        return age >= 12;
      }).length
    };

    // Calcular estatísticas de receita
    const expectedRevenue = (totalRegistrations * campData.couple_price) + (totalChildren * campData.child_price);
    const workTeamDiscount = (workAssignmentsData.length + familyAssignmentsData.length) * (campData.couple_price / 2);
    const actualRevenue = 0; // Será implementado quando tivermos sistema de pagamentos
    const pendingRevenue = expectedRevenue - actualRevenue;

    // Calcular estatísticas de equipes
    const totalAssignments = workAssignmentsData.length;
    const totalFamilyAssignments = familyAssignmentsData.length;
    const teamsWithCoordinators = workAssignmentsData.filter(wa => wa.coordinator_family_id).length + 
                                 familyAssignmentsData.filter(fa => fa.is_coordinator).length;

    setStats({
      totalRegistrations,
      totalChildren,
      childrenByAge,
      revenueStats: {
        expectedRevenue,
        actualRevenue,
        pendingRevenue,
        workTeamDiscount
      },
      workTeamStats: {
        totalAssignments,
        totalFamilyAssignments,
        teamsWithCoordinators
      }
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Carregando dashboard...</div>
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
            <h1 className="text-2xl font-bold text-red-600">Acampamento não encontrado</h1>
            <Button onClick={() => navigate('/admin')} className="mt-4">
              Voltar para Dashboard
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Dashboard do Acampamento</h1>
            <p className="text-muted-foreground">{camp.name}</p>
          </div>
        </div>

        {/* Informações do Acampamento */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Etapa</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{camp.stages?.name}</div>
              <p className="text-xs text-muted-foreground">
                {new Date(camp.start_date).toLocaleDateString()} - {new Date(camp.end_date).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paróquia</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold">{camp.parishes?.name}</div>
              <p className="text-xs text-muted-foreground">
                Capacidade: {camp.max_families} famílias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              <div className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Badge variant={camp.status === 'open' ? 'default' : camp.status === 'completed' ? 'secondary' : 'outline'}>
                {camp.status === 'open' ? 'Ativo' : camp.status === 'completed' ? 'Concluído' : 'Inativo'}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Preços</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                <div>Casal: R$ {camp.couple_price}</div>
                <div>Criança: R$ {camp.child_price}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estatísticas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inscrições</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRegistrations}</div>
              <p className="text-xs text-muted-foreground">
                de {camp.max_families} vagas ({((stats.totalRegistrations / camp.max_families) * 100).toFixed(1)}%)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Crianças</CardTitle>
              <Baby className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalChildren}</div>
              <p className="text-xs text-muted-foreground">
                Vão para acampamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Esperada</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {stats.revenueStats.expectedRevenue.toLocaleString('pt-BR')}
              </div>
              <p className="text-xs text-muted-foreground">
                Desconto equipes: R$ {stats.revenueStats.workTeamDiscount.toLocaleString('pt-BR')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Equipes</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.workTeamStats.totalAssignments + stats.workTeamStats.totalFamilyAssignments}</div>
              <p className="text-xs text-muted-foreground">
                {stats.workTeamStats.teamsWithCoordinators} com coordenadores
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Distribuição de Crianças por Idade */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Distribuição de Crianças por Idade
              </CardTitle>
              <CardDescription>
                Crianças que vão para acampamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.childrenByAge).map(([ageRange, count]) => (
                  <div key={ageRange} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-medium">{ageRange} anos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ 
                            width: `${stats.totalChildren > 0 ? (count / stats.totalChildren) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground w-8 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Resumo Financeiro
              </CardTitle>
              <CardDescription>
                Detalhamento de receitas e descontos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm">Receita bruta:</span>
                  <span className="text-sm font-medium">R$ {stats.revenueStats.expectedRevenue.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Desconto equipes:</span>
                  <span className="text-sm text-red-600">-R$ {stats.revenueStats.workTeamDiscount.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-medium">Receita líquida:</span>
                  <span className="text-sm font-bold">R$ {(stats.revenueStats.expectedRevenue - stats.revenueStats.workTeamDiscount).toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Recebido:</span>
                  <span className="text-sm text-green-600">R$ {stats.revenueStats.actualRevenue.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Pendente:</span>
                  <span className="text-sm text-orange-600">R$ {stats.revenueStats.pendingRevenue.toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button 
            variant="outline" 
            className="h-20 flex flex-col gap-2"
            onClick={() => navigate(`/admin/camps/registrations/${campId}`)}
          >
            <Users className="h-6 w-6" />
            <span>Gerenciar Inscrições</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-20 flex flex-col gap-2"
            onClick={() => navigate(`/admin/camps/${campId}/work-teams`)}
          >
            <Building2 className="h-6 w-6" />
            <span>Equipes de Trabalho</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-20 flex flex-col gap-2"
            onClick={() => navigate(`/admin/camps/edit/${campId}`)}
          >
            <Edit className="h-6 w-6" />
            <span>Editar Acampamento</span>
          </Button>
        </div>

        {/* Lista de Inscrições */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Inscrições Confirmadas
            </CardTitle>
            <CardDescription>
              Últimas {Math.min(10, registrations.length)} inscrições
            </CardDescription>
          </CardHeader>
          <CardContent>
            {registrations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma inscrição confirmada ainda.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Família</TableHead>
                    <TableHead>Crianças</TableHead>
                    <TableHead>Data de Inscrição</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.slice(0, 10).map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell className="font-medium">
                        {registration.family?.esposo_nome || 'N/A'} e {registration.family?.esposa_nome || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {registration.family?.family_children?.filter(child => child.vai_acampamento).length || 0} crianças
                      </TableCell>
                      <TableCell>
                        {new Date(registration.registration_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
} 