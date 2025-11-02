import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search, Filter, Eye, Download, Edit, Trash2, Plus, Copy } from 'lucide-react';
import { Shipment, ShipmentReceipt } from '@/components/ShipmentReceipt';
import { downloadNodeAsPDF } from '@/lib/pdf';
import { useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';

export default function ShipmentDetails() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [shipmentToDelete, setShipmentToDelete] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isGeneratingTracking, setIsGeneratingTracking] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);
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

      if (error) {
        throw error;
      }

      // Transform database fields to match Shipment type with defaults
      const transformedShipments = (data || []).map(shipment => ({
        id: shipment.id,
        tracking_number: shipment.tracking_number,
        sender_name: shipment.sender_name,
        sender_email: shipment.sender_email,
        sender_phone: shipment.sender_phone,
        sender_address: shipment.sender_address,
        receiver_name: shipment.receiver_name,
        receiver_email: shipment.receiver_email,
        receiver_phone: shipment.receiver_phone,
        receiver_address: shipment.receiver_address,
        package_description: shipment.package_description,
        weight: shipment.weight,
        status: shipment.status,
        created_at: shipment.created_at,
        updated_at: shipment.updated_at,
        // Fields that exist in the interface but not necessarily in DB
        quantity: null,
        service_type: null,
        sending_date: shipment.sending_date,
        delivery_date: shipment.delivery_date,
        shipping_fee: shipment.shipping_fee,
        insurance: null,
        insurance_amount: null,
        special_instructions: null,
        payment_method: null,
        payment_status: null,
      }));
      
      setShipments(transformedShipments);
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

  const generateTrackingNumber = async () => {
    setIsGeneratingTracking(true);
    try {
      const { data, error } = await supabase.rpc('generate_tracking_number');
      
      if (error) {
        throw error;
      }
      
      if (editingShipment) {
        setEditingShipment({
          ...editingShipment,
          tracking_number: data
        });
      }
      
      toast({
        title: 'Tracking number generated',
        description: 'New tracking number has been created.',
      });
    } catch (error: any) {
      toast({
        title: 'Error generating tracking number',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingTracking(false);
    }
  };

  const copyTrackingNumber = (trackingNumber: string) => {
    navigator.clipboard.writeText(trackingNumber);
    toast({
      title: 'Copied to clipboard',
      description: 'Tracking number copied to clipboard.',
    });
  };

  const handleUpdateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingShipment) return;

    // Store the original status to check if it changed
    const originalStatus = shipments.find(s => s.id === editingShipment.id)?.status;
    const statusChanged = originalStatus !== editingShipment.status;

    try {
      const { error } = await supabase
        .from('shipments')
        .update({
          tracking_number: editingShipment.tracking_number,
          sender_name: editingShipment.sender_name,
          sender_email: editingShipment.sender_email,
          sender_phone: editingShipment.sender_phone,
          sender_address: editingShipment.sender_address,
          receiver_name: editingShipment.receiver_name,
          receiver_email: editingShipment.receiver_email,
          receiver_phone: editingShipment.receiver_phone,
          receiver_address: editingShipment.receiver_address,
          package_description: editingShipment.package_description,
          weight: editingShipment.weight,
          status: editingShipment.status,
          service_type: editingShipment.service_type,
          shipping_fee: editingShipment.shipping_fee,
          insurance_amount: editingShipment.insurance_amount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingShipment.id);

      if (error) {
        throw error;
      }

      // If status changed and we have a receiver email, send status update email
      if (statusChanged && editingShipment.receiver_email && editingShipment.status) {
        try {
          await supabase.functions.invoke('send-status-update', {
            body: {
              to: editingShipment.receiver_email,
              shipmentData: editingShipment,
              newStatus: editingShipment.status
            }
          });
          console.log("Status update email sent successfully");
        } catch (emailError) {
          console.error("Failed to send status update email:", emailError);
          // Don't fail the entire operation if email fails
        }
      }

      toast({
        title: 'Shipment updated',
        description: statusChanged 
          ? 'Shipment updated and status update email sent to receiver.'
          : 'Shipment details have been updated successfully.',
      });

      setIsEditDialogOpen(false);
      setEditingShipment(null);
      fetchShipments();
    } catch (error: any) {
      toast({
        title: 'Error updating shipment',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleDeleteShipment = async () => {
    if (!shipmentToDelete) return;

    try {
      // First delete tracking events associated with the shipment
      await supabase
        .from('tracking_events')
        .delete()
        .eq('shipment_id', shipmentToDelete);

      // Then delete the shipment
      const { error } = await supabase
        .from('shipments')
        .delete()
        .eq('id', shipmentToDelete);

      if (error) {
        throw error;
      }

      toast({
        title: 'Shipment deleted',
        description: 'Shipment has been deleted successfully.',
      });

      setDeleteConfirmOpen(false);
      setShipmentToDelete(null);
      fetchShipments();
    } catch (error: any) {
      toast({
        title: 'Error deleting shipment',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const openDeleteConfirm = (shipmentId: string) => {
    setShipmentToDelete(shipmentId);
    setDeleteConfirmOpen(true);
  };

  const openEditDialog = (shipment: Shipment) => {
    setEditingShipment({ ...shipment });
    setIsEditDialogOpen(true);
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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'secondary'; // Use secondary instead of success
      case 'in_transit':
        return 'secondary';
      case 'processing':
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
    setSelectedShipment(shipment);
  };

  const handleDownloadReceipt = async (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setTimeout(async () => {
      if (receiptRef.current) {
        await downloadNodeAsPDF(receiptRef.current, `shipment_${shipment.tracking_number}.pdf`);
        toast({
          title: 'Receipt downloaded',
          description: `Receipt for ${shipment.tracking_number} has been downloaded.`,
        });
      }
    }, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading shipments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Tracked Shipments</CardTitle>
            <CardDescription>
              View and manage all shipments in the system. Total: {shipments.length} shipments
            </CardDescription>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Shipment
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="in_transit">In Transit</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tracking #</TableHead>
                  <TableHead>Sender</TableHead>
                  <TableHead>Receiver</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShipments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No shipments found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredShipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell className="font-mono font-medium">
                        <div className="flex items-center gap-2">
                          {shipment.tracking_number}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4"
                            onClick={() => copyTrackingNumber(shipment.tracking_number)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
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
                        {new Date(shipment.created_at || '').toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(shipment)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadReceipt(shipment)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(shipment)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteConfirm(shipment.id)}
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

      {/* Edit Shipment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Shipment</DialogTitle>
            <DialogDescription>
              Update the shipment details below.
            </DialogDescription>
          </DialogHeader>
          {editingShipment && (
            <form onSubmit={handleUpdateShipment} className="space-y-4">
              {/* Tracking Number Section */}
              <div className="space-y-2">
                <Label htmlFor="tracking_number">Tracking Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="tracking_number"
                    value={editingShipment.tracking_number}
                    onChange={(e) => setEditingShipment({
                      ...editingShipment,
                      tracking_number: e.target.value
                    })}
                    required
                    className="font-mono"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => copyTrackingNumber(editingShipment.tracking_number)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={generateTrackingNumber}
                    disabled={isGeneratingTracking}
                  >
                    {isGeneratingTracking ? 'Generating...' : 'Generate New'}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Current tracking number: {editingShipment.tracking_number}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sender_name">Sender Name</Label>
                  <Input
                    id="sender_name"
                    value={editingShipment.sender_name}
                    onChange={(e) => setEditingShipment({
                      ...editingShipment,
                      sender_name: e.target.value
                    })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receiver_name">Receiver Name</Label>
                  <Input
                    id="receiver_name"
                    value={editingShipment.receiver_name}
                    onChange={(e) => setEditingShipment({
                      ...editingShipment,
                      receiver_name: e.target.value
                    })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sender_email">Sender Email</Label>
                  <Input
                    id="sender_email"
                    type="email"
                    value={editingShipment.sender_email || ''}
                    onChange={(e) => setEditingShipment({
                      ...editingShipment,
                      sender_email: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="receiver_email">Receiver Email</Label>
                  <Input
                    id="receiver_email"
                    type="email"
                    value={editingShipment.receiver_email || ''}
                    onChange={(e) => setEditingShipment({
                      ...editingShipment,
                      receiver_email: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="package_description">Package Description</Label>
                  <Input
                    id="package_description"
                    value={editingShipment.package_description || ''}
                    onChange={(e) => setEditingShipment({
                      ...editingShipment,
                      package_description: e.target.value
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={editingShipment.weight || ''}
                    onChange={(e) => setEditingShipment({
                      ...editingShipment,
                      weight: parseFloat(e.target.value) || null
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={editingShipment.status || 'pending'}
                    onValueChange={(value) => setEditingShipment({
                      ...editingShipment,
                      status: value
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="in_transit">In Transit</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipping_fee">Shipping Fee</Label>
                  <Input
                    id="shipping_fee"
                    type="number"
                    step="0.01"
                    value={editingShipment.shipping_fee || ''}
                    onChange={(e) => setEditingShipment({
                      ...editingShipment,
                      shipping_fee: parseFloat(e.target.value) || null
                    })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Shipment</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the shipment
              and remove all associated tracking events from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteShipment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hidden print area for PDF */}
      <div className="sr-only print:block" aria-hidden>
        {selectedShipment && <ShipmentReceipt ref={receiptRef} shipment={selectedShipment} />}
      </div>

      {/* Detailed view */}
      {selectedShipment && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Shipment Details: {selectedShipment.tracking_number}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Sender Information</h3>
                <p><strong>Name:</strong> {selectedShipment.sender_name}</p>
                <p><strong>Email:</strong> {selectedShipment.sender_email}</p>
                <p><strong>Phone:</strong> {selectedShipment.sender_phone}</p>
                <p><strong>Address:</strong> {selectedShipment.sender_address}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Receiver Information</h3>
                <p><strong>Name:</strong> {selectedShipment.receiver_name}</p>
                <p><strong>Email:</strong> {selectedShipment.receiver_email}</p>
                <p><strong>Phone:</strong> {selectedShipment.receiver_phone}</p>
                <p><strong>Address:</strong> {selectedShipment.receiver_address}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Package Details</h3>
                <p><strong>Description:</strong> {selectedShipment.package_description}</p>
                <p><strong>Weight:</strong> {selectedShipment.weight} kg</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Shipping Information</h3>
                <p><strong>Status:</strong> 
                  <Badge variant={getStatusBadgeVariant(selectedShipment.status || 'pending')} className="ml-2">
                    {selectedShipment.status?.replace('_', ' ') || 'pending'}
                  </Badge>
                </p>
                <p><strong>Service Type:</strong> {selectedShipment.service_type}</p>
                <p><strong>Shipping Fee:</strong> ${selectedShipment.shipping_fee}</p>
                <p><strong>Insurance:</strong> ${selectedShipment.insurance_amount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}