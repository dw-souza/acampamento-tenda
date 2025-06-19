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
import { Plus, Trash2, Search } from "lucide-react";
import { formatDateForInput } from "@/lib/utils";

type Tent = Tables<"tents"> & {
  parishes: Tables<"parishes">;
};

type Family = Tables<"families"> & {
  family_children: Tables<"family_children">[];
};

type TentChild = {
  full_name: string;
  birth_date: string;
  vai_encontros: boolean;
  dietary_restrictions?: string;
  special_needs?: string;
};

export default function AdminTentFamilyAdd() {
  const navigate = useNavigate();
  const { tentId } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tent, setTent] = useState<Tent | null>(null);
  const [availableFamilies, setAvailableFamilies] = useState<Family[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFamily, setSelectedFamily] = useState<Family | null>(null);
  const [importMode, setImportMode] = useState<"import" | "new">("import");
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
  });
  const [children, setChildren] = useState<TentChild[]>([]);

  useEffect(() => {
    if (tentId) {
      fetchTent();
      fetchAvailableFamilies();
    }
  }, [tentId]);

  const fetchTent = async () => {
    try {
      const { data, error } = await supabase
        .from("tents")
        .select(`
          *,
          parishes (*)
        `)
        .eq("id", tentId)
        .single();

      if (error) throw error;
      setTent(data);
    } catch (error: any) {
      toast.error("Erro ao carregar tenda: " + error.message);
      navigate(`/admin/tents/${tentId}/participants`);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableFamilies = async () => {
    try {
      // Primeiro, buscar os IDs dos acampamentos Kerigma
      const { data: kerigmaCamps, error: campsError } = await supabase
        .from("camps")
        .select(`
          id,
          stages!inner(name)
        `)
        .eq("stages.name", "KERIGMA");

      if (campsError) throw campsError;

      if (!kerigmaCamps || kerigmaCamps.length === 0) {
        setAvailableFamilies([]);
        return;
      }

      const campIds = kerigmaCamps.map(camp => camp.id);

      // Buscar famílias com inscrições confirmadas nos acampamentos Kerigma
      const { data, error } = await supabase
        .from("camp_registrations")
        .select(`
          family_id,
          families (
            *,
            family_children (*)
          )
        `)
        .eq("status", "confirmed")
        .in("camp_id", campIds);

      if (error) throw error;
      
      // Extrair apenas as famílias únicas
      const uniqueFamilies = data?.reduce((acc: Family[], registration: any) => {
        const family = registration.families as Family;
        if (family && !acc.find(f => f.id === family.id)) {
          acc.push(family);
        }
        return acc;
      }, []) || [];
      
      setAvailableFamilies(uniqueFamilies);
    } catch (error: any) {
      toast.error("Erro ao carregar famílias disponíveis: " + error.message);
    }
  };

  const handleImportFamily = (family: Family) => {
    setSelectedFamily(family);
    setFormData({
      esposo_nome: family.esposo_nome,
      esposa_nome: family.esposa_nome,
      esposo_phone: family.esposo_phone || "",
      esposo_email: family.esposo_email || "",
      esposo_profissao: family.esposo_profissao || "",
      esposa_phone: family.esposa_phone || "",
      esposa_email: family.esposa_email || "",
      esposa_profissao: family.esposa_profissao || "",
      address: family.address || "",
      bairro: family.bairro || "",
      city: family.city || "",
      state: family.state || "",
      zip_code: family.zip_code || "",
      data_casamento: formatDateForInput(family.data_casamento),
      contato_principal: family.contato_principal,
    });

    setChildren(
      family.family_children.map(child => ({
        full_name: child.full_name,
        birth_date: formatDateForInput(child.birth_date),
        vai_encontros: true,
        dietary_restrictions: child.dietary_restrictions || "",
        special_needs: child.special_needs || "",
      }))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let familyId = selectedFamily?.id;

      // Se for uma nova família, criar primeiro na tabela families
      if (importMode === "new" || !selectedFamily) {
        const newFamilyData = {
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
        };

        const { data: newFamily, error: newFamilyError } = await supabase
          .from("families")
          .insert(newFamilyData)
          .select()
          .single();

        if (newFamilyError) throw newFamilyError;
        familyId = newFamily.id;

        // Adicionar filhos à família
        if (children.length > 0) {
          const familyChildrenData = children.map(child => ({
            family_id: familyId,
            full_name: child.full_name.toUpperCase(),
            birth_date: child.birth_date,
            vai_acampamento: child.vai_encontros,
            dietary_restrictions: child.dietary_restrictions,
            special_needs: child.special_needs,
          }));

          const { error: familyChildrenError } = await supabase
            .from("family_children")
            .insert(familyChildrenData);

          if (familyChildrenError) throw familyChildrenError;
        }
      }

      // Criar família na tenda
      const tentFamilyData = {
        tent_id: tentId,
        family_id: familyId,
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
        status: "active",
      };

      const { data: tentFamily, error: tentFamilyError } = await supabase
        .from("tent_families")
        .insert(tentFamilyData)
        .select()
        .single();

      if (tentFamilyError) throw tentFamilyError;

      // Adicionar filhos à tenda (sempre criar na tent_children para exibição)
      if (children.length > 0) {
        const tentChildrenData = children.map(child => ({
          tent_family_id: tentFamily.id,
          full_name: child.full_name.toUpperCase(),
          birth_date: child.birth_date,
          vai_encontros: child.vai_encontros,
          dietary_restrictions: child.dietary_restrictions,
          special_needs: child.special_needs,
        }));

        const { error: childrenError } = await supabase
          .from("tent_children")
          .insert(tentChildrenData);

        if (childrenError) throw childrenError;
      }

      toast.success("Família adicionada à tenda com sucesso!");
      navigate(`/admin/tents/${tentId}/participants`);
    } catch (error: any) {
      toast.error("Erro ao adicionar família: " + error.message);
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

  const removeChild = (index: number) => {
    setChildren(children.filter((_, i) => i !== index));
  };

  const updateChild = (index: number, field: keyof TentChild, value: any) => {
    const newChildren = [...children];
    newChildren[index] = {
      ...newChildren[index],
      [field]: value,
    };
    setChildren(newChildren);
  };

  const filteredFamilies = availableFamilies.filter((family) =>
    `${family.esposo_nome} ${family.esposa_nome}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              Adicionar Família - {tent?.name}
            </h1>
            <p className="text-gray-600">
              {tent?.parishes.name} - Guardiões: {tent?.guardian_husband_name} e {tent?.guardian_wife_name}
            </p>
          </div>

          {/* Seleção do modo */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Como deseja adicionar a família?</h2>
            <div className="flex gap-4">
              <Button
                variant={importMode === "import" ? "default" : "outline"}
                onClick={() => setImportMode("import")}
              >
                Importar Família Existente
              </Button>
              <Button
                variant={importMode === "new" ? "default" : "outline"}
                onClick={() => setImportMode("new")}
              >
                Cadastrar Nova Família
              </Button>
            </div>
          </div>

          {importMode === "import" && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Importar Família do Acampamento Kerigma</h2>
              
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar família..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {filteredFamilies.map((family) => (
                  <div
                    key={family.id}
                    className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      selectedFamily?.id === family.id ? "border-blue-500 bg-blue-50" : ""
                    }`}
                    onClick={() => handleImportFamily(family)}
                  >
                    <div className="font-medium">
                      {family.esposo_nome} e {family.esposa_nome}
                    </div>
                    <div className="text-sm text-gray-600">
                      {family.family_children?.length || 0} {family.family_children?.length === 1 ? 'filho' : 'filhos'}
                    </div>
                  </div>
                ))}
              </div>

              {filteredFamilies.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Nenhuma família encontrada. Tente uma busca diferente ou cadastre uma nova família.
                </p>
              )}
            </div>
          )}

          {importMode === "new" && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Cadastrar Nova Família</h2>
              <p className="text-gray-600">
                Preencha os dados da família que será adicionada à tenda.
              </p>
            </div>
          )}

          {((importMode === "import" && selectedFamily) || importMode === "new") && (
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
                  {saving ? "Adicionando..." : importMode === "import" ? "Importar Família à Tenda" : "Cadastrar Família na Tenda"}
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
          )}
        </div>
      </div>
    </Layout>
  );
} 