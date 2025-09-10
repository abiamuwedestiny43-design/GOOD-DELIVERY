import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Eye, Download, Edit, Trash2, Plus, Printer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shipment } from '@/types/shipment';
import { downloadNodeAsPDF } from '@/lib/pdf';
import { EditShipmentDialog } from './EditShipmentDialog';
import { DeleteConfirmationDialog } from './DeleteConfirmationDialog';
import { ShipmentDetailsDialog } from './ShipmentDetailsDialog';
import { ShipmentReceipt } from '../ShipmentReceipt';

export const ShipmentManagement = () => {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [deleteShipment, setDeleteShipment] = useState<Shipment | null>(null);
  const [viewingShipment, setViewingShipment] = useState<Shipment | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch current location from tracking events
      const shipmentsWithLocation = await Promise.all(
        (data || []).map(async (shipment) => {
          const { data: trackingData } = await supabase
            .from('tracking_events')
            .select('location')
            .eq('shipment_id', shipment.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...shipment,
            current_location: trackingData?.location || 'Not specified'
          };
        })
      );

      setShipments(shipmentsWithLocation);
    } catch (error: any) {
      toast({
        title: 'Error fetching shipments',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'secondary';
      case 'in_transit':
        return 'secondary';
      case 'dispatched':
        return 'default';
      case 'pending':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const handleViewDetails = (shipment: Shipment) => {
    setViewingShipment(shipment);
    setIsViewDialogOpen(true);
  };

  const handleEditShipment = (shipment: Shipment) => {
    setEditingShipment(shipment);
    setIsEditDialogOpen(true);
  };

  const handleDeleteShipment = (shipment: Shipment) => {
    setDeleteShipment(shipment);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteShipment) return;

    try {
      // First delete tracking events
      await supabase
        .from('tracking_events')
        .delete()
        .eq('shipment_id', deleteShipment.id);

      // Then delete the shipment
      const { error } = await supabase
        .from('shipments')
        .delete()
        .eq('id', deleteShipment.id);

      if (error) throw error;

      toast({
        title: 'Shipment deleted',
        description: 'Shipment has been deleted successfully.',
      });

      fetchShipments();
    } catch (error: any) {
      toast({
        title: 'Error deleting shipment',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setDeleteShipment(null);
    }
  };

  const handleDownloadReceipt = async (shipment: Shipment) => {
    try {
      // Create a temporary element for PDF generation
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = `
        <div id="receipt-print">
          <ShipmentReceipt shipment={${JSON.stringify(shipment)}} />
        </div>
      `;
      
      // Wait for the component to render
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await downloadNodeAsPDF(tempDiv, `receipt_${shipment.tracking_number}.pdf`);
      
      toast({
        title: 'PDF Downloaded',
        description: 'Receipt has been downloaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Download Failed',
        description: 'Failed to download PDF',
        variant: 'destructive',
      });
    }
  };

  const handlePrintReceipt = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    
    // Create print window
    const printWindow = window.open('', '_blank');
    if (printWindow && selectedShipment) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt - ${selectedShipment.tracking_number}</title>
            <style>
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
              @media print { body { -webkit-print-color-adjust: exact; } }
            </style>
          </head>
          <body>
            <div id="receipt-content"></div>
          </body>
        </html>
      `);
      printWindow.document.close();
      
      // Render the receipt component
      const receiptElement = printWindow.document.getElementById('receipt-content');
      if (receiptElement) {
        receiptElement.innerHTML = `
          <div style="max-width: 800px; margin: 0 auto;">
            ${document.getElementById('receipt-print')?.innerHTML || ''}
          </div>
        `;
      }
      
      printWindow.focus();
      printWindow.print();
    }
  };

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = 
      shipment.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.receiver_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.sender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (shipment.receiver_email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (shipment.sender_email?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading shipments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by tracking number, name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Dispatched</SelectItem>
            <SelectItem value="in_transit">In Transit</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
            <SelectItem value="out_for_delivery">Arrived</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Shipment Management</CardTitle>
          <Button onClick={() => window.location.href = '/admin?tab=create'}>
            <Plus className="h-4 w-4 mr-2" />
            New Shipment
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking #</TableHead>
                  <TableHead>Sender</TableHead>
                  <TableHead>Receiver</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Current Location</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[200px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShipments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No shipments found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredShipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell className="font-mono font-medium">
                        {shipment.tracking_number}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{shipment.sender_name}</div>
                        <div className="text-sm text-muted-foreground">{shipment.sender_email}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{shipment.receiver_name}</div>
                        <div className="text-sm text-muted-foreground">{shipment.receiver_email}</div>
                      </TableCell>
                      <TableCell>{shipment.weight} kg</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(shipment.status || 'pending')}>
                          {shipment.status?.replace('_', ' ') || 'pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {shipment.current_location}
                      </TableCell>
                      <TableCell>
                        {new Date(shipment.created_at || '').toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(shipment)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadReceipt(shipment)}
                            title="Download Receipt"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePrintReceipt(shipment)}
                            title="Print Receipt"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditShipment(shipment)}
                            title="Edit Shipment"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteShipment(shipment)}
                            className="text-destructive hover:text-destructive"
                            title="Delete Shipment"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Hidden receipt for printing */}
      <div className="sr-only">
        {selectedShipment && (
          <div id="receipt-print">
            <ShipmentReceipt shipment={selectedShipment} />
          </div>
        )}
      </div>

      {/* Dialogs */}
      <EditShipmentDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        shipment={editingShipment}
        onUpdate={fetchShipments}
      />

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        shipment={deleteShipment}
      />

      <ShipmentDetailsDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        shipment={viewingShipment}
      />
    </div>
  );
};
