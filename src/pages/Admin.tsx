import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Printer, Settings, Users } from 'lucide-react';
import { CreateShipmentForm } from '@/components/admin/CreateShipmentForm';
import { PrintReceiptSection } from '@/components/admin-print';
import { ShipmentManagement } from '@/components/admin/ShipmentManagement';

const AdminPageContent = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [newShipment, setNewShipment] = useState<any>(null);

  const handleShipmentCreated = (shipment: any) => {
    setNewShipment(shipment);
    setActiveTab('print');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage shipments, users, and system settings</p>
      </div>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Administration Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-6">
              <TabsTrigger value="create" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Create
              </TabsTrigger>
              <TabsTrigger value="print" className="flex items-center gap-2">
                <Printer className="w-4 h-4" />
                Print
              </TabsTrigger>
              <TabsTrigger value="manage" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Shipments
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create">
              <CreateShipmentForm onShipmentCreated={handleShipmentCreated} />
            </TabsContent>

            <TabsContent value="print">
              <PrintReceiptSection />
            </TabsContent>

            <TabsContent value="manage">
              <ShipmentManagement />
            </TabsContent>

            <TabsContent value="users">
              {/* <UserManagement /> */}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Success notification when new shipment is created */}
      {newShipment && activeTab !== 'print' && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
            <p>Shipment created! Tracking: {newShipment.tracking_number}</p>
          </div>
          <button 
            onClick={() => setActiveTab('print')}
            className="text-sm underline mt-1 hover:text-green-200"
          >
            Print receipt
          </button>
        </div>
      )}
    </div>
  );
};

// Wrap the admin page with the protected route
const AdminPage = () => (
  // <AdminProtectedRoute>
    <AdminPageContent />
  // {/* </AdminProtectedRoute> */}
);

export default AdminPage;