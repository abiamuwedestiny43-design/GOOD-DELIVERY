import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { AddTrackingForm } from "@/components/AddTrackingForm";
import { Button } from "@/components/ui/button";
import speedyLogo from "@/assets/speedy-logistics-logo.png";
import AdminDashboard from "@/components/dashboardheader";

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

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // if (!isAdmin) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-background">
  //       <div className="text-center">
  //         <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
  //         <p className="text-muted-foreground mb-4">You need admin privileges to access this page.</p>
  //         <Button onClick={signOut} variant="outline">Sign Out</Button>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img 
              src={speedyLogo} 
              alt="Speedy Logistics" 
              className="w-10 h-10 rounded-full"
            />
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          </div>
          <Button onClick={signOut} variant="outline">
            Sign Out
          </Button>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <AdminDashboard />
      </main>
    </div>
  );
};

export default Index;
