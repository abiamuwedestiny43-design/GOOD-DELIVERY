import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Package, Printer, Settings, Users } from 'lucide-react'
import { CreateShipmentForm } from '@/components/admin/CreateShipmentForm'
import { PrintReceiptSection } from '@/components/admin-print'
import { ShipmentManagement } from '@/components/admin/ShipmentManagement'
import AdminProtectedRoute from '@/components/AdminProtectedRoute'
import { Shipment } from '@/types/shipment'

const AdminPageContent = () => {
  const [activeTab, setActiveTab] = useState('create')
  const [newShipment, setNewShipment] = useState<Shipment | null>(null)

  const handleShipmentCreated = (shipment: Shipment) => {
    setNewShipment(shipment)
    setActiveTab('print')
  }

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden pt-20">
      {/* Background Image for Dashboard */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-10 pointer-events-none bg-dashboard-ship"
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-emerald-950 mb-2 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-sm sm:text-lg text-slate-600 font-medium">
            Global Logistics Management & System Operations
          </p>
        </div>

        {/* Main Card */}
        <Card className="w-full shadow-2xl border-white/20 bg-white/80 backdrop-blur-md">
          <CardHeader className="border-b px-4 sm:px-6 bg-slate-50/50">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-emerald-900">
              <Settings className="w-5 h-5 text-emerald-600" />
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
              <TabsList className="bg-slate-100/80 p-1 flex sm:grid sm:grid-cols-4 gap-2 sm:gap-0 overflow-x-auto scrollbar-hide mb-8">
                <TabsTrigger
                  value="create"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-md flex items-center gap-1 sm:gap-2 whitespace-nowrap text-sm sm:text-base transition-all"
                >
                  <Package className="w-4 h-4 text-emerald-500" />
                  Create Shipment
                </TabsTrigger>
                <TabsTrigger
                  value="print"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-md flex items-center gap-1 sm:gap-2 whitespace-nowrap text-sm sm:text-base transition-all"
                >
                  <Printer className="w-4 h-4 text-emerald-500" />
                  Print Label
                </TabsTrigger>
                <TabsTrigger
                  value="manage"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-md flex items-center gap-1 sm:gap-2 whitespace-nowrap text-sm sm:text-base transition-all"
                >
                  <Package className="w-4 h-4 text-emerald-500" />
                  Manage Shipments
                </TabsTrigger>
                <TabsTrigger
                  value="users"
                  className="data-[state=active]:bg-white data-[state=active]:shadow-md flex items-center gap-1 sm:gap-2 whitespace-nowrap text-sm sm:text-base transition-all"
                >
                  <Users className="w-4 h-4 text-purple-500" />
                  User Registry
                </TabsTrigger>
              </TabsList>

              {/* Tab Contents */}
              <div className="mt-4">
                <TabsContent value="create" className="animate-in fade-in-50 duration-500">
                  <CreateShipmentForm onShipmentCreated={handleShipmentCreated} />
                </TabsContent>

                <TabsContent value="print" className="animate-in fade-in-50 duration-500">
                  <PrintReceiptSection />
                </TabsContent>

                <TabsContent value="manage" className="animate-in fade-in-50 duration-500">
                  <ShipmentManagement />
                </TabsContent>

                <TabsContent value="users" className="animate-in fade-in-50 duration-500">
                  <div className="p-8 text-center text-slate-500 italic">
                    User management module loading...
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        {/* Success Notification */}
        {newShipment && activeTab !== 'print' && (
          <div className="fixed bottom-8 right-8 bg-emerald-950 text-white p-5 rounded-2xl shadow-2xl z-50 max-w-sm border border-white/10 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <p className="font-semibold text-sm">Shipment Created Successfully</p>
                <p className="text-xs text-slate-400">Tracking: {newShipment.tracking_number}</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('print')}
              className="w-full mt-4 bg-white text-emerald-950 text-xs font-bold py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Print Shipping Label
            </button>
          </div>
        )}
      </div>
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
