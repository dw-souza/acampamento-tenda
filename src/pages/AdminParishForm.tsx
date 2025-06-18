import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { ArrowLeft } from "lucide-react";

type State = {
  id: number;
  sigla: string;
  nome: string;
};

type City = {
  id: number;
  nome: string;
};

type Parish = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  phone: string;
  email: string;
  responsible_name: string;
  responsible_phone: string;
  status: "active" | "inactive";
};

export default function AdminParishForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedState, setSelectedState] = useState<string>("");
  const [formData, setFormData] = useState<Partial<Parish>>({
    name: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    phone: "",
    email: "",
    responsible_name: "",
    responsible_phone: "",
    status: "active",
  });

  useEffect(() => {
    fetchStates();
    if (id) {
      fetchParish();
    }
  }, [id]);

  useEffect(() => {
    if (selectedState) {
      fetchCities(selectedState);
    }
  }, [selectedState]);

  const fetchStates = async () => {
    try {
      const response = await fetch(
        "https://servicodados.ibge.gov.br/api/v1/localidades/estados"
      );
      const data = await response.json();
      setStates(data);
    } catch (error) {
      toast.error("Erro ao carregar estados");
    }
  };

  const fetchCities = async (stateId: string) => {
    try {
      const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${stateId}/municipios`
      );
      const data = await response.json();
      setCities(data);
    } catch (error) {
      toast.error("Erro ao carregar cidades");
    }
  };

  const fetchParish = async () => {
    try {
      const { data, error } = await supabase
        .from("parishes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData(data);
        setSelectedState(data.state);
      }
    } catch (error: any) {
      toast.error("Erro ao carregar paróquia: " + error.message);
      navigate("/admin/parishes");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const parishData = {
        name: formData.name.toUpperCase(),
        city: formData.city,
        state: formData.state,
        address: formData.address,
        zip_code: formData.zip_code,
        phone: formData.phone,
        email: formData.email,
        responsible_name: formData.responsible_name,
        responsible_phone: formData.responsible_phone,
        status: formData.status || "active"
      };

      if (id) {
        const { error } = await supabase
          .from("parishes")
          .update(parishData)
          .eq("id", id);

        if (error) throw error;
        toast.success("Paróquia atualizada com sucesso!");
      } else {
        const { error } = await supabase.from("parishes").insert(parishData);

        if (error) throw error;
        toast.success("Paróquia cadastrada com sucesso!");
      }

      navigate("/admin/parishes");
    } catch (error: any) {
      toast.error("Erro ao salvar paróquia: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setFormData((prev) => ({ ...prev, state: value, city: "" }));
  };

  const handleCityChange = (value: string) => {
    setFormData((prev) => ({ ...prev, city: value }));
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            {id ? "Editar Paróquia" : "Nova Paróquia"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome da Paróquia</label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Endereço</label>
              <Input
                name="address"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select
                value={selectedState}
                onValueChange={handleStateChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um estado" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state.id} value={state.sigla}>
                      {state.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cidade</label>
              <Select
                value={formData.city}
                onValueChange={handleCityChange}
                disabled={!selectedState}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma cidade" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.nome}>
                      {city.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">CEP</label>
              <Input
                name="zip_code"
                value={formData.zip_code}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Telefone</label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nome do Responsável</label>
              <Input
                name="responsible_name"
                value={formData.responsible_name}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Telefone do Responsável</label>
              <Input
                name="responsible_phone"
                value={formData.responsible_phone}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={formData.status}
                onValueChange={(value: "active" | "inactive") =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativa</SelectItem>
                  <SelectItem value="inactive">Inativa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/parishes")}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
} 