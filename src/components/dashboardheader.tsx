import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PrintReceiptSection } from './admin-print';
import ShipmentDetails from './shipment-details';
import { AddTrackingForm } from './AddTrackingForm';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="shipments">Shipments</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="print">Print Receipts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
         <AddTrackingForm />
        </TabsContent>

        <TabsContent value="shipments" className="space-y-4">
            <ShipmentDetails />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          {/* Reports content */}
        </TabsContent>

        <TabsContent value="print" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-1">
            <PrintReceiptSection />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}