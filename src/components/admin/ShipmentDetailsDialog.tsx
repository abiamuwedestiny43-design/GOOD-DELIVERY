import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shipment } from '@/types/shipment';
import { MapPin, Calendar, Package, User, DollarSign } from 'lucide-react';

interface ShipmentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shipment: Shipment | null;
}

export const ShipmentDetailsDialog = ({
  open,
  onOpenChange,
  shipment
}: ShipmentDetailsDialogProps) => {
  if (!shipment) return null;

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'secondary';
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Shipment Details: {shipment.tracking_number}</DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Sender Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Name:</strong> {shipment.sender_name}</p>
              <p><strong>Email:</strong> {shipment.sender_email || 'N/A'}</p>
              <p><strong>Phone:</strong> {shipment.sender_phone || 'N/A'}</p>
              <p><strong>Address:</strong> {shipment.sender_address}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Receiver Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Name:</strong> {shipment.receiver_name}</p>
              <p><strong>Email:</strong> {shipment.receiver_email || 'N/A'}</p>
              <p><strong>Phone:</strong> {shipment.receiver_phone || 'N/A'}</p>
              <p><strong>Address:</strong> {shipment.receiver_address}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Package Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Description:</strong> {shipment.package_description || 'N/A'}</p>
              <p><strong>Weight:</strong> {shipment.weight} kg</p>
              <p><strong>Value:</strong> ${shipment.package_value || 'N/A'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Shipping Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p><strong>Status:</strong> 
                <Badge variant={getStatusBadgeVariant(shipment.status || 'pending')} className="ml-2">
                  {shipment.status?.replace('_', ' ') || 'pending'}
                </Badge>
              </p>
              <p><strong>Current Location:</strong> {shipment.current_location || 'Not specified'}</p>
              <p><strong>Service Type:</strong> {shipment.service_type || 'N/A'}</p>
              <p><strong>Shipping Fee:</strong> ${shipment.shipping_fee || 'N/A'}</p>
              <p><strong>Insurance:</strong> ${shipment.insurance_amount || 'N/A'}</p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
