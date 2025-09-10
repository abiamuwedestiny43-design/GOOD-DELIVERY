import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Eye, Download, Edit, Trash2 } from 'lucide-react';
import { Shipment } from '@/types/shipment';

interface ShipmentListProps {
  shipments: Shipment[];
  loading: boolean;
  searchTerm: string;
  statusFilter: string;
  onSearchChange: (term: string) => void;
  onStatusFilterChange: (status: string) => void;
  onViewDetails: (shipment: Shipment) => void;
  onDownloadReceipt: (shipment: Shipment) => void;
  onEditShipment: (shipment: Shipment) => void;
  onDeleteShipment: (shipmentId: string) => void;
}

export const ShipmentList = ({
  shipments,
  loading,
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusFilterChange,
  onViewDetails,
  onDownloadReceipt,
  onEditShipment,
  onDeleteShipment
}: ShipmentListProps) => {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'secondary';
      case 'in_transit':
        return 'secondary';
      case 'processing':
        return 'default';
      case 'out_for_delivery':
        return 'default';
      case 'pending':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by tracking number, name, or email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
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
              <TableHead className="w-[150px]">Actions</TableHead>
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
                      {shipment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {shipment.current_location || 'Not specified'}
                  </TableCell>
                  <TableCell>
                    {new Date(shipment.created_at || '').toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(shipment)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDownloadReceipt(shipment)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditShipment(shipment)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteShipment(shipment.id)}
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
    </div>
  );
};
