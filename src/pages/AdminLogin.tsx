
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import Layout from "@/components/Layout";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Authenticate the user
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        // Wait a moment to ensure the session is properly set
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check if the user is in the admins table
        const { data: admin, error: adminError } = await supabase
          .from("admins")
          .select("*")
          .eq("user_id", data.user.id)
          .maybeSingle();

        if (adminError) {
          console.error("Error checking admin status:", adminError);
          await supabase.auth.signOut();
          throw new Error("Erro ao verificar credenciais de administrador");
        }

        if (!admin) {
          // If not an admin, sign out and notify
          await supabase.auth.signOut();
          throw new Error("Usuário não é administrador");
        }

        toast.success("Login realizado com sucesso!");
        navigate("/admin");
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao fazer login");
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Login Administrativo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default AdminLogin;
