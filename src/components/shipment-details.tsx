import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search, Filter, Eye, Download } from 'lucide-react';
import { Shipment, ShipmentReceipt } from '@/components/ShipmentReceipt';
import { downloadNodeAsPDF } from '@/lib/pdf';
import { useRef } from 'react';

export default function ShipmentDetails() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
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

      setShipments(data || []);
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

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = 
      shipment.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.receiver_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.sender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.receiver_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shipment.sender_email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'success';
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
    // Wait for the next render to ensure the receipt is rendered
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
        <CardHeader>
          <CardTitle>Tracked Shipments</CardTitle>
          <CardDescription>
            View and manage all shipments in the system. Total: {shipments.length} shipments
          </CardDescription>
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
                  <TableHead>Actions</TableHead>
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
                        {new Date(shipment.created_at || '').toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(shipment)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadReceipt(shipment)}
                          >
                            <Download className="h-4 w-4" />
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

      {/* Hidden print area for PDF */}
      <div className="sr-only print:block" aria-hidden>
        {selectedShipment && <ShipmentReceipt ref={receiptRef} shipment={selectedShipment} />}
      </div>

      {/* Modal for detailed view would go here */}
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
                <p><strong>Dimensions:</strong> {selectedShipment.dimensions}</p>
                <p><strong>Value:</strong> ${selectedShipment.package_value}</p>
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