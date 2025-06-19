import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { WorkTeam, Tent, CampWorkAssignment, Camp } from '../types';
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
import { ArrowLeft, Plus, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';
import Layout from '@/components/Layout';

export default function AdminCampWorkTeams() {
  const { campId } = useParams<{ campId: string }>();
  const navigate = useNavigate();
  const [camp, setCamp] = useState<Camp | null>(null);
  const [workTeams, setWorkTeams] = useState<WorkTeam[]>([]);
  const [tents, setTents] = useState<Tent[]>([]);
  const [assignments, setAssignments] = useState<CampWorkAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<CampWorkAssignment | null>(null);
  const [formData, setFormData] = useState({
    tent_id: '',
    work_team_id: '',
    role: 'member' as 'leader' | 'member' | 'assistant',
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
      
      // Buscar dados do acampamento
      const { data: campData, error: campError } = await supabase
        .from('camps')
        .select(`
          *,
          stage:stages(*),
          parish:parishes(*)
        `)
        .eq('id', campId)
        .single();

      if (campError) throw campError;
      setCamp(campData);

      // Buscar equipes de trabalho
      const { data: teamsData, error: teamsError } = await supabase
        .from('work_teams')
        .select('*')
        .order('name');

      if (teamsError) throw teamsError;
      setWorkTeams(teamsData || []);

      // Buscar tendas
      const { data: tentsData, error: tentsError } = await supabase
        .from('tents')
        .select(`
          *,
          parish:parishes(*)
        `)
        .order('name');

      if (tentsError) throw tentsError;
      setTents(tentsData || []);

      // Buscar designações existentes
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('camp_work_assignments')
        .select(`
          *,
          work_team:work_teams(*),
          tent:tents(*)
        `)
        .eq('camp_id', campId)
        .order('created_at');

      if (assignmentsError) throw assignmentsError;
      setAssignments(assignmentsData || []);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do acampamento');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.tent_id || !formData.work_team_id) {
      toast.error('Tenda e equipe são obrigatórios');
      return;
    }

    try {
      if (editingAssignment) {
        const { error } = await supabase
          .from('camp_work_assignments')
          .update({
            tent_id: formData.tent_id,
            work_team_id: formData.work_team_id,
            role: formData.role,
            notes: formData.notes.trim() || null
          })
          .eq('id', editingAssignment.id);

        if (error) throw error;
        toast.success('Designação atualizada com sucesso!');
      } else {
        const { error } = await supabase
          .from('camp_work_assignments')
          .insert({
            camp_id: campId!,
            tent_id: formData.tent_id,
            work_team_id: formData.work_team_id,
            role: formData.role,
            notes: formData.notes.trim() || null
          });

        if (error) throw error;
        toast.success('Designação criada com sucesso!');
      }

      resetForm();
      fetchData();
    } catch (error) {
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
      tent_id: '',
      work_team_id: '',
      role: 'member',
      notes: ''
    });
    setEditingAssignment(null);
    setIsDialogOpen(false);
  };

  const getTentName = (tentId: string) => {
    return tents.find(t => t.id === tentId)?.name || 'Tenda não encontrada';
  };

  const getTeamName = (teamId: string) => {
    return workTeams.find(t => t.id === teamId)?.name || 'Equipe não encontrada';
  };

  const getTeamColor = (teamId: string) => {
    return workTeams.find(t => t.id === teamId)?.color || '#3B82F6';
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      leader: 'Líder',
      member: 'Membro',
      assistant: 'Auxiliar'
    };
    return labels[role as keyof typeof labels] || role;
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Carregando...</div>
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
            <Button onClick={() => navigate('/admin/camps')} className="mt-4">
              Voltar para Acampamentos
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
          <Button variant="outline" onClick={() => navigate('/admin/camps')}>
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
                  return (
                    <div key={team.id} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: team.color }}
                        />
                        <span className="font-medium">{team.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {teamAssignments.length} tenda{teamAssignments.length !== 1 ? 's' : ''} designada{teamAssignments.length !== 1 ? 's' : ''}
                      </p>
                      {teamAssignments.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {teamAssignments.map(assignment => (
                            <div key={assignment.id}>
                              • {getTentName(assignment.tent_id)} ({getRoleLabel(assignment.role || 'member')})
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
                          <Label htmlFor="tent">Tenda *</Label>
                          <Select
                            value={formData.tent_id}
                            onValueChange={(value) => setFormData({ ...formData, tent_id: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma tenda" />
                            </SelectTrigger>
                            <SelectContent>
                              {tents.map((tent) => (
                                <SelectItem key={tent.id} value={tent.id}>
                                  {tent.name} - {tent.parish?.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
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
                              {workTeams.map((team) => (
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
                          <Label htmlFor="role">Função</Label>
                          <Select
                            value={formData.role}
                            onValueChange={(value: 'leader' | 'member' | 'assistant') => 
                              setFormData({ ...formData, role: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="member">Membro</SelectItem>
                              <SelectItem value="leader">Líder</SelectItem>
                              <SelectItem value="assistant">Auxiliar</SelectItem>
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
                          {editingAssignment ? 'Atualizar' : 'Criar'} Designação
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
                      <TableHead>Função</TableHead>
                      <TableHead>Observações</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {assignments.map((assignment) => (
                      <TableRow key={assignment.id}>
                        <TableCell className="font-medium">
                          {getTentName(assignment.tent_id)}
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
                          <Badge variant="secondary">
                            {getRoleLabel(assignment.role || 'member')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {assignment.notes || (
                            <span className="text-muted-foreground">Sem observações</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(assignment.id)}
                          >
                            <Trash2 className="w-4 h-4" />
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
      </div>
    </Layout>
  );
} 