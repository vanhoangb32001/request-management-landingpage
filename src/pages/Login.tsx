import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { auth, ticketApi } from "@/lib/ticketApi";
import { toast } from "@/hooks/use-toast";
import { Loader2, Ticket } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth.getToken()) navigate("/dashboard", { replace: true });
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await ticketApi.login(email, password);
      const r = res.responseData;
      auth.setSession(r.access_token, r.refresh_token, r.user);
      toast({ title: "Đăng nhập thành công" });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast({
        title: "Đăng nhập thất bại",
        description: err instanceof Error ? err.message : "Lỗi không xác định",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary p-4">
      <Card className="w-full max-w-md p-8 shadow-xl">
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
            <Ticket className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Quản lý Ticket</h1>
          <p className="text-sm text-muted-foreground mt-1">Đăng nhập để tiếp tục</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Đăng nhập
          </Button>
        </form>
      </Card>
    </main>
  );
};

export default Login;