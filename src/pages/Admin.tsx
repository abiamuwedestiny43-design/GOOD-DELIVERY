import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Package, Printer, Settings, Users } from 'lucide-react'
import { CreateShipmentForm } from '@/components/admin/CreateShipmentForm'
import { PrintReceiptSection } from '@/components/admin-print'
import { ShipmentManagement } from '@/components/admin/ShipmentManagement'
import AdminProtectedRoute from '@/components/AdminProtectedRoute'

const AdminPageContent = () => {
  const [activeTab, setActiveTab] = useState('create')
  const [newShipment, setNewShipment] = useState<any>(null)

  const handleShipmentCreated = (shipment: any) => {
    setNewShipment(shipment)
    setActiveTab('print')
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Admin Dashboard
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage shipments, users, and system settings
        </p>
      </div>

      {/* Main Card */}
      <Card className="w-full">
        <CardHeader className="border-b px-4 sm:px-6">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Settings className="w-5 h-5" />
            Administration Panel
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6 px-2 sm:px-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            {/* Responsive Tabs */}
            <TabsList className="flex sm:grid sm:grid-cols-4 gap-2 sm:gap-0 overflow-x-auto scrollbar-hide mb-6">
              <TabsTrigger
                value="create"
                className="flex items-center gap-1 sm:gap-2 whitespace-nowrap text-sm sm:text-base"
              >
                <Package className="w-4 h-4" />
                Create
              </TabsTrigger>
              <TabsTrigger
                value="print"
                className="flex items-center gap-1 sm:gap-2 whitespace-nowrap text-sm sm:text-base"
              >
                <Printer className="w-4 h-4" />
                Print
              </TabsTrigger>
              <TabsTrigger
                value="manage"
                className="flex items-center gap-1 sm:gap-2 whitespace-nowrap text-sm sm:text-base"
              >
                <Package className="w-4 h-4" />
                Shipments
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="flex items-center gap-1 sm:gap-2 whitespace-nowrap text-sm sm:text-base"
              >
                <Users className="w-4 h-4" />
                Users
              </TabsTrigger>
            </TabsList>

            {/* Tab Contents */}
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

      {/* Success Notification */}
      {newShipment && activeTab !== 'print' && (
        <div className="fixed bottom-4 left-4 right-4 sm:right-4 sm:left-auto bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm mx-auto sm:mx-0">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <p className="text-sm">
              Shipment created! Tracking: {newShipment.tracking_number}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('print')}
            className="text-xs underline mt-1 hover:text-green-200"
          >
            Print receipt
          </button>
        </div>
      )}
    </div>
  )
}

// Wrap the admin page with the protected route
const AdminPage = () => (
  <AdminProtectedRoute>
    <AdminPageContent />
  </AdminProtectedRoute>
)

export default AdminPage;
