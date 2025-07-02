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
  Settings, 
  UserPlus, 
  Tent,
  ClipboardList,
  Award,
  ArrowLeft
} from "lucide-react";
import { CampWorkAssignment, CampFamilyAssignment } from "@/types";

type Camp = Tables<"camps"> & {
  stages: Tables<"stages">;
  camp_parishes: {
    parishes: Tables<"parishes">;
  }[];
};

export default function AdminCampDashboard() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [camp, setCamp] = useState<Camp | null>(null);
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    confirmedRegistrations: 0,
    totalTents: 0,
    totalWorkTeams: 0,
    totalFamilyAssignments: 0,
    totalWorkAssignments: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCampData();
    }
  }, [id]);

  const fetchCampData = async () => {
    try {
      console.log("Fetching camp data for ID:", id);

      // Fetch camp details
      const { data: campData, error: campError } = await supabase
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

      if (campError) {
        console.error("Error fetching camp:", campError);
        throw campError;
      }

      console.log("Camp data:", campData);
      setCamp(campData);

      // Fetch registrations
      const { data: registrations, error: regError } = await supabase
        .from("camp_registrations")
        .select("*")
        .eq("camp_id", id);

      if (regError) throw regError;

      // Fetch work assignments with proper joins
      const { data: workAssignments, error: workError } = await supabase
        .from("camp_work_assignments")
        .select(`
          *,
          work_teams (*),
          tents (*),
          tent_families:tents (
            tent_families (*,
              tent_children (*)
            )
          )
        `)
        .eq("camp_id", id);

      if (workError) {
        console.error("Error fetching work assignments:", workError);
      }

      // Fetch family assignments with proper joins
      const { data: familyAssignments, error: familyError } = await supabase
        .from("camp_family_assignments")
        .select(`
          *,
          work_teams (*),
          tent_families (*, 
            tent_children (*)
          )
        `)
        .eq("camp_id", id);

      if (familyError) {
        console.error("Error fetching family assignments:", familyError);
      }

      // Fetch camp tents
      const { data: campTents, error: tentsError } = await supabase
        .from("camp_tents")
        .select("*")
        .eq("camp_id", id);

      if (tentsError) throw tentsError;

      // Fetch work teams
      const { data: workTeams, error: teamsError } = await supabase
        .from("work_teams")
        .select("*");

      if (teamsError) throw teamsError;

      setStats({
        totalRegistrations: registrations?.length || 0,
        confirmedRegistrations: registrations?.filter(r => r.status === 'confirmed').length || 0,
        totalTents: campTents?.length || 0,
        totalWorkTeams: workTeams?.length || 0,
        totalFamilyAssignments: familyAssignments?.length || 0,
        totalWorkAssignments: workAssignments?.length || 0
      });

    } catch (error: any) {
      console.error("Failed to fetch camp data:", error);
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
            {camp.camp_parishes.map(cp => (
              <Badge key={cp.parishes.id} variant="outline">{cp.parishes.name}</Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><Users className="mr-2 w-5 h-5" /> Inscrições</CardTitle>
              <CardDescription>Informações sobre as inscrições no acampamento.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>Total de Inscrições: <span className="font-bold">{stats.totalRegistrations}</span></p>
                <p>Inscrições Confirmadas: <span className="font-bold">{stats.confirmedRegistrations}</span></p>
                <Button variant="secondary" size="sm" onClick={() => navigate(`/admin/camps/registrations/${id}`)}>
                  Gerenciar Inscrições
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><Tent className="mr-2 w-5 h-5" /> Tendas</CardTitle>
              <CardDescription>Detalhes sobre a organização das tendas.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>Total de Tendas: <span className="font-bold">{stats.totalTents}</span></p>
                <Button variant="secondary" size="sm" onClick={() => navigate(`/admin/camps/tents/${id}`)}>
                  Gerenciar Tendas
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><ClipboardList className="mr-2 w-5 h-5" /> Equipes de Trabalho</CardTitle>
              <CardDescription>Gerencie as equipes de trabalho e suas atribuições.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>Total de Equipes: <span className="font-bold">{stats.totalWorkTeams}</span></p>
                <p>Atribuições de Trabalho: <span className="font-bold">{stats.totalWorkAssignments}</span></p>
                <Button variant="secondary" size="sm" onClick={() => navigate(`/admin/camps/work-teams/${id}`)}>
                  Gerenciar Equipes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><Award className="mr-2 w-5 h-5" /> Atribuições de Família</CardTitle>
              <CardDescription>Veja as famílias atribuidas as equipes de trabalho.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>Total de Atribuições: <span className="font-bold">{stats.totalFamilyAssignments}</span></p>
                <Button variant="secondary" size="sm" onClick={() => navigate(`/admin/camps/family-assignments/${id}`)}>
                  Gerenciar Atribuições
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><Calendar className="mr-2 w-5 h-5" /> Datas</CardTitle>
              <CardDescription>Datas importantes do acampamento.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>Início: <span className="font-bold">{formatDate(camp.start_date)}</span></p>
                <p>Término: <span className="font-bold">{formatDate(camp.end_date)}</span></p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><MapPin className="mr-2 w-5 h-5" /> Localização</CardTitle>
              <CardDescription>Informações sobre a localização do acampamento.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>Paróquias:
                  {camp.camp_parishes.map(cp => (
                    <div key={cp.parishes.id} className="ml-2">
                      <span className="font-bold">{cp.parishes.name}</span>
                    </div>
                  ))}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
