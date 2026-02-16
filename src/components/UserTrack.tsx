import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  weight: number | null;
  quantity: number | null;
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
    processing: <Package className="w-5 h-5 text-emerald-500" />,
    in_transit: <Truck className="w-5 h-5 text-emerald-500" />,
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

    } catch (err: unknown) {
      console.error('Tracking error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to track shipment';
      toast({
        title: 'Error',
        description: errorMessage,
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
    // Extract just the date part to avoid timezone issues
    const dateOnly = dateString.split('T')[0];
    const [year, month, day] = dateOnly.split('-');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] relative overflow-hidden pt-20">
      {/* Subtle Pearlescent Background Detail */}
      <div className="absolute inset-0 bg-grid-slate-200/40 [mask-image:linear-gradient(to_bottom,white,transparent)]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100/30 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-50/20 blur-[120px] rounded-full" />

      <div className="relative z-10 container mx-auto py-12 px-4 max-w-4xl">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
          >
            Live Logistics Network
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight"
          >
            Global <span className="text-emerald-600">Tracking</span>
          </motion.h1>
          <p className="text-slate-500 text-lg font-medium">Precision monitoring for your global shipments</p>
        </div>

        <Card className="mb-12 border-0 bg-white shadow-2xl shadow-emerald-950/5 rounded-[2rem] overflow-hidden">
          <CardContent className="p-8 md:p-10">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Input
                  placeholder="Enter tracking number (e.g., GOOD-XXXX-XXXX)"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && trackShipment()}
                  className="bg-slate-50 border-slate-100 text-slate-900 placeholder:text-slate-400 h-16 pl-6 text-lg focus:ring-emerald-500 rounded-2xl shadow-inner font-medium"
                />
              </div>
              <Button
                onClick={trackShipment}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white h-16 px-10 text-lg font-bold rounded-2xl transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    Locating...
                  </div>
                ) : 'Track Package'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {shipment && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Shipment Overview */}
            <Card className="border-0 bg-white shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-600" />
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                <CardTitle className="text-slate-900 flex items-center justify-between text-xl font-bold">
                  <span>Shipment Status</span>
                  <div className="px-3 py-1 bg-white border border-slate-200 rounded-lg shadow-sm text-sm font-mono text-emerald-600">
                    {shipment.tracking_number}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Current Phase</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                        {shipment.status && statusIcons[shipment.status as keyof typeof statusIcons]}
                      </div>
                      <span className="font-bold text-slate-900 text-lg capitalize">
                        {shipment.status ? statusLabels[shipment.status as keyof typeof statusLabels] : 'Unknown'}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Location</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-slate-900 text-lg">{shipment.current_location || 'Transit Hub'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Service Level</p>
                    <div className="flex items-center gap-3 h-10">
                      <span className="font-bold text-slate-900 text-lg capitalize">{shipment.service_type || 'Standard'}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Expected Arrival</p>
                    <div className="flex items-center gap-3 h-10 font-bold text-emerald-600 text-lg">
                      {formatDate(shipment.delivery_date)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Timeline */}
            <Card className="border-0 bg-white shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                <CardTitle className="text-slate-900 text-xl font-bold">Delivery Progress</CardTitle>
                <CardDescription className="text-slate-500 font-medium">Stage-by-stage logistics transparency</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-100" />

                  <div className="space-y-10">
                    {statusOrder.map((status, index) => {
                      const currentIndex = getStatusIndex(shipment.status);
                      const isCompleted = currentIndex !== -1 && index < currentIndex;
                      const isCurrent = index === currentIndex;
                      const isFuture = currentIndex === -1 || index > currentIndex;

                      return (
                        <div key={status} className="relative flex items-start gap-6 group">
                          {/* Status Indicator */}
                          <div className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg ${isCompleted ? 'bg-emerald-500 shadow-emerald-500/20' :
                            isCurrent ? 'bg-emerald-500 animate-pulse shadow-emerald-500/30' :
                              'bg-slate-100'
                            }`}>
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-white" />
                            ) : isCurrent ? (
                              <div className="w-3 h-3 bg-white rounded-full" />
                            ) : (
                              <div className="w-2 h-2 bg-slate-300 rounded-full" />
                            )}
                          </div>

                          {/* Status Content */}
                          <div className={`flex-1 pt-0.5 ${isFuture ? 'text-slate-400' : 'text-slate-900'
                            }`}>
                            <h3 className={`font-bold text-lg group-hover:text-emerald-600 transition-colors ${isCurrent ? 'text-emerald-600' : ''}`}>
                              {statusLabels[status as keyof typeof statusLabels]}
                            </h3>
                            {isCurrent && shipment.current_location && (
                              <p className="text-sm text-slate-500 mt-1 flex items-center gap-1 font-medium">
                                <MapPin className="w-3 h-3 text-emerald-600" /> {shipment.current_location}
                              </p>
                            )}
                            {isCompleted && trackingEvents.find(event => event.status === status) && (
                              <p className="text-xs text-slate-400 mt-1 font-medium">
                                Verified on {formatDate(trackingEvents.find(event => event.status === status)!.created_at)}
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
            <Card className="border-0 bg-white shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                <CardTitle className="text-slate-900 text-xl font-bold">Activity Log</CardTitle>
                <CardDescription className="text-slate-500 font-medium">Chronological record of all logistical events</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-8">
                  {trackingEvents.length > 0 ? (
                    [...trackingEvents].reverse().map((event, index) => (
                      <div key={event.id} className="flex gap-6 group">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full transition-colors ${index === 0 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]' : 'bg-emerald-200'
                            }`} />
                          {index < trackingEvents.length - 1 && (
                            <div className="w-0.5 h-full bg-slate-50 mt-2" />
                          )}
                        </div>

                        <div className="flex-1 pb-8">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <h3 className="font-bold text-slate-900 text-lg">
                              {statusLabels[event.status as keyof typeof statusLabels] || event.status}
                            </h3>
                            <div className="flex items-center gap-3 text-xs font-mono">
                              <span className="bg-slate-50 text-slate-600 px-3 py-1 rounded-full border border-slate-100 font-bold">{formatDate(event.created_at)}</span>
                              <span className="bg-white text-emerald-600 px-3 py-1 rounded-full border border-emerald-100 font-black">{formatTime(event.created_at)}</span>
                            </div>
                          </div>

                          <div className="mt-4 space-y-4">
                            {event.location && (
                              <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                  <MapPin className="w-4 h-4 text-emerald-600" />
                                </div>
                                <span>Facility: {event.location}</span>
                              </div>
                            )}

                            {event.description && (
                              <p className="text-sm text-slate-500 leading-relaxed font-medium bg-slate-50/50 p-4 rounded-2xl border border-slate-50 italic">
                                "{event.description}"
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-16 px-4 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">
                      <Package className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400 font-bold">No logistical events recorded yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Shipment Details */}
            <Card className="border-0 bg-white shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-6">
                <CardTitle className="text-slate-900 text-xl font-bold">Manifest Details</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  <div className="p-10 border-b md:border-b-0 md:border-r border-slate-100">
                    <h3 className="text-emerald-600 font-black uppercase tracking-[0.2em] text-[10px] mb-8">Sender Details</h3>
                    <div className="space-y-6 text-sm">
                      <div className="flex flex-col gap-1 border-b border-slate-50 pb-4">
                        <span className="text-slate-400 font-bold text-[10px] uppercase">Full Name</span>
                        <span className="text-slate-900 font-bold text-base">{shipment.sender_name}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-400 font-bold text-[10px] uppercase">Point of Origin</span>
                        <span className="text-slate-700 font-medium text-sm leading-relaxed">{shipment.sender_address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-10">
                    <h3 className="text-emerald-600 font-black uppercase tracking-[0.2em] text-[10px] mb-8">Receiver Details</h3>
                    <div className="space-y-6 text-sm">
                      <div className="flex flex-col gap-1 border-b border-slate-50 pb-4">
                        <span className="text-slate-400 font-bold text-[10px] uppercase">Full Name</span>
                        <span className="text-slate-900 font-bold text-base">{shipment.receiver_name}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-slate-400 font-bold text-[10px] uppercase">Final Destination</span>
                        <span className="text-slate-700 font-medium text-sm leading-relaxed">{shipment.receiver_address}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-10 bg-slate-50/50 border-t border-slate-100">
                  <h3 className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] mb-8 text-center">Package Properties</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                    <div className="text-center space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Weight</p>
                      <p className="text-slate-900 font-black text-xl">{shipment.weight ? `${shipment.weight} kg` : 'N/A'}</p>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quantity</p>
                      <p className="text-slate-900 font-black text-xl">{shipment.quantity || '1'}</p>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Class</p>
                      <p className="text-slate-900 font-black text-xl capitalize">{shipment.service_type || 'Express'}</p>
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Coverage</p>
                      <p className="text-emerald-600 font-black text-xl">{shipment.insurance ? 'Active' : 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {shipment.special_instructions && (
                  <div className="p-8 bg-emerald-50/50 m-6 rounded-3xl border border-emerald-100">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="text-emerald-600 text-xs font-black uppercase tracking-widest mb-2">Internal Logistics Note</h4>
                        <p className="text-slate-600 text-sm font-medium italic leading-relaxed">"{shipment.special_instructions}"</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
