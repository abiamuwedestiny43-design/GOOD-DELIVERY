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
  status: string | null;
  location: string | null;
  description: string | null;
  created_at: string | null;
  previous_location?: string | null; // <-- make this optional
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
  current_location?: string | null;
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
    processing: 'Dispatched',
    in_transit: 'In Transit',
    out_for_delivery: 'Arrived',
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
    // Fetch shipment
    const { data: shipmentData, error: shipmentError } = await supabase
      .from('shipments')
      .select('*')
      .eq('tracking_number', trackingNumber.trim())
      .single();

    if (shipmentError) {
      console.error('Error fetching shipment:', shipmentError);
      throw new Error('Shipment not found. Please check the tracking number.');
    }

    if (!shipmentData) {
      throw new Error('No shipment found with this tracking number.');
    }

    // Fetch tracking events
    const { data: eventsData, error: eventsError } = await supabase
      .from('tracking_events')
      .select('*')
      .eq('shipment_id', shipmentData.id)
      .order('created_at', { ascending: true });

    if (eventsError) {
      console.error('Error fetching tracking events:', eventsError);
      throw new Error('Failed to fetch tracking events');
    }

    // ✅ Transform tracking events into your strict TrackingEvent type
    const transformedEvents: TrackingEvent[] = (eventsData || []).map(ev => ({
      id: ev.id,
      shipment_id: ev.shipment_id,
      status: ev.status,
      location: ev.location,
      description: ev.description,
      created_at: ev.created_at,
      previous_location: ev.previous_location ?? '', // normalize optional field
    }));

    setShipment(shipmentData);
    setTrackingEvents(transformedEvents);

    toast({
      title: 'Shipment found',
      description: 'Tracking information loaded successfully',
    });

  } catch (err: any) {
    console.error('Tracking error:', err);
    toast({
      title: 'Error',
      description: err.message || 'Failed to track shipment',
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

         {/* WhatsApp Chat Button */ }
  <a
    href="https://wa.me/+447386762901"
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg flex items-center justify-center transition-colors z-50"
  >
    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.52 3.48A11.78 11.78 0 0 0 12 0C5.37 0 0 5.37 0 12a11.9 11.9 0 0 0 1.64 6L0 24l6.26-1.64A11.9 11.9 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.17-1.23-6.17-3.48-8.52zM12 22c-1.91 0-3.73-.52-5.33-1.5l-.38-.23-3.73.98 1-3.64-.24-.38A10.05 10.05 0 0 1 2 12c0-5.52 4.48-10 10-10 2.67 0 5.18 1.04 7.07 2.93A9.94 9.94 0 0 1 22 12c0 5.52-4.48 10-10 10zm5.2-7.67c-.28-.14-1.65-.82-1.9-.91s-.44-.14-.62.14-.71.91-.87 1.1-.32.21-.6.07c-.28-.14-1.18-.43-2.25-1.38-.83-.74-1.39-1.65-1.55-1.93s-.02-.43.12-.57c.12-.12.28-.32.42-.49.14-.16.19-.28.28-.47.09-.18.05-.35-.02-.49-.07-.14-.62-1.48-.85-2.02-.22-.53-.45-.46-.62-.47h-.53c-.18 0-.49.07-.74.35s-.97.95-.97 2.31 1 .36 1.14.53c.14.18 1.34 2.06 3.25 2.89 1.91.83 1.91.55 2.25.52.35-.03 1.15-.47 1.31-.92.16-.46.16-.85.12-.92-.05-.07-.21-.14-.49-.28z" />
    </svg>
  </a>
    </div>
  );
};
