import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shipment, TrackingEvent, LocationHistory } from '@/types/shipment';

interface ShipmentDetailsProps {
  shipment: Shipment;
  events: TrackingEvent[];
}

export const ShipmentDetails = ({ shipment, events }: ShipmentDetailsProps) => {
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

  const getLocationHistory = (events: TrackingEvent[]): LocationHistory[] => {
    const locationChanges: LocationHistory[] = [];
    
    for (let i = 1; i < events.length; i++) {
      const currentEvent = events[i];
      const previousEvent = events[i - 1];
      
      if (currentEvent.location && previousEvent.location && currentEvent.location !== previousEvent.location) {
        locationChanges.push({
          from: previousEvent.location,
          to: currentEvent.location,
          timestamp: currentEvent.created_at || '',
          formattedDate: new Date(currentEvent.created_at || '').toLocaleString()
        });
      }
    }
    
    return locationChanges;
  };

  const locationHistory = getLocationHistory(events);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Shipment Details: {shipment.tracking_number}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Sender Information</h3>
              <p><strong>Name:</strong> {shipment.sender_name}</p>
              <p><strong>Email:</strong> {shipment.sender_email}</p>
              <p><strong>Phone:</strong> {shipment.sender_phone}</p>
              <p><strong>Address:</strong> {shipment.sender_address}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Receiver Information</h3>
              <p><strong>Name:</strong> {shipment.receiver_name}</p>
              <p><strong>Email:</strong> {shipment.receiver_email}</p>
              <p><strong>Phone:</strong> {shipment.receiver_phone}</p>
              <p><strong>Address:</strong> {shipment.receiver_address}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Package Details</h3>
              <p><strong>Description:</strong> {shipment.package_description}</p>
              <p><strong>Weight:</strong> {shipment.weight} kg</p>
              <p><strong>Value:</strong> ${shipment.package_value}</p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Shipping Information</h3>
              <p><strong>Status:</strong> 
                <Badge variant={getStatusBadgeVariant(shipment.status || 'pending')} className="ml-2">
                  {shipment.status?.replace('_', ' ') || 'pending'}
                </Badge>
              </p>
              <p><strong>Current Location:</strong> {shipment.current_location || 'Not specified'}</p>
              <p><strong>Service Type:</strong> {shipment.service_type}</p>
              <p><strong>Shipping Fee:</strong> ${shipment.shipping_fee}</p>
              <p><strong>Insurance:</strong> ${shipment.insurance_amount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location History */}
      {locationHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Location History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {locationHistory.map((history, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {history.from}
                    </div>
                    <div className="text-blue-500">→</div>
                    <div className="text-sm font-medium bg-green-100 text-green-800 px-2 py-1 rounded">
                      {history.to}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {history.formattedDate}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tracking Events */}
      <Card>
        <CardHeader>
          <CardTitle>Tracking Events</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-muted-foreground">No tracking events yet.</p>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold capitalize">
                      {event.status.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(event.created_at || '').toLocaleString()}
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-2">{event.description}</p>
                  {event.location && (
                    <p className="text-sm text-blue-600">
                      <strong>Location:</strong> {event.location}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
