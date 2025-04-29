
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { toast } from "sonner";

const AdminPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      setIsLoading(true);
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/admin/login");
        return;
      }

      // Check if the user is in the admins table using a direct query
      // This avoids the RLS policy infinite recursion issue
      const { data: admin, error } = await supabase
        .from("admins")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();  // Using maybeSingle instead of single to avoid errors

      if (error) {
        console.error("Error checking admin status:", error);
        await supabase.auth.signOut();
        toast.error("Erro ao verificar credenciais de administrador");
        navigate("/admin/login");
        return;
      }

      if (!admin) {
        // If not an admin, sign out and redirect
        await supabase.auth.signOut();
        toast.error("Acesso não autorizado");
        navigate("/admin/login");
        return;
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Erro ao verificar administrador:", error);
      navigate("/admin/login");
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[80vh]">
          <p>Verificando credenciais...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Área Administrativa</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Button 
            className="p-6 h-auto flex flex-col items-center gap-4"
            onClick={() => navigate("/admin/families/new")}
          >
            <span className="text-xl">Nova Família</span>
            <span className="text-sm text-muted-foreground">Cadastrar nova família e participantes</span>
          </Button>

          <Button 
            className="p-6 h-auto flex flex-col items-center gap-4"
            variant="secondary"
            onClick={() => navigate("/admin/families")}
          >
            <span className="text-xl">Famílias</span>
            <span className="text-sm text-muted-foreground">Gerenciar famílias cadastradas</span>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default AdminPage;
