import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { AddTrackingForm } from "@/components/AddTrackingForm";
import { Button } from "@/components/ui/button";
import speedyLogo from "@/assets/speedy-logistics-logo.png";
import Home from "./Home";
import Header from "@/components/Header";

const Index = () => {
  const { user, loading, signOut, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <img 
            src={speedyLogo} 
            alt="Speedy Logistics" 
            className="w-16 h-16 rounded-full mx-auto mb-4 animate-pulse"
          />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
     {/* <Header /> */}
      
      <main className="container mx-auto px-4 py-8">
        <Home />
      </main>
    </div>
  );
};

export default Index;
