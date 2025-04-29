import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import FamilyMemberForm from "@/components/FamilyMemberForm";

interface FamilyValues {
  main_contact_name: string;
  main_contact_email: string;
  main_contact_phone: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  data_casamento: Date | null;
  needs_pajem: boolean;
  obs: string;
  registration_status: string;
  payment_status: string;
  valor_casal: number;
  valor_filhos: number;
  valor_pajem: number;
  valor_pago: number;
}

interface Member {
  id: string;
  full_name: string;
  birth_date: Date | null;
  marital_status: string | null;
  is_child: boolean;
  vai_acampamento: boolean;
}

interface Pajem {
  full_name: string;
  pajem_idade: number | null;
  pajem_parentesco: string;
  pajem_phone: string;
  vai_acampamento: boolean;
}

const initialFamilyValues: FamilyValues = {
  main_contact_name: "",
  main_contact_email: "",
  main_contact_phone: "",
  address: "",
  city: "",
  state: "",
  zip_code: "",
  country: "",
  data_casamento: null,
  needs_pajem: false,
  obs: "",
  registration_status: "pendente",
  payment_status: "pendente",
  valor_casal: 0,
  valor_filhos: 0,
  valor_pajem: 0,
  valor_pago: 0,
};

const initialMember: Member = {
  id: "",
  full_name: "",
  birth_date: null,
  marital_status: null,
  is_child: false,
  vai_acampamento: false,
};

const initialPajem: Pajem = {
  full_name: "",
  pajem_idade: null,
  pajem_parentesco: "",
  pajem_phone: "",
  vai_acampamento: false,
};

const AdminFamilyNew = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState<FamilyValues>(initialFamilyValues);
  const [adults, setAdults] = useState<Member[]>([
    { ...initialMember, id: "adult1" },
    { ...initialMember, id: "adult2" },
  ]);
  const [children, setChildren] = useState<Member[]>([]);
  const [pajem, setPajem] = useState<Pajem>(initialPajem);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setValues({ ...values, [name]: checked });
  };

  const handleDateChange = (name: string, date: Date | null) => {
    setValues({ ...values, [name]: date });
  };

  const handleAddAdult = () => {
    const newId = `adult${adults.length + 1}`;
    setAdults([...adults, { ...initialMember, id: newId }]);
  };

  const handleUpdateAdult = (id: string, updatedFields: Partial<Member>) => {
    setAdults(adults.map(adult => adult.id === id ? { ...adult, ...updatedFields } : adult));
  };

  const handleRemoveAdult = (id: string) => {
    setAdults(adults.filter(adult => adult.id !== id));
  };

  const handleAddChild = () => {
    const newId = `child${children.length + 1}`;
    setChildren([...children, { ...initialMember, id: newId, is_child: true }]);
  };

  const handleUpdateChild = (id: string, updatedFields: Partial<Member>) => {
    setChildren(children.map(child => child.id === id ? { ...child, ...updatedFields } : child));
  };

  const handleRemoveChild = (id: string) => {
    setChildren(children.filter(child => child.id !== id));
  };

  const handlePajemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPajem({ ...pajem, [name]: value });
  };

  const handlePajemCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setPajem({ ...pajem, [name]: checked });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      const familyData = {
        ...values,
        main_contact_name: values.main_contact_name || "",
        data_casamento: values.data_casamento ? values.data_casamento.toISOString().split('T')[0] : null,
        valor_casal: Number(values.valor_casal) || 0,
        valor_filhos: Number(values.valor_filhos) || 0,
        valor_pajem: Number(values.valor_pajem) || 0,
        valor_pago: Number(values.valor_pago) || 0
      };

      const { data: family, error: familyError } = await supabase
        .from("families")
        .insert(familyData)
        .select();

      if (familyError) throw familyError;

      const familyId = family?.[0]?.id;
      if (!familyId) throw new Error("Erro ao obter ID da família");

      for (const member of adults) {
        if (member.full_name) {
          const { error: memberError } = await supabase
            .from("participants")
            .insert({
              family_id: familyId,
              full_name: member.full_name,
              birth_date: member.birth_date ? member.birth_date.toISOString().split('T')[0] : null,
              marital_status: member.marital_status as "solteiro" | "casado" | "divorciado" | "viuvo" | "outro" | null,
              is_child: member.is_child,
              vai_acampamento: member.vai_acampamento,
            });

          if (memberError) throw memberError;
        }
      }

      for (const child of children) {
        if (child.full_name) {
          const { error: childError } = await supabase
            .from("participants")
            .insert({
              family_id: familyId,
              full_name: child.full_name,
              birth_date: child.birth_date ? child.birth_date.toISOString().split('T')[0] : null,
              is_child: true,
              vai_acampamento: child.vai_acampamento,
            });

          if (childError) throw childError;
        }
      }

      if (values.needs_pajem && pajem.full_name) {
        const { error: pajemError } = await supabase
          .from("participants")
          .insert({
            family_id: familyId,
            full_name: pajem.full_name,
            is_pajem: true,
            pajem_idade: pajem.pajem_idade,
            pajem_parentesco: pajem.pajem_parentesco,
            pajem_phone: pajem.pajem_phone,
            vai_acampamento: pajem.vai_acampamento,
          });

        if (pajemError) throw pajemError;
      }

      toast.success("Família cadastrada com sucesso!");
      navigate("/admin/families");
    } catch (error: any) {
      console.error(error);
      toast.error(`Erro ao cadastrar família: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Nova Família</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="main_contact_name">Nome do Contato Principal</Label>
                  <Input
                    type="text"
                    id="main_contact_name"
                    name="main_contact_name"
                    value={values.main_contact_name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="main_contact_email">Email do Contato Principal</Label>
                  <Input
                    type="email"
                    id="main_contact_email"
                    name="main_contact_email"
                    value={values.main_contact_email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="main_contact_phone">Telefone do Contato Principal</Label>
                  <Input
                    type="tel"
                    id="main_contact_phone"
                    name="main_contact_phone"
                    value={values.main_contact_phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_casamento">Data de Casamento</Label>
                  <Input
                    type="date"
                    id="data_casamento"
                    name="data_casamento"
                    value={values.data_casamento ? values.data_casamento.toISOString().split('T')[0] : ""}
                    onChange={(e) => handleInputChange(e)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    type="text"
                    id="address"
                    name="address"
                    value={values.address}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    type="text"
                    id="city"
                    name="city"
                    value={values.city}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    type="text"
                    id="state"
                    name="state"
                    value={values.state}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip_code">CEP</Label>
                  <Input
                    type="text"
                    id="zip_code"
                    name="zip_code"
                    value={values.zip_code}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">País</Label>
                  <Input
                    type="text"
                    id="country"
                    name="country"
                    value={values.country}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="obs">Observações</Label>
                <Textarea
                  id="obs"
                  name="obs"
                  value={values.obs}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="space-y-2">
                  <Label htmlFor="valor_casal">Valor Casal</Label>
                  <Input
                    type="number"
                    id="valor_casal"
                    name="valor_casal"
                    value={values.valor_casal}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor_filhos">Valor Filhos</Label>
                  <Input
                    type="number"
                    id="valor_filhos"
                    name="valor_filhos"
                    value={values.valor_filhos}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor_pajem">Valor Pajem</Label>
                  <Input
                    type="number"
                    id="valor_pajem"
                    name="valor_pajem"
                    value={values.valor_pajem}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor_pago">Valor Pago</Label>
                  <Input
                    type="number"
                    id="valor_pago"
                    name="valor_pago"
                    value={values.valor_pago}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <Checkbox
                    id="needs_pajem"
                    name="needs_pajem"
                    checked={values.needs_pajem}
                    onCheckedChange={(checked) => setValues({ ...values, needs_pajem: checked === true })}
                  />
                  <span>Precisa de Pajem?</span>
                </Label>
              </div>

              {values.needs_pajem && (
                <div className="p-4 border rounded-md">
                  <h4 className="font-medium">Dados do Pajem</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="space-y-2">
                      <Label htmlFor="pajem_name">Nome Completo do Pajem</Label>
                      <Input
                        type="text"
                        id="pajem_name"
                        name="full_name"
                        value={pajem.full_name}
                        onChange={handlePajemChange}
                        placeholder="Nome completo"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pajem_idade">Idade do Pajem</Label>
                      <Input
                        type="number"
                        id="pajem_idade"
                        name="pajem_idade"
                        value={pajem.pajem_idade || ""}
                        onChange={handlePajemChange}
                        placeholder="Idade"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pajem_parentesco">Parentesco do Pajem</Label>
                      <Input
                        type="text"
                        id="pajem_parentesco"
                        name="pajem_parentesco"
                        value={pajem.pajem_parentesco}
                        onChange={handlePajemChange}
                        placeholder="Parentesco"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pajem_phone">Telefone do Pajem</Label>
                      <Input
                        type="tel"
                        id="pajem_phone"
                        name="pajem_phone"
                        value={pajem.pajem_phone}
                        onChange={handlePajemChange}
                        placeholder="Telefone"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center space-x-2">
                        <Checkbox
                          id="pajem_vai_acampamento"
                          name="vai_acampamento"
                          checked={pajem.vai_acampamento}
                          onCheckedChange={(checked) => setPajem({ ...pajem, vai_acampamento: checked === true })}
                        />
                        <span>Pajem vai ao acampamento</span>
                      </Label>
                    </div>
                  </div>
                </div>
              )}

              <h3 className="text-xl font-semibold mt-6">Adultos</h3>
              {adults.map((adult, index) => (
                <FamilyMemberForm
                  key={adult.id}
                  member={adult}
                  onUpdate={(updatedFields) => handleUpdateAdult(adult.id, updatedFields)}
                  onRemove={adults.length > 2 ? () => handleRemoveAdult(adult.id) : undefined}
                  showRemoveButton={adults.length > 2}
                />
              ))}
              <Button type="button" variant="outline" onClick={handleAddAdult}>
                Adicionar Adulto
              </Button>

              <h3 className="text-xl font-semibold mt-6">Filhos</h3>
              {children.map((child, index) => (
                <FamilyMemberForm
                  key={child.id}
                  member={child}
                  isChild={true}
                  onUpdate={(updatedFields) => handleUpdateChild(child.id, updatedFields)}
                  onRemove={() => handleRemoveChild(child.id)}
                  showRemoveButton
                />
              ))}
              <Button type="button" variant="outline" onClick={handleAddChild}>
                Adicionar Filho
              </Button>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Cadastrando..." : "Cadastrar Família"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminFamilyNew;
