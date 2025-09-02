import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Calendar, Clock, Package, Truck, CheckCircle, AlertCircle, Home } from 'lucide-react';

export type TrackingEvent = {
  id: string;
  shipment_id: string;
  status: string;
  location: string;
  description: string;
  created_at: string;
  previous_location?: string; // <-- make this optional
};

interface Shipment {
  id: string;
  tracking_number: string;
  sender_name: string;
  sender_email: string | null;
  sender_phone: string | null;
  sender_address: string;
  receiver_name: string;
  receiver_email: string | null;
  receiver_phone: string | null;
  receiver_address: string;
  package_description: string | null;
  package_value: number | null;
  weight: number | null;
  dimensions: string | null;
  quantity: number | null;
  fragile: boolean | null;
  service_type: string | null;
  shipping_fee: number | null;
  sending_date: string | null;
  delivery_date: string | null;
  status: string | null;
  current_location?: string;
  signature_required: boolean | null;
  insurance: boolean | null;
  insurance_amount: number | null;
  special_instructions: string | null;
  payment_method: string | null;
  payment_status: string | null;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export const UserTrackPage = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const statusOrder = [
    'pending',
    'processing',
    'in_transit',
    'out_for_delivery',
    'delivered',
    'cancelled',
    'on_hold'
  ];

  const statusIcons = {
    pending: <AlertCircle className="w-5 h-5 text-yellow-500" />,
    processing: <Package className="w-5 h-5 text-blue-500" />,
    in_transit: <Truck className="w-5 h-5 text-orange-500" />,
    out_for_delivery: <Truck className="w-5 h-5 text-purple-500" />,
    delivered: <CheckCircle className="w-5 h-5 text-green-500" />,
    cancelled: <AlertCircle className="w-5 h-5 text-red-500" />,
    on_hold: <AlertCircle className="w-5 h-5 text-red-500" />
  };

  const statusLabels = {
    pending: 'Pending',
    processing: 'Processing',
    in_transit: 'In Transit',
    out_for_delivery: 'Out for Delivery',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    on_hold: 'On Hold'
  };

  const getStatusIndex = (status: string | null) => {
    if (!status) return -1;
    return statusOrder.indexOf(status);
  };

const trackShipment = async () => {
  if (!trackingNumber.trim()) {
    toast({
      title: 'Error',
      description: 'Please enter a tracking number',
      variant: 'destructive',
    });
    return;
  }

  setLoading(true);
  try {
    // Fetch shipment details safely
    const { data: shipmentData, error: shipmentError } = await supabase
      .from('shipments')
      .select('*')
      .eq('tracking_number', trackingNumber.trim())
      .maybeSingle(); // ✅ safer than .single()

    if (shipmentError || !shipmentData) {
      throw new Error('Shipment not found');
    }

    setShipment(shipmentData);

    // Fetch tracking events
    const { data: eventsData, error: eventsError } = await supabase
      .from('tracking_events')
      .select('*')
      .eq('shipment_id', shipmentData.id)
      .order('created_at', { ascending: true });

    if (eventsError) {
      throw new Error('Failed to fetch tracking events');
    }

    setTrackingEvents(eventsData || []);

    toast({
      title: 'Shipment found',
      description: 'Tracking information loaded successfully',
    });

  } catch (error: any) {
    console.error('Tracking error:', error);
    toast({
      title: 'Error',
      description: error.message || 'Failed to track shipment',
      variant: 'destructive',
    });
    setShipment(null);
    setTrackingEvents([]);
  } finally {
    setLoading(false);
  }
};

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-green-600 mb-2">Track Your Shipment</h1>
        <p className="text-gray-600">Enter your tracking number to get real-time updates</p>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Enter tracking number (e.g., SL20240101XXXX)"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && trackShipment()}
              className="flex-1"
            />
            <Button 
              onClick={trackShipment} 
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Tracking...' : 'Track Shipment'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {shipment && (
        <div className="space-y-6">
          {/* Shipment Overview */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
              <CardTitle>Shipment Overview</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Tracking Number</p>
                  <p className="font-semibold">{shipment.tracking_number}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Current Status</p>
                  <div className="flex items-center gap-2">
                    {shipment.status && statusIcons[shipment.status as keyof typeof statusIcons]}
                    <span className="font-semibold capitalize">
                      {shipment.status ? statusLabels[shipment.status as keyof typeof statusLabels] : 'Unknown'}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Current Location</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span className="font-semibold">{shipment.current_location || 'Unknown'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Service Type</p>
                  <p className="font-semibold capitalize">{shipment.service_type || 'Standard'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Status</CardTitle>
              <CardDescription>Current progress of your shipment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                
                <div className="space-y-8">
                  {statusOrder.map((status, index) => {
                    const currentIndex = getStatusIndex(shipment.status);
                    const isCompleted = currentIndex !== -1 && index < currentIndex;
                    const isCurrent = index === currentIndex;
                    const isFuture = currentIndex === -1 || index > currentIndex;
                    
                    return (
                      <div key={status} className="relative flex items-start gap-4">
                        {/* Status Indicator */}
                        <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-green-500' : 
                          isCurrent ? 'bg-blue-500 animate-pulse' : 
                          'bg-gray-300'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-white" />
                          ) : isCurrent ? (
                            <div className="w-3 h-3 bg-white rounded-full" />
                          ) : (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>

                        {/* Status Content */}
                        <div className={`flex-1 pt-1 ${
                          isFuture ? 'text-gray-400' : 'text-gray-900'
                        }`}>
                          <h3 className="font-semibold capitalize">
                            {statusLabels[status as keyof typeof statusLabels]}
                          </h3>
                          {isCurrent && shipment.current_location && (
                            <p className="text-sm text-gray-600 mt-1">
                              Current location: {shipment.current_location}
                            </p>
                          )}
                          {isCompleted && trackingEvents.find(event => event.status === status) && (
                            <p className="text-sm text-gray-600 mt-1">
                              Completed on {formatDate(trackingEvents.find(event => event.status === status)!.created_at)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracking History */}
          <Card>
            <CardHeader>
              <CardTitle>Tracking History</CardTitle>
              <CardDescription>Detailed timeline of your shipment's journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {trackingEvents.length > 0 ? (
                  trackingEvents.map((event, index) => (
                    <div key={event.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${
                          index === trackingEvents.length - 1 ? 'bg-green-500' : 'bg-blue-500'
                        }`} />
                        {index < trackingEvents.length - 1 && (
                          <div className="w-0.5 h-16 bg-gray-200 mt-1" />
                        )}
                      </div>
                      
                      <div className="flex-1 pb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <h3 className="font-semibold capitalize">
                            {statusLabels[event.status as keyof typeof statusLabels] || event.status}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(event.created_at)}</span>
                            <Clock className="w-4 h-4 ml-2" />
                            <span>{formatTime(event.created_at)}</span>
                          </div>
                        </div>
                        
                        <div className="mt-2 space-y-2">
                          {event.location && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-red-500" />
                              <span>Location: {event.location}</span>
                            </div>
                          )}
                          
                          {event.previous_location && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Home className="w-4 h-4" />
                              <span>Previous: {event.previous_location}</span>
                            </div>
                          )}
                          
                          {event.description && (
                            <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No tracking events found</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Shipment Details */}
          <Card>
            <CardHeader>
              <CardTitle>Shipment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Sender Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Name:</span> {shipment.sender_name}</p>
                    {shipment.sender_email && (
                      <p><span className="text-gray-500">Email:</span> {shipment.sender_email}</p>
                    )}
                    {shipment.sender_phone && (
                      <p><span className="text-gray-500">Phone:</span> {shipment.sender_phone}</p>
                    )}
                    <p><span className="text-gray-500">Address:</span> {shipment.sender_address}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Receiver Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Name:</span> {shipment.receiver_name}</p>
                    {shipment.receiver_email && (
                      <p><span className="text-gray-500">Email:</span> {shipment.receiver_email}</p>
                    )}
                    {shipment.receiver_phone && (
                      <p><span className="text-gray-500">Phone:</span> {shipment.receiver_phone}</p>
                    )}
                    <p><span className="text-gray-500">Address:</span> {shipment.receiver_address}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Package Details</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Description:</span> {shipment.package_description || 'N/A'}</p>
                    <p><span className="text-gray-500">Weight:</span> {shipment.weight ? `${shipment.weight} kg` : 'N/A'}</p>
                    <p><span className="text-gray-500">Dimensions:</span> {shipment.dimensions || 'N/A'}</p>
                    <p><span className="text-gray-500">Quantity:</span> {shipment.quantity || '1'}</p>
                    <p><span className="text-gray-500">Value:</span> {shipment.package_value ? `$${shipment.package_value}` : 'N/A'}</p>
                    <p><span className="text-gray-500">Fragile:</span> {shipment.fragile ? 'Yes' : 'No'}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Shipping Information</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-500">Service Type:</span> {shipment.service_type || 'Standard'}</p>
                    <p><span className="text-gray-500">Shipping Fee:</span> {shipment.shipping_fee ? `$${shipment.shipping_fee.toFixed(2)}` : 'N/A'}</p>
                    <p><span className="text-gray-500">Sending Date:</span> {formatDate(shipment.sending_date)}</p>
                    <p><span className="text-gray-500">Estimated Delivery:</span> {formatDate(shipment.delivery_date)}</p>
                    <p><span className="text-gray-500">Signature Required:</span> {shipment.signature_required ? 'Yes' : 'No'}</p>
                    <p><span className="text-gray-500">Insurance:</span> {shipment.insurance ? `$${shipment.insurance_amount?.toFixed(2)}` : 'No'}</p>
                  </div>
                </div>
              </div>
              
              {shipment.special_instructions && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Special Instructions</h3>
                  <p className="text-blue-600">{shipment.special_instructions}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
