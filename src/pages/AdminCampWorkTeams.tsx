import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { ArrowLeft, Plus, Trash2, Users, Edit } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { Tables } from '@/integrations/supabase/types';

type WorkTeam = Tables<"work_teams"> & {
  is_special_team?: boolean;
};
type Tent = Tables<"tents"> & {
  parishes: Tables<"parishes">;
};
type CampWorkAssignment = Tables<"camp_work_assignments">;
type Camp = Tables<"camps">;
type TentFamily = Tables<"tent_families">;

export default function AdminCampWorkTeams() {
  const { campId } = useParams<{ campId: string }>();
  const navigate = useNavigate();
  const [camp, setCamp] = useState<any>(null);
  const [workTeams, setWorkTeams] = useState<WorkTeam[]>([]);
  const [tents, setTents] = useState<Tent[]>([]);
  const [tentFamilies, setTentFamilies] = useState<TentFamily[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [familyAssignments, setFamilyAssignments] = useState<any[]>([]);
  const [parishes, setParishes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<any>(null);
  const [editingFamilyAssignment, setEditingFamilyAssignment] = useState<any>(null);
  const [assignmentType, setAssignmentType] = useState<'tent' | 'family'>('tent');
  
  const [formData, setFormData] = useState({
    parish_id: '',
    tent_id: '',
    work_team_id: '',
    coordinator_family_id: 'none',
    family_id: '',
    is_coordinator: false,
    notes: ''
  });

  useEffect(() => {
    if (campId) {
      fetchData();
    }
  }, [campId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Buscando dados para o acampamento:', campId);
      
      // Buscar dados do acampamento com query mais simples
      const { data: campData, error: campError } = await supabase
        .from('camps')
        .select(`
          *,
          stages(*),
          camp_parishes (
            parishes (*)
          )
        `)
        .eq('id', campId)
        .single();

      if (campError) {
        console.error('Erro ao buscar acampamento:', campError);
        throw campError;
      }
      
      console.log('Dados do acampamento carregados:', campData);
      setCamp(campData);

      // Buscar paróquias
      const { data: parishesData, error: parishesError } = await supabase
        .from('parishes')
        .select('*')
        .order('name');

      if (parishesError) throw parishesError;
      setParishes(parishesData || []);

      // Buscar equipes de trabalho
      const { data: teamsData, error: teamsError } = await supabase
        .from('work_teams')
        .select('*')
        .order('name');

      if (teamsError) throw teamsError;
      setWorkTeams(teamsData || []);

      // Buscar todas as tendas (serão filtradas por paróquia no frontend)
      const { data: tentsData, error: tentsError } = await supabase
        .from('tents')
        .select(`
          *,
          parishes(*)
        `)
        .order('name');

      if (tentsError) throw tentsError;
      setTents(tentsData || []);

      // Buscar famílias das tendas
      const { data: familiesData, error: familiesError } = await supabase
        .from('tent_families')
        .select('*')
        .eq('status', 'active')
        .order('esposo_nome');

      if (familiesError) throw familiesError;
      setTentFamilies(familiesData || []);

      // Buscar designações existentes
      const { data: assignmentsData, error: assignmentsError } = await supabase
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
        .eq('camp_id', campId)
        .order('created_at');

      if (assignmentsError) throw assignmentsError;
      setAssignments(assignmentsData || []);

      // Buscar designações de família para equipes especiais
      const { data: familyAssignmentsData, error: familyAssignmentsError } = await supabase
        .from('camp_family_assignments')
        .select(`
          *,
          work_teams(*),
          tent_families(*)
        `)
        .eq('camp_id', campId)
        .order('created_at');

      if (familyAssignmentsError) throw familyAssignmentsError;
      setFamilyAssignments(familyAssignmentsData || []);

    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do acampamento: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (assignmentType === 'tent') {
      if (!formData.parish_id || !formData.tent_id || !formData.work_team_id) {
        toast.error('Paróquia, tenda e equipe são obrigatórios');
        return;
      }
    } else {
      if (!formData.family_id || !formData.work_team_id) {
        toast.error('Família e equipe são obrigatórios');
        return;
      }
    }

    try {
      if (assignmentType === 'tent') {
        const assignmentData = {
          tent_id: formData.tent_id,
          work_team_id: formData.work_team_id,
          coordinator_family_id: formData.coordinator_family_id === 'none' ? null : formData.coordinator_family_id,
          notes: formData.notes.trim() || null
        };

        if (editingAssignment) {
          const { error } = await supabase
            .from('camp_work_assignments')
            .update(assignmentData)
            .eq('id', editingAssignment.id);

          if (error) throw error;
          toast.success('Designação atualizada com sucesso!');
        } else {
          const { error } = await supabase
            .from('camp_work_assignments')
            .insert({
              camp_id: campId!,
              ...assignmentData
            });

          if (error) throw error;
          toast.success('Designação criada com sucesso!');
        }
      } else {
        const familyAssignmentData = {
          family_id: formData.family_id,
          work_team_id: formData.work_team_id,
          is_coordinator: formData.is_coordinator,
          notes: formData.notes.trim() || null
        };

        if (editingFamilyAssignment) {
          const { error } = await supabase
            .from('camp_family_assignments')
            .update(familyAssignmentData)
            .eq('id', editingFamilyAssignment.id);

          if (error) throw error;
          toast.success('Designação de família atualizada com sucesso!');
        } else {
          const { error } = await supabase
            .from('camp_family_assignments')
            .insert({
              camp_id: campId!,
              ...familyAssignmentData
            });

          if (error) throw error;
          toast.success('Designação de família criada com sucesso!');
        }
      }

      resetForm();
      fetchData();
    } catch (error: any) {
      console.error('Erro ao salvar designação:', error);
      toast.error('Erro ao salvar designação');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta designação?')) return;

    try {
      const { error } = await supabase
        .from('camp_work_assignments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Designação removida com sucesso!');
      fetchData();
    } catch (error) {
      console.error('Erro ao remover designação:', error);
      toast.error('Erro ao remover designação');
    }
  };

  const resetForm = () => {
    setFormData({
      parish_id: '',
      tent_id: '',
      work_team_id: '',
      coordinator_family_id: 'none',
      family_id: '',
      is_coordinator: false,
      notes: ''
    });
    setEditingAssignment(null);
    setEditingFamilyAssignment(null);
    setAssignmentType('tent');
    setIsDialogOpen(false);
  };

  const getTentName = (tentId: string) => {
    const tent = tents.find(t => t.id === tentId);
    if (!tent) return 'Tenda não encontrada';
    return `${tent.name} - ${tent.parishes?.name || 'Paróquia não encontrada'}`;
  };

  const getTentNameFromAssignment = (assignment: any) => {
    if (!assignment.tent) return 'Tenda não encontrada';
    return `${assignment.tent.name} - ${assignment.tent.parishes?.name || 'Paróquia não encontrada'}`;
  };

  const getTeamName = (teamId: string) => {
    return workTeams.find(t => t.id === teamId)?.name || 'Equipe não encontrada';
  };

  const getTeamColor = (teamId: string) => {
    return workTeams.find(t => t.id === teamId)?.color || '#3B82F6';
  };

  const getCoordinatorNames = (assignment: any) => {
    if (!assignment.coordinator_family) return 'Sem coordenador';
    const family = assignment.coordinator_family;
    
    // Pegar primeiro e último nome do esposo
    const esposoNames = family.esposo_nome.split(' ');
    const esposoFirstName = esposoNames[0];
    const esposoLastName = esposoNames[esposoNames.length - 1];
    
    // Pegar primeiro e último nome da esposa
    const esposaNames = family.esposa_nome.split(' ');
    const esposaFirstName = esposaNames[0];
    const esposaLastName = esposaNames[esposaNames.length - 1];
    
    return `${esposoFirstName} ${esposoLastName} e ${esposaFirstName} ${esposaLastName}`;
  };

  const getFamiliesForTent = (tentId: string) => {
    return tentFamilies.filter(family => family.tent_id === tentId);
  };

  const getTentsForParish = (parishId: string) => {
    return tents.filter(tent => tent.parish_id === parishId);
  };

  const getFamilyName = (familyId: string) => {
    const family = tentFamilies.find(f => f.id === familyId);
    if (!family) return 'Família não encontrada';
    return `${family.esposo_nome} e ${family.esposa_nome}`;
  };

  const getFamilyNameFromAssignment = (assignment: any) => {
    if (!assignment.family) return 'Família não encontrada';
    return `${assignment.family.esposo_nome} e ${assignment.family.esposa_nome}`;
  };

  const getTentNameFromFamilyAssignment = (assignment: any) => {
    if (!assignment.family) return 'Família não encontrada';
    const tent = tents.find(t => t.id === assignment.family.tent_id);
    if (!tent) return 'Tenda não encontrada';
    return `${tent.name} - ${tent.parishes?.name || 'Paróquia não encontrada'}`;
  };

  const handleParishChange = (parishId: string) => {
    setFormData({
      ...formData,
      parish_id: parishId,
      tent_id: '', // Reset tent selection when parish changes
      coordinator_family_id: 'none', // Reset coordinator selection when tent changes
      family_id: '' // Reset family selection when parish changes
    });
  };

  const handleTentChange = (tentId: string) => {
    setFormData({
      ...formData,
      tent_id: tentId,
      coordinator_family_id: 'none', // Reset coordinator selection when tent changes
      family_id: '' // Reset family selection when tent changes
    });
  };

  const handleEdit = (assignment: any) => {
    setEditingAssignment(assignment);
    setAssignmentType('tent');
    setFormData({
      parish_id: assignment.tent?.parish_id || '',
      tent_id: assignment.tent_id,
      work_team_id: assignment.work_team_id,
      coordinator_family_id: assignment.coordinator_family_id || 'none',
      family_id: '',
      is_coordinator: false,
      notes: assignment.notes || ''
    });
    setIsDialogOpen(true);
  };

  const handleEditFamily = (assignment: any) => {
    setEditingFamilyAssignment(assignment);
    setAssignmentType('family');
    
    // Encontrar a tenda da família para carregar paróquia e tenda
    const family = tentFamilies.find(f => f.id === assignment.family_id);
    const tent = family ? tents.find(t => t.id === family.tent_id) : null;
    
    setFormData({
      parish_id: tent?.parish_id || '',
      tent_id: family?.tent_id || '',
      work_team_id: assignment.work_team_id,
      coordinator_family_id: 'none',
      family_id: assignment.family_id,
      is_coordinator: assignment.is_coordinator || false,
      notes: assignment.notes || ''
    });
    setIsDialogOpen(true);
  };

  const handleDeleteFamily = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover esta designação?')) return;

    try {
      const { error } = await supabase
        .from('camp_family_assignments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Designação de família removida com sucesso!');
      fetchData();
    } catch (error) {
      console.error('Erro ao remover designação de família:', error);
      toast.error('Erro ao remover designação de família');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Carregando dados do acampamento...</div>
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
            <p className="text-gray-600 mt-2">ID do acampamento: {campId}</p>
            <div className="mt-4 space-x-4">
              <Button onClick={() => navigate('/admin/camps')} className="mt-4">
                Voltar para Acampamentos
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  console.log('Tentando recarregar dados...');
                  fetchData();
                }}
                className="mt-4"
              >
                Tentar Novamente
              </Button>
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
          <Button variant="outline" onClick={() => navigate(`/admin/camps/dashboard/${campId}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Equipes de Trabalho</h1>
            <p className="text-muted-foreground">{camp.name}</p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Resumo das designações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Resumo das Designações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {workTeams.map(team => {
                  const teamAssignments = assignments.filter(a => a.work_team_id === team.id);
                  const teamFamilyAssignments = familyAssignments.filter(a => a.work_team_id === team.id);
                  const totalAssignments = teamAssignments.length + teamFamilyAssignments.length;
                  
                  return (
                    <div key={team.id} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: team.color }}
                        />
                        <span className="font-medium">{team.name}</span>
                        {team.is_special_team && (
                          <Badge variant="secondary" className="text-xs">Especial</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {totalAssignments} {totalAssignments === 1 ? 'designação' : 'designações'}
                        {team.is_special_team ? ' de casal' : ' de tenda'}
                        {teamFamilyAssignments.length > 0 && (
                          <span className="ml-1">
                            ({teamFamilyAssignments.filter(a => a.is_coordinator).length} coordenador{teamFamilyAssignments.filter(a => a.is_coordinator).length !== 1 ? 'es' : ''})
                          </span>
                        )}
                      </p>
                      {totalAssignments > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {teamAssignments.map(assignment => (
                            <div key={assignment.id}>
                              • {getTentNameFromAssignment(assignment)}
                            </div>
                          ))}
                          {teamFamilyAssignments.map(assignment => (
                            <div key={assignment.id}>
                              • {getFamilyNameFromAssignment(assignment)} ({getTentNameFromFamilyAssignment(assignment)})
                              {assignment.is_coordinator && ' - Coordenador'}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Lista de designações */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Designações de Equipes</CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setIsDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Designação
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingAssignment ? 'Editar Designação' : 'Nova Designação'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingAssignment 
                          ? 'Edite a designação da equipe de trabalho.'
                          : 'Designe uma tenda para uma equipe de trabalho.'
                        }
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="assignment-type">Tipo de Designação</Label>
                          <Select
                            value={assignmentType}
                            onValueChange={(value: 'tent' | 'family') => {
                              setAssignmentType(value);
                              setFormData({
                                parish_id: '',
                                tent_id: '',
                                work_team_id: '',
                                coordinator_family_id: 'none',
                                family_id: '',
                                is_coordinator: false,
                                notes: ''
                              });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo de designação" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="tent">Designação por Tenda</SelectItem>
                              <SelectItem value="family">Designação por Casal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {assignmentType === 'tent' ? (
                          <>
                            <div className="grid gap-2">
                              <Label htmlFor="parish">Paróquia *</Label>
                              <Select
                                value={formData.parish_id}
                                onValueChange={(value) => handleParishChange(value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione uma paróquia" />
                                </SelectTrigger>
                                <SelectContent>
                                  {parishes.map((parish) => (
                                    <SelectItem key={parish.id} value={parish.id}>
                                      {parish.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="tent">Tenda *</Label>
                              <Select
                                value={formData.tent_id}
                                onValueChange={(value) => handleTentChange(value)}
                                disabled={!formData.parish_id}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={formData.parish_id ? "Selecione uma tenda" : "Selecione uma paróquia primeiro"} />
                                </SelectTrigger>
                                <SelectContent>
                                  {getTentsForParish(formData.parish_id).map((tent) => (
                                    <SelectItem key={tent.id} value={tent.id}>
                                      {tent.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="coordinator">Coordenadores</Label>
                              <Select
                                value={formData.coordinator_family_id}
                                onValueChange={(value) => setFormData({ ...formData, coordinator_family_id: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione os coordenadores (opcional)" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Sem coordenador</SelectItem>
                                  {formData.tent_id && getFamiliesForTent(formData.tent_id).map((family) => (
                                    <SelectItem key={family.id} value={family.id}>
                                      {family.esposo_nome} e {family.esposa_nome}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="grid gap-2">
                              <Label htmlFor="parish">Paróquia *</Label>
                              <Select
                                value={formData.parish_id}
                                onValueChange={(value) => handleParishChange(value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione uma paróquia" />
                                </SelectTrigger>
                                <SelectContent>
                                  {parishes.map((parish) => (
                                    <SelectItem key={parish.id} value={parish.id}>
                                      {parish.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="tent">Tenda *</Label>
                              <Select
                                value={formData.tent_id}
                                onValueChange={(value) => handleTentChange(value)}
                                disabled={!formData.parish_id}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={formData.parish_id ? "Selecione uma tenda" : "Selecione uma paróquia primeiro"} />
                                </SelectTrigger>
                                <SelectContent>
                                  {getTentsForParish(formData.parish_id).map((tent) => (
                                    <SelectItem key={tent.id} value={tent.id}>
                                      {tent.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="family">Casal *</Label>
                              <Select
                                value={formData.family_id}
                                onValueChange={(value) => setFormData({ ...formData, family_id: value })}
                                disabled={!formData.tent_id}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={formData.tent_id ? "Selecione um casal" : "Selecione uma tenda primeiro"} />
                                </SelectTrigger>
                                <SelectContent>
                                  {formData.tent_id && getFamiliesForTent(formData.tent_id).map((family) => (
                                    <SelectItem key={family.id} value={family.id}>
                                      {family.esposo_nome} e {family.esposa_nome}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="is_coordinator"
                                checked={formData.is_coordinator}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_coordinator: checked as boolean })}
                              />
                              <Label htmlFor="is_coordinator" className="text-sm">
                                Este casal é coordenador da equipe
                              </Label>
                            </div>
                          </>
                        )}

                        <div className="grid gap-2">
                          <Label htmlFor="team">Equipe *</Label>
                          <Select
                            value={formData.work_team_id}
                            onValueChange={(value) => setFormData({ ...formData, work_team_id: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma equipe" />
                            </SelectTrigger>
                            <SelectContent>
                              {workTeams
                                .filter(team => assignmentType === 'family' ? team.is_special_team : !team.is_special_team)
                                .map((team) => (
                                  <SelectItem key={team.id} value={team.id}>
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: team.color }}
                                      />
                                      {team.name}
                                    </div>
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="notes">Observações</Label>
                          <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Observações sobre a designação"
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={resetForm}>
                          Cancelar
                        </Button>
                        <Button type="submit">
                          {editingAssignment || editingFamilyAssignment ? 'Atualizar' : 'Criar'} Designação
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {assignments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma designação cadastrada ainda.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tenda</TableHead>
                      <TableHead>Equipe</TableHead>
                      <TableHead>Coordenadores</TableHead>
                      <TableHead>Observações</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">
                          {getTentNameFromAssignment(assignment)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: getTeamColor(assignment.work_team_id) }}
                            />
                            <Badge
                              variant="outline"
                              style={{ 
                                borderColor: getTeamColor(assignment.work_team_id), 
                                color: getTeamColor(assignment.work_team_id) 
                              }}
                            >
                              {getTeamName(assignment.work_team_id)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {getCoordinatorNames(assignment)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {assignment.notes || (
                            <span className="text-muted-foreground">Sem observações</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(assignment)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(assignment.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Lista de designações de família */}
          {familyAssignments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Designações de Casais</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Casal</TableHead>
                      <TableHead>Tenda</TableHead>
                      <TableHead>Equipe</TableHead>
                      <TableHead>Coordenador</TableHead>
                      <TableHead>Observações</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {familyAssignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">
                          {getFamilyNameFromAssignment(assignment)}
                        </TableCell>
                        <TableCell>
                          {getTentNameFromFamilyAssignment(assignment)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: getTeamColor(assignment.work_team_id) }}
                            />
                            <Badge
                              variant="outline"
                              style={{ 
                                borderColor: getTeamColor(assignment.work_team_id), 
                                color: getTeamColor(assignment.work_team_id) 
                              }}
                            >
                              {getTeamName(assignment.work_team_id)}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {assignment.is_coordinator ? 'Sim' : 'Não'}
                        </TableCell>
                        <TableCell>
                          {assignment.notes || (
                            <span className="text-muted-foreground">Sem observações</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditFamily(assignment)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteFamily(assignment.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}
