import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const VALID_USERS = [
  { username: "darko", password: "1234" },
  { username: "veljko", password: "1234" }
];

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    const user = VALID_USERS.find(
      (u) => u.username === username.toLowerCase() && u.password === password
    );

    if (user) {
      // Store the current user
      localStorage.setItem("currentUser", user.username);
      
      // Initialize user-specific data if it doesn't exist
      const userCustomers = localStorage.getItem(`customers_${user.username}`);
      const userProducts = localStorage.getItem(`products_${user.username}`);
      const userSales = localStorage.getItem(`sales_${user.username}`);
      
      if (!userCustomers) {
        localStorage.setItem(`customers_${user.username}`, JSON.stringify([]));
      }
      if (!userProducts) {
        localStorage.setItem(`products_${user.username}`, JSON.stringify([]));
      }
      if (!userSales) {
        localStorage.setItem(`sales_${user.username}`, JSON.stringify([]));
      }

      toast.success("Successfully logged in!");
      navigate("/sales");
    } else {
      toast.error("Invalid username or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            ŽIR-MD COMPANY
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Input
                id="username"
                placeholder="Username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Input
                id="password"
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me
              </label>
            </div>
            <Button type="submit" className="w-full">
              Sign in
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;