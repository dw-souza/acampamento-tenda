import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Tables } from "@/integrations/supabase/types";
import { Plus, Trash2 } from "lucide-react";
import { formatDateForInput } from "@/lib/utils";

type TentFamily = Tables<"tent_families"> & {
  tents: Tables<"tents">;
  tent_children: Tables<"tent_children">[];
};

type TentChild = {
  id?: string;
  full_name: string;
  birth_date: string;
  vai_encontros: boolean;
  dietary_restrictions?: string;
  special_needs?: string;
};

export default function AdminTentFamilyForm() {
  const navigate = useNavigate();
  const { tentId, familyId } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tentFamily, setTentFamily] = useState<TentFamily | null>(null);
  const [formData, setFormData] = useState({
    esposo_nome: "",
    esposa_nome: "",
    esposo_phone: "",
    esposo_email: "",
    esposo_profissao: "",
    esposa_phone: "",
    esposa_email: "",
    esposa_profissao: "",
    address: "",
    bairro: "",
    city: "",
    state: "",
    zip_code: "",
    data_casamento: "",
    contato_principal: "esposo" as "esposo" | "esposa",
    status: "active" as "active" | "inactive" | "left",
  });
  const [children, setChildren] = useState<TentChild[]>([]);

  useEffect(() => {
    if (tentId && familyId) {
      fetchTentFamily();
    }
  }, [tentId, familyId]);

  const fetchTentFamily = async () => {
    try {
      const { data, error } = await supabase
        .from("tent_families")
        .select(`
          *,
          tents (*),
          tent_children (*)
        `)
        .eq("tent_id", tentId)
        .eq("id", familyId)
        .single();

      if (error) throw error;

      setTentFamily(data);
      setFormData({
        esposo_nome: data.esposo_nome,
        esposa_nome: data.esposa_nome,
        esposo_phone: data.esposo_phone || "",
        esposo_email: data.esposo_email || "",
        esposo_profissao: data.esposo_profissao || "",
        esposa_phone: data.esposa_phone || "",
        esposa_email: data.esposa_email || "",
        esposa_profissao: data.esposa_profissao || "",
        address: data.address || "",
        bairro: data.bairro || "",
        city: data.city || "",
        state: data.state || "",
        zip_code: data.zip_code || "",
        data_casamento: formatDateForInput(data.data_casamento),
        contato_principal: data.contato_principal,
        status: data.status,
      });

      setChildren(
        data.tent_children.map(child => ({
          id: child.id,
          full_name: child.full_name,
          birth_date: formatDateForInput(child.birth_date),
          vai_encontros: child.vai_encontros,
          dietary_restrictions: child.dietary_restrictions || "",
          special_needs: child.special_needs || "",
        }))
      );
    } catch (error: any) {
      toast.error("Erro ao carregar dados da família: " + error.message);
      navigate(`/admin/tents/${tentId}/participants`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Atualizar dados da família na tenda
      const tentFamilyData = {
        esposo_nome: formData.esposo_nome.toUpperCase(),
        esposa_nome: formData.esposa_nome.toUpperCase(),
        esposo_phone: formData.esposo_phone,
        esposo_email: formData.esposo_email,
        esposo_profissao: formData.esposo_profissao.toUpperCase(),
        esposa_phone: formData.esposa_phone,
        esposa_email: formData.esposa_email,
        esposa_profissao: formData.esposa_profissao.toUpperCase(),
        address: formData.address.toUpperCase(),
        bairro: formData.bairro.toUpperCase(),
        city: formData.city.toUpperCase(),
        state: formData.state.toUpperCase(),
        zip_code: formData.zip_code.toUpperCase(),
        data_casamento: formData.data_casamento,
        contato_principal: formData.contato_principal,
        status: formData.status,
      };

      const { error: familyError } = await supabase
        .from("tent_families")
        .update(tentFamilyData)
        .eq("id", familyId);

      if (familyError) throw familyError;

      // Atualizar filhos
      for (const child of children) {
        if (child.id) {
          // Atualizar filho existente
          const { error: childError } = await supabase
            .from("tent_children")
            .update({
              full_name: child.full_name.toUpperCase(),
              birth_date: child.birth_date,
              vai_encontros: child.vai_encontros,
              dietary_restrictions: child.dietary_restrictions,
              special_needs: child.special_needs,
            })
            .eq("id", child.id);

          if (childError) throw childError;
        } else {
          // Criar novo filho
          const { error: childError } = await supabase
            .from("tent_children")
            .insert({
              tent_family_id: familyId,
              full_name: child.full_name.toUpperCase(),
              birth_date: child.birth_date,
              vai_encontros: child.vai_encontros,
              dietary_restrictions: child.dietary_restrictions,
              special_needs: child.special_needs,
            });

          if (childError) throw childError;
        }
      }

      toast.success("Dados da família atualizados com sucesso!");
      navigate(`/admin/tents/${tentId}/participants`);
    } catch (error: any) {
      toast.error("Erro ao salvar dados: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const addChild = () => {
    setChildren([
      ...children,
      {
        full_name: "",
        birth_date: "",
        vai_encontros: true,
        dietary_restrictions: "",
        special_needs: "",
      },
    ]);
  };

  const removeChild = async (index: number) => {
    const childToRemove = children[index];
    if (childToRemove.id) {
      // Remover filho do banco
      try {
        const { error } = await supabase
          .from("tent_children")
          .delete()
          .eq("id", childToRemove.id);
        
        if (error) throw error;
        setChildren(children.filter((_, i) => i !== index));
      } catch (error: any) {
        toast.error("Erro ao remover filho: " + error.message);
      }
    } else {
      // Apenas remover do estado local
      setChildren(children.filter((_, i) => i !== index));
    }
  };

  const updateChild = (index: number, field: keyof TentChild, value: any) => {
    const newChildren = [...children];
    newChildren[index] = {
      ...newChildren[index],
      [field]: value,
    };
    setChildren(newChildren);
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">
              Editar Família - {tentFamily?.tents.name}
            </h1>
            <p className="text-gray-600">
              {tentFamily?.esposo_nome} e {tentFamily?.esposa_nome}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dados do Casal */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Dados do Casal</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dados do Esposo */}
                <div className="space-y-4">
                  <h3 className="font-medium">Esposo</h3>
                  <div>
                    <Label>Nome</Label>
                    <Input
                      value={formData.esposo_nome}
                      onChange={(e) => setFormData({ ...formData, esposo_nome: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Telefone</Label>
                    <Input
                      value={formData.esposo_phone}
                      onChange={(e) => setFormData({ ...formData, esposo_phone: e.target.value })}
                      type="tel"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={formData.esposo_email}
                      onChange={(e) => setFormData({ ...formData, esposo_email: e.target.value })}
                      type="email"
                    />
                  </div>
                  <div>
                    <Label>Profissão</Label>
                    <Input
                      value={formData.esposo_profissao}
                      onChange={(e) => setFormData({ ...formData, esposo_profissao: e.target.value })}
                    />
                  </div>
                </div>

                {/* Dados da Esposa */}
                <div className="space-y-4">
                  <h3 className="font-medium">Esposa</h3>
                  <div>
                    <Label>Nome</Label>
                    <Input
                      value={formData.esposa_nome}
                      onChange={(e) => setFormData({ ...formData, esposa_nome: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Telefone</Label>
                    <Input
                      value={formData.esposa_phone}
                      onChange={(e) => setFormData({ ...formData, esposa_phone: e.target.value })}
                      type="tel"
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={formData.esposa_email}
                      onChange={(e) => setFormData({ ...formData, esposa_email: e.target.value })}
                      type="email"
                    />
                  </div>
                  <div>
                    <Label>Profissão</Label>
                    <Input
                      value={formData.esposa_profissao}
                      onChange={(e) => setFormData({ ...formData, esposa_profissao: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Contato Principal */}
              <div className="mt-6">
                <Label>Contato Principal</Label>
                <Select
                  value={formData.contato_principal}
                  onValueChange={(value: "esposo" | "esposa") => setFormData({ ...formData, contato_principal: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="esposo">Esposo</SelectItem>
                    <SelectItem value="esposa">Esposa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Data de Casamento */}
              <div className="mt-6">
                <Label>Data de Casamento</Label>
                <Input
                  type="date"
                  value={formData.data_casamento}
                  onChange={(e) => setFormData({ ...formData, data_casamento: e.target.value })}
                />
              </div>

              {/* Endereço */}
              <div className="mt-6">
                <h3 className="font-medium mb-4">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Endereço</Label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Bairro</Label>
                    <Input
                      value={formData.bairro}
                      onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Cidade</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Estado</Label>
                    <Input
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>CEP</Label>
                    <Input
                      value={formData.zip_code}
                      onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="mt-6">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: "active" | "inactive" | "left") => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="left">Saiu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Filhos */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Filhos</h2>
                <Button type="button" onClick={addChild}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Filho
                </Button>
              </div>

              {children.map((child, index) => (
                <div key={index} className="border rounded-lg p-4 mb-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Filho {index + 1}</h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeChild(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nome</Label>
                      <Input
                        value={child.full_name}
                        onChange={(e) => updateChild(index, "full_name", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label>Data de Nascimento</Label>
                      <Input
                        type="date"
                        value={child.birth_date}
                        onChange={(e) => updateChild(index, "birth_date", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Restrições Alimentares</Label>
                      <Input
                        value={child.dietary_restrictions}
                        onChange={(e) => updateChild(index, "dietary_restrictions", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Necessidades Especiais</Label>
                      <Input
                        value={child.special_needs}
                        onChange={(e) => updateChild(index, "special_needs", e.target.value)}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={child.vai_encontros}
                        onCheckedChange={(checked) => updateChild(index, "vai_encontros", checked === true)}
                      />
                      <Label>Vai aos Encontros</Label>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1" disabled={saving}>
                {saving ? "Salvando..." : "Salvar Alterações"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate(`/admin/tents/${tentId}/participants`)}
              >
                Voltar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
} 