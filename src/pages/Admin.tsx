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
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Tables } from "@/integrations/supabase/types";
import { Plus, Search, Calendar, Users, MapPin, Filter } from "lucide-react";

type Camp = Tables<"camps"> & {
  stages: Tables<"stages">;
  parishes: Tables<"parishes">;
  _count?: {
    registrations: number;
  };
};

type Stage = Tables<"stages">;
type Parish = Tables<"parishes">;

export default function Admin() {
  const navigate = useNavigate();
  const [camps, setCamps] = useState<Camp[]>([]);
  const [stages, setStages] = useState<Stage[]>([]);
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStage, setSelectedStage] = useState<string>("all");
  const [selectedParish, setSelectedParish] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Buscar acampamentos com contagem de inscrições
      const { data: campsData, error: campsError } = await supabase
        .from("camps")
        .select(`
          *,
          stages (*),
          parishes (*)
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

      setCamps(campsWithCounts);
      setStages(stagesData || []);
      setParishes(parishesData || []);
    } catch (error: any) {
      toast.error("Erro ao carregar dados: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredCamps = camps.filter((camp) => {
    const matchesSearch = camp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camp.parishes.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      camp.stages.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStage = selectedStage === "all" || camp.stage_id === selectedStage;
    const matchesParish = selectedParish === "all" || camp.parish_id === selectedParish;
    const matchesYear = selectedYear === "all" || new Date(camp.start_date).getFullYear().toString() === selectedYear;

    return matchesSearch && matchesStage && matchesParish && matchesYear;
  });

  const years = Array.from(
    new Set(camps.map((camp) => new Date(camp.start_date).getFullYear()))
  ).sort((a, b) => b - a);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRegistrationStatus = (camp: Camp) => {
    const confirmedCount = camp._count?.registrations || 0;
    const maxFamilies = camp.max_families || 0;
    const percentage = (confirmedCount / maxFamilies) * 100;

    if (percentage >= 100) return "bg-red-100 text-red-800";
    if (percentage >= 80) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Button onClick={() => navigate("/admin/camps/new")}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Acampamento
          </Button>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar acampamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
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
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Acampamentos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{camps.length}</div>
              <p className="text-xs text-muted-foreground">
                {camps.filter(c => c.status === "open").length} ativos
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Inscrições</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {camps.reduce((acc, camp) => acc + (camp._count?.registrations || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Em {camps.length} acampamentos
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paróquias Ativas</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{parishes.length}</div>
              <p className="text-xs text-muted-foreground">
                Com acampamentos programados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Acampamentos */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Etapa</TableHead>
                <TableHead>Paróquia</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Inscrições</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : filteredCamps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Nenhum acampamento encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredCamps.map((camp) => (
                  <TableRow key={camp.id}>
                    <TableCell className="font-medium">{camp.name}</TableCell>
                    <TableCell>{camp.stages.name}</TableCell>
                    <TableCell>{camp.parishes.name}</TableCell>
                    <TableCell>
                      {new Date(camp.start_date).toLocaleDateString()} -{" "}
                      {new Date(camp.end_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getRegistrationStatus(camp)}`}>
                        {camp._count?.registrations || 0} / {camp.max_families}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(camp.status)}`}>
                        {camp.status === "open" ? "Ativo" : camp.status === "completed" ? "Concluído" : "Inativo"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/camps/registrations/${camp.id}`)}
                      >
                        Inscrições
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/camps/edit/${camp.id}`)}
                      >
                        Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
}
