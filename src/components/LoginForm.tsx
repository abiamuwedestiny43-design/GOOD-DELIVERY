import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import speedyLogo from "@/assets/speedy-logistics-logo.png";

export const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Sign In Attempted",
      description: "This is a demo login form",
    });
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg">
      <CardHeader className="text-center pb-6">
        <div className="flex justify-center mb-4">
          <img 
            src={speedyLogo} 
            alt="Speedy Logistics" 
            className="w-24 h-24 rounded-full"
          />
        </div>
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Hello! let's get started
        </h1>
        <p className="text-muted-foreground text-sm">
          Sign in to continue.
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-12"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12"
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 text-white font-medium"
          >
            SIGN IN
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};