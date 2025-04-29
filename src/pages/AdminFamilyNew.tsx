import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import FamilyMemberForm from "@/components/FamilyMemberForm";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  main_contact_name: z.string().min(1, {
    message: "Nome do contato principal é obrigatório",
  }),
  main_contact_email: z.string().email({
    message: "Email inválido",
  }).optional().nullable(),
  main_contact_phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  bairro: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zip_code: z.string().optional().nullable(),
  phone_esposo: z.string().optional().nullable(),
  phone_esposa: z.string().optional().nullable(),
  phone_fixo: z.string().optional().nullable(),
  data_casamento: z.date().optional().nullable(),
  profissao_esposo: z.string().optional().nullable(),
  profissao_esposa: z.string().optional().nullable(),
  has_children: z.boolean().default(true),
  needs_pajem: z.boolean().default(false),
  valor_casal: z.number().optional().nullable(),
  valor_filhos: z.number().optional().nullable(),
  valor_pajem: z.number().optional().nullable(),
  valor_pago: z.number().optional().nullable(),
  forma_pagamento: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

interface Member {
  id: string;
  full_name: string;
  birth_date: Date | null;
  marital_status: string | null;
  is_child: boolean;
  is_pajem: boolean;
  vai_acampamento: boolean;
  pajem_parentesco?: string;
  pajem_idade?: number;
  pajem_phone?: string;
}

const AdminFamilyNew = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<Member[]>([
    { id: "1", full_name: "", birth_date: null, marital_status: null, is_child: false, is_pajem: false, vai_acampamento: true },
    { id: "2", full_name: "", birth_date: null, marital_status: null, is_child: false, is_pajem: false, vai_acampamento: true },
  ]);
  const [children, setChildren] = useState<Member[]>([]);
  const [pajem, setPajem] = useState<Member | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      main_contact_name: "",
      has_children: true,
      needs_pajem: false,
    },
  });

  const hasChildren = form.watch("has_children");
  const needsPajem = form.watch("needs_pajem");
  
  const addChild = () => {
    if (children.length < 5) { // Máximo de 5 filhos conforme a ficha
      const newId = `child-${children.length + 1}`;
      setChildren([...children, {
        id: newId,
        full_name: "",
        birth_date: null,
        marital_status: null,
        is_child: true,
        is_pajem: false,
        vai_acampamento: true,
      }]);
    }
  };

  const updateChild = (index: number, updatedChild: Partial<Member>) => {
    const updatedChildren = [...children];
    updatedChildren[index] = { ...updatedChildren[index], ...updatedChild };
    setChildren(updatedChildren);
  };

  const removeChild = (index: number) => {
    const updatedChildren = children.filter((_, i) => i !== index);
    setChildren(updatedChildren);
  };

  const updateMember = (index: number, updatedMember: Partial<Member>) => {
    const updatedMembers = [...members];
    updatedMembers[index] = { ...updatedMembers[index], ...updatedMember };
    setMembers(updatedMembers);
  };

  const updatePajem = (updatedPajem: Partial<Member>) => {
    setPajem(pajem ? { ...pajem, ...updatedPajem } : {
      id: "pajem",
      full_name: "",
      birth_date: null,
      marital_status: null,
      is_child: false,
      is_pajem: true,
      vai_acampamento: true,
      pajem_parentesco: "",
      pajem_idade: undefined,
      pajem_phone: "",
      ...updatedPajem
    });
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);

      // Converter data_casamento de Date para string ISO para o Supabase
      const formattedValues = {
        ...values,
        data_casamento: values.data_casamento ? values.data_casamento.toISOString() : null,
      };

      // Criar a família
      const { data: family, error: familyError } = await supabase
        .from("families")
        .insert(formattedValues)
        .select();

      if (familyError) throw familyError;

      const familyId = family[0].id;

      // Adicionar adultos
      for (const member of members.filter(m => m.full_name.trim())) {
        const { error: memberError } = await supabase
          .from("participants")
          .insert({
            family_id: familyId,
            full_name: member.full_name,
            birth_date: member.birth_date ? member.birth_date.toISOString() : null,
            marital_status: member.marital_status,
            is_child: member.is_child,
            vai_acampamento: member.vai_acampamento,
          });

        if (memberError) throw memberError;
      }

      // Adicionar filhos
      for (const child of children.filter(c => c.full_name.trim())) {
        const { error: childError } = await supabase
          .from("participants")
          .insert({
            family_id: familyId,
            full_name: child.full_name,
            birth_date: child.birth_date ? child.birth_date.toISOString() : null,
            is_child: true,
            vai_acampamento: child.vai_acampamento,
          });

        if (childError) throw childError;
      }

      // Adicionar pajem se necessário
      if (needsPajem && pajem && pajem.full_name.trim()) {
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
      toast.error(`Erro ao cadastrar família: ${error.message}`);
      console.error("Erro ao cadastrar família:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Nova Família</h1>
          <Button onClick={() => navigate("/admin/families")}>Voltar para Lista</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dados da Família</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Seção de dados do contato principal */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Dados do Casal</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="main_contact_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Contato Principal</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="main_contact_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="email@exemplo.com" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="phone_esposo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone Esposo</FormLabel>
                          <FormControl>
                            <Input placeholder="(XX) XXXXX-XXXX" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone_esposa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone Esposa</FormLabel>
                          <FormControl>
                            <Input placeholder="(XX) XXXXX-XXXX" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone_fixo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone Fixo</FormLabel>
                          <FormControl>
                            <Input placeholder="(XX) XXXX-XXXX" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="data_casamento"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Data do Casamento</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "dd/MM/yyyy", { locale: ptBR })
                                  ) : (
                                    <span>Selecione uma data</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value || undefined}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date()
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="profissao_esposo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profissão Esposo</FormLabel>
                          <FormControl>
                            <Input placeholder="Profissão" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="profissao_esposa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Profissão Esposa</FormLabel>
                          <FormControl>
                            <Input placeholder="Profissão" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Seção de endereço */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-semibold">Endereço</h3>
                  
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua, número" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="bairro"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bairro</FormLabel>
                          <FormControl>
                            <Input placeholder="Bairro" {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-2">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cidade</FormLabel>
                            <FormControl>
                              <Input placeholder="Cidade" {...field} value={field.value || ''} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>UF</FormLabel>
                            <FormControl>
                              <Input placeholder="SP" {...field} value={field.value || ''} maxLength={2} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="zip_code"
                    render={({ field }) => (
                      <FormItem className="max-w-xs">
                        <FormLabel>CEP</FormLabel>
                        <FormControl>
                          <Input placeholder="00000-000" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Seção de membros */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-semibold">Membros</h3>

                  {members.map((member, index) => (
                    <div key={member.id} className="p-4 border rounded-md">
                      <h4 className="font-medium mb-2">Adulto {index + 1}</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Nome Completo</label>
                          <Input
                            value={member.full_name}
                            onChange={(e) => updateMember(index, { full_name: e.target.value })}
                            placeholder="Nome completo"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Estado Civil</label>
                          <Select
                            value={member.marital_status || ""}
                            onValueChange={(value) => updateMember(index, { marital_status: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecionar..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                              <SelectItem value="casado">Casado(a)</SelectItem>
                              <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                              <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                              <SelectItem value="outro">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="flex items-center gap-2 text-sm font-medium">
                            <Checkbox
                              checked={member.vai_acampamento}
                              onCheckedChange={(checked) => 
                                updateMember(index, { vai_acampamento: checked === true })
                              }
                            />
                            <span>Vai ao acampamento</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Filhos */}
                  <div className="mt-6">
                    <div className="mb-4">
                      <FormField
                        control={form.control}
                        name="has_children"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Tem filhos</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    {hasChildren && (
                      <div className="space-y-4">
                        {children.map((child, index) => (
                          <div key={child.id} className="p-4 border rounded-md">
                            <div className="flex justify-between mb-2">
                              <h4 className="font-medium">Filho {index + 1}</h4>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeChild(index)}
                              >
                                Remover
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Nome Completo</label>
                                <Input
                                  value={child.full_name}
                                  onChange={(e) => updateChild(index, { full_name: e.target.value })}
                                  placeholder="Nome completo"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium">
                                  <Checkbox
                                    checked={child.vai_acampamento}
                                    onCheckedChange={(checked) => 
                                      updateChild(index, { vai_acampamento: checked === true })
                                    }
                                  />
                                  <span>Vai ao acampamento</span>
                                </label>
                              </div>
                            </div>
                          </div>
                        ))}

                        <Button 
                          type="button"
                          variant="outline"
                          onClick={addChild}
                          disabled={children.length >= 5}
                        >
                          Adicionar Filho ({children.length}/5)
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Pajem */}
                  <div className="mt-6">
                    <div className="mb-4">
                      <FormField
                        control={form.control}
                        name="needs_pajem"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Precisa de Pajem</FormLabel>
                              <FormDescription>
                                Para filhos menores de 4 anos
                              </FormDescription>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    {needsPajem && (
                      <div className="p-4 border rounded-md">
                        <h4 className="font-medium mb-2">Dados do Pajem</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Nome Completo</label>
                            <Input
                              value={pajem?.full_name || ''}
                              onChange={(e) => updatePajem({ full_name: e.target.value })}
                              placeholder="Nome completo do pajem"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Idade</label>
                            <Input
                              type="number"
                              value={pajem?.pajem_idade || ''}
                              onChange={(e) => updatePajem({ pajem_idade: parseInt(e.target.value) || undefined })}
                              placeholder="Idade"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Parentesco</label>
                            <Input
                              value={pajem?.pajem_parentesco || ''}
                              onChange={(e) => updatePajem({ pajem_parentesco: e.target.value })}
                              placeholder="Ex: Tia, Avó..."
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Telefone</label>
                            <Input
                              value={pajem?.pajem_phone || ''}
                              onChange={(e) => updatePajem({ pajem_phone: e.target.value })}
                              placeholder="(XX) XXXXX-XXXX"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm font-medium">
                              <Checkbox
                                checked={pajem?.vai_acampamento || false}
                                onCheckedChange={(checked) => 
                                  updatePajem({ vai_acampamento: checked === true })
                                }
                              />
                              <span>Vai ao acampamento</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Seção Financeira */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-semibold">Dados Financeiros</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="valor_casal"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Casal</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="0.00"
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="valor_filhos"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Filhos</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="0.00"
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="valor_pajem"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Pajem</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="0.00"
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="valor_pago"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Valor Pago</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="0.00"
                              {...field}
                              value={field.value || ''}
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="forma_pagamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Forma de Pagamento</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value || ''}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a forma de pagamento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="dinheiro">Dinheiro</SelectItem>
                            <SelectItem value="pix">PIX</SelectItem>
                            <SelectItem value="cheque">Cheque(s)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Informações adicionais sobre a família"
                          className="min-h-[100px]" 
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="pt-6">
                  <Button type="submit" disabled={loading}>
                    {loading ? "Cadastrando..." : "Cadastrar Família"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminFamilyNew;
