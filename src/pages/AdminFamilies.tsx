
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";

type Family = Tables<"families">;

const AdminFamilies = () => {
  const navigate = useNavigate();
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFamilies();
  }, []);

  const fetchFamilies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("families")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFamilies(data || []);
    } catch (error: any) {
      toast.error(`Erro ao buscar famílias: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Famílias Cadastradas</h1>
          <Button onClick={() => navigate("/admin/families/new")}>Nova Família</Button>
        </div>

        {loading ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center">Carregando famílias...</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {families.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center">Nenhuma família cadastrada.</p>
                  <div className="flex justify-center mt-4">
                    <Button onClick={() => navigate("/admin/families/new")}>
                      Cadastrar Nova Família
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {families.map((family) => (
                  <Card key={family.id} className="overflow-hidden">
                    <CardHeader className="bg-secondary p-4">
                      <CardTitle className="text-xl">{family.main_contact_name}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <p className="font-medium">Contato</p>
                          <p className="text-sm">{family.main_contact_email || "-"}</p>
                          <p className="text-sm">{family.main_contact_phone || "-"}</p>
                        </div>
                        <div>
                          <p className="font-medium">Endereço</p>
                          <p className="text-sm">{family.address || "-"}</p>
                          <p className="text-sm">{family.city} {family.state && `- ${family.state}`}</p>
                        </div>
                        <div>
                          <p className="font-medium">Status</p>
                          <p className="text-sm">Inscrição: {family.registration_status || "Pendente"}</p>
                          <p className="text-sm">Pagamento: {family.payment_status || "Pendente"}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/admin/families/${family.id}`)}
                        >
                          Ver Detalhes
                        </Button>
                        <Button
                          variant="default"
                          onClick={() => navigate(`/admin/families/edit/${family.id}`)}
                        >
                          Editar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default AdminFamilies;
