import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Tables } from "@/integrations/supabase/types";
import { Plus, Trash2 } from "lucide-react";

type Family = Tables<"families">;
type Participant = Tables<"participants">;

export default function AdminFamilyForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Family>>({
    esposo_nome: "",
    esposo_phone: "",
    esposo_email: "",
    esposo_profissao: "",
    esposa_nome: "",
    esposa_phone: "",
    esposa_email: "",
    esposa_profissao: "",
    contato_principal: "esposo",
    address: "",
    bairro: "",
    city: "",
    state: "",
    zip_code: "",
    data_casamento: "",
    needs_pajem: false,
    notes: "",
  });
  const [children, setChildren] = useState<Partial<Participant>[]>([]);

  useEffect(() => {
    if (id) {
      fetchFamily();
    }
  }, [id]);

  const fetchFamily = async () => {
    try {
      const { data: family, error: familyError } = await supabase
        .from("families")
        .select("*")
        .eq("id", id)
        .single();

      if (familyError) throw familyError;

      if (family) {
        setFormData(family);
      }

      const { data: participants, error: participantsError } = await supabase
        .from("participants")
        .select("*")
        .eq("family_id", id)
        .eq("is_child", true);

      if (participantsError) throw participantsError;

      if (participants) {
        setChildren(participants);
      }
    } catch (error: any) {
      toast.error("Erro ao carregar família: " + error.message);
      navigate("/admin/families");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let familyId = id;

      if (id) {
        const { error } = await supabase
          .from("families")
          .update(formData)
          .eq("id", id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("families")
          .insert({
            esposo_nome: formData.esposo_nome!,
            esposa_nome: formData.esposa_nome!,
            contato_principal: formData.contato_principal!,
            address: formData.address,
            bairro: formData.bairro,
            city: formData.city,
            state: formData.state,
            zip_code: formData.zip_code,
            data_casamento: formData.data_casamento || null,
            esposo_phone: formData.esposo_phone,
            esposo_email: formData.esposo_email,
            esposo_profissao: formData.esposo_profissao,
            esposa_phone: formData.esposa_phone,
            esposa_email: formData.esposa_email,
            esposa_profissao: formData.esposa_profissao,
            needs_pajem: formData.needs_pajem,
            notes: formData.notes,
          })
          .select()
          .single();

        if (error) throw error;
        familyId = data.id;
      }

      // Atualiza os filhos
      if (familyId) {
        // Remove filhos existentes
        if (id) {
          const { error } = await supabase
            .from("participants")
            .delete()
            .eq("family_id", familyId)
            .eq("is_child", true);

          if (error) throw error;
        }

        // Insere novos filhos
        if (children.length > 0) {
          const childrenToInsert = children.map((child) => ({
            family_id: familyId!,
            full_name: child.full_name!,
            birth_date: child.birth_date,
            is_child: true,
            vai_acampamento: child.vai_acampamento,
            dietary_restrictions: child.dietary_restrictions,
            special_needs: child.special_needs,
          }));

          const { error } = await supabase
            .from("participants")
            .insert(childrenToInsert);

          if (error) throw error;
        }
      }

      toast.success("Família salva com sucesso!");
      navigate("/admin/families");
    } catch (error: any) {
      toast.error("Erro ao salvar família: " + error.message);
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

  const handleChildChange = (
    index: number,
    field: keyof Participant,
    value: any
  ) => {
    setChildren((prev) =>
      prev.map((child, i) =>
        i === index ? { ...child, [field]: value } : child
      )
    );
  };

  const addChild = () => {
    setChildren((prev) => [
      ...prev,
      {
        full_name: "",
        birth_date: "",
        vai_acampamento: true,
        dietary_restrictions: "",
        special_needs: "",
      },
    ]);
  };

  const removeChild = (index: number) => {
    setChildren((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            {id ? "Editar Família" : "Nova Família"}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
          {/* Dados do Casal */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Dados do Casal</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dados do Esposo */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Esposo</h3>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome</label>
                  <Input
                    name="esposo_nome"
                    value={formData.esposo_nome}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Telefone</label>
                  <Input
                    name="esposo_phone"
                    value={formData.esposo_phone || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    name="esposo_email"
                    type="email"
                    value={formData.esposo_email || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Profissão</label>
                  <Input
                    name="esposo_profissao"
                    value={formData.esposo_profissao || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Dados da Esposa */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Esposa</h3>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome</label>
                  <Input
                    name="esposa_nome"
                    value={formData.esposa_nome}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Telefone</label>
                  <Input
                    name="esposa_phone"
                    value={formData.esposa_phone || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    name="esposa_email"
                    type="email"
                    value={formData.esposa_email || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Profissão</label>
                  <Input
                    name="esposa_profissao"
                    value={formData.esposa_profissao || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Contato Principal</label>
              <RadioGroup
                value={formData.contato_principal}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    contato_principal: value as "esposo" | "esposa",
                  }))
                }
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="esposo" id="contato-esposo" />
                  <Label htmlFor="contato-esposo">Esposo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="esposa" id="contato-esposa" />
                  <Label htmlFor="contato-esposa">Esposa</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data do Casamento</label>
              <Input
                name="data_casamento"
                type="date"
                value={formData.data_casamento || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Endereço</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Endereço</label>
                <Input
                  name="address"
                  value={formData.address || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Bairro</label>
                <Input
                  name="bairro"
                  value={formData.bairro || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cidade</label>
                <Input
                  name="city"
                  value={formData.city || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Estado</label>
                <Input
                  name="state"
                  value={formData.state || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">CEP</label>
                <Input
                  name="zip_code"
                  value={formData.zip_code || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Filhos */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Filhos</h2>
              <Button type="button" onClick={addChild}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Filho
              </Button>
            </div>

            {children.map((child, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Filho {index + 1}</h3>
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nome</label>
                    <Input
                      value={child.full_name || ""}
                      onChange={(e) =>
                        handleChildChange(index, "full_name", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data de Nascimento</label>
                    <Input
                      type="date"
                      value={child.birth_date || ""}
                      onChange={(e) =>
                        handleChildChange(index, "birth_date", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Restrições Alimentares
                    </label>
                    <Input
                      value={child.dietary_restrictions || ""}
                      onChange={(e) =>
                        handleChildChange(
                          index,
                          "dietary_restrictions",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Necessidades Especiais
                    </label>
                    <Input
                      value={child.special_needs || ""}
                      onChange={(e) =>
                        handleChildChange(index, "special_needs", e.target.value)
                      }
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`vai-acampamento-${index}`}
                      checked={child.vai_acampamento ?? true}
                      onChange={(e) =>
                        handleChildChange(
                          index,
                          "vai_acampamento",
                          e.target.checked
                        )
                      }
                      className="h-4 w-4"
                    />
                    <label
                      htmlFor={`vai-acampamento-${index}`}
                      className="text-sm font-medium"
                    >
                      Vai ao Acampamento
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Outros */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Outros</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="needs-pajem"
                  checked={formData.needs_pajem ?? false}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      needs_pajem: e.target.checked,
                    }))
                  }
                  className="h-4 w-4"
                />
                <label htmlFor="needs-pajem" className="text-sm font-medium">
                  Precisa de Pajem
                </label>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Observações</label>
                <Textarea
                  name="notes"
                  value={formData.notes || ""}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/families")}
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