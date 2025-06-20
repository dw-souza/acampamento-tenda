import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Tables } from "@/integrations/supabase/types";
import { Plus, Pencil, Trash2, Edit } from "lucide-react";
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

type WorkTeam = Tables<"work_teams">;

export default function AdminWorkTeams() {
  const [workTeams, setWorkTeams] = useState<WorkTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<WorkTeam | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });

  useEffect(() => {
    fetchWorkTeams();
  }, []);

  const fetchWorkTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('work_teams')
        .select('*')
        .order('name');

      if (error) throw error;
      setWorkTeams(data || []);
    } catch (error) {
      console.error('Erro ao buscar equipes:', error);
      toast.error('Erro ao carregar equipes de trabalho');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Nome da equipe é obrigatório');
      return;
    }

    try {
      if (editingTeam) {
        const { error } = await supabase
          .from('work_teams')
          .update({
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            color: formData.color
          })
          .eq('id', editingTeam.id);

        if (error) throw error;
        toast.success('Equipe atualizada com sucesso!');
      } else {
        const { error } = await supabase
          .from('work_teams')
          .insert({
            name: formData.name.trim(),
            description: formData.description.trim() || null,
            color: formData.color
          });

        if (error) throw error;
        toast.success('Equipe criada com sucesso!');
      }

      resetForm();
      fetchWorkTeams();
    } catch (error) {
      console.error('Erro ao salvar equipe:', error);
      toast.error('Erro ao salvar equipe');
    }
  };

  const handleEdit = (team: WorkTeam) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      description: team.description || '',
      color: team.color
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta equipe?')) return;

    try {
      const { error } = await supabase
        .from('work_teams')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Equipe excluída com sucesso!');
      fetchWorkTeams();
    } catch (error) {
      console.error('Erro ao excluir equipe:', error);
      toast.error('Erro ao excluir equipe');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3B82F6'
    });
    setEditingTeam(null);
    setIsDialogOpen(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Carregando equipes...</div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Equipes de Trabalho</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Equipe
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingTeam ? 'Editar Equipe' : 'Nova Equipe'}
                </DialogTitle>
                <DialogDescription>
                  {editingTeam 
                    ? 'Edite as informações da equipe de trabalho.'
                    : 'Crie uma nova equipe de trabalho para o acampamento.'
                  }
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome da Equipe *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Cozinha, Secretaria, Capela"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descrição das responsabilidades da equipe"
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="color">Cor da Equipe</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="color"
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        placeholder="#3B82F6"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingTeam ? 'Atualizar' : 'Criar'} Equipe
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Equipes Cadastradas</CardTitle>
          </CardHeader>
          <CardContent>
            {workTeams.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma equipe cadastrada ainda.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipe</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Cor</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workTeams.map((team) => (
                    <TableRow key={team.id}>
                      <TableCell className="font-medium">{team.name}</TableCell>
                      <TableCell>
                        {team.description || (
                          <span className="text-muted-foreground">Sem descrição</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: team.color }}
                          />
                          <Badge
                            variant="outline"
                            style={{ borderColor: team.color, color: team.color }}
                          >
                            {team.color}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(team)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(team.id)}
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
      </div>
    </Layout>
  );
} 