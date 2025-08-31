import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  Truck, 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Search,
  User,
  Calendar,
  Navigation
} from "lucide-react";

export const TrackParcel = () => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [shipment, setShipment] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);

  const statusStages = [
    { status: 'pending', label: 'Pending', color: 'bg-yellow-500' },
    { status: 'processing', label: 'Processing', color: 'bg-blue-500' },
    { status: 'in_transit', label: 'In Transit', color: 'bg-indigo-500' },
    { status: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-purple-500' },
    { status: 'delivered', label: 'Delivered', color: 'bg-green-500' },
    { status: 'cancelled', label: 'Cancelled', color: 'bg-red-500' }
  ];

  useEffect(() => {
    if (shipment?.status) {
      const statusIndex = statusStages.findIndex(stage => stage.status === shipment.status);
      if (statusIndex !== -1) {
        setCurrentStatusIndex(statusIndex);
      }
    }
  }, [shipment]);

  const handleTrack = async () => {
    if (!trackingNumber) return;
    setLoading(true);
    setError(null);
    setShipment(null);
    setEvents([]);

    try {
      // Find shipment by tracking number
      const { data: shipmentData, error: shipmentError } = await supabase
        .from("shipments")
        .select("*")
        .eq("tracking_number", trackingNumber)
        .single();

      if (shipmentError || !shipmentData) {
        setError("No shipment found for this tracking number.");
        return;
      }

      setShipment(shipmentData);

      // Fetch tracking events
      const { data: eventsData, error: eventsError } = await supabase
        .from("tracking_events")
        .select("*")
        .eq("shipment_id", shipmentData.id)
        .order("created_at", { ascending: true });

      if (eventsError) {
        console.error("Error fetching tracking events:", eventsError);
      } else {
        setEvents(eventsData || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'in_transit':
        return <Truck className="w-5 h-5 text-blue-500" />;
      case 'out_for_delivery':
        return <Navigation className="w-5 h-5 text-purple-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    const stage = statusStages.find(s => s.status === status);
    return stage ? stage.color : 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="w-full max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Track Your Package</h1>
          <p className="text-lg text-slate-600">Enter your tracking number to get real-time updates</p>
        </motion.div>

        <Card className="shadow-2xl border-0">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-semibold flex items-center gap-2">
              <Search className="w-6 h-6" />
              Package Tracking
            </CardTitle>
            <CardDescription className="text-blue-100">
              Enter your tracking number below
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Enter Tracking Number (e.g., SL202412310001)"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
                  className="h-12 text-lg border-2 border-blue-200 focus:border-blue-500"
                />
              </div>
              <Button 
                onClick={handleTrack} 
                disabled={loading}
                className="h-12 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Tracking...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Track Package
                  </div>
                )}
              </Button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
                >
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertCircle className="w-5 h-5" />
                    <p className="font-medium">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {shipment && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  {/* Status Timeline */}
                  <div className="bg-white rounded-2xl p-6 shadow-lg border">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      Delivery Status
                    </h3>
                    
                    <div className="relative">
                      {/* Progress Line */}
                      <div className="absolute left-4 top-4 h-2/3 w-1 bg-blue-200"></div>
                      
                      <div className="space-y-4">
                        {statusStages.map((stage, index) => {
                          const isActive = index <= currentStatusIndex;
                          const isCurrent = index === currentStatusIndex;
                          
                          return (
                            <div key={stage.status} className="flex items-start gap-4">
                              <div className="relative">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 relative ${
                                  isActive ? stage.color : 'bg-gray-300'
                                }`}>
                                  {isActive && (
                                    <CheckCircle className="w-5 h-5 text-white" />
                                  )}
                                </div>
                                {isCurrent && (
                                  <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="absolute inset-0 rounded-full border-2 border-blue-400"
                                  />
                                )}
                              </div>
                              
                              <div className="flex-1 pt-1">
                                <p className={`font-semibold ${
                                  isActive ? 'text-slate-900' : 'text-gray-500'
                                }`}>
                                  {stage.label}
                                </p>
                                {isCurrent && (
                                  <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-blue-600 text-sm font-medium"
                                  >
                                    Current Status
                                  </motion.p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Shipment Details */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="border-0 shadow-lg">
                      <CardHeader className="bg-blue-50 rounded-t-lg">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                          <Package className="w-5 h-5 text-blue-600" />
                          Package Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Tracking Number:</span>
                          <span className="font-mono font-semibold">{shipment.tracking_number}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Status:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shipment.status)} text-white`}>
                            {shipment.status?.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Description:</span>
                          <span className="font-medium">{shipment.package_description || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Weight:</span>
                          <span className="font-medium">{shipment.weight ? `${shipment.weight} kg` : "N/A"}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg">
                      <CardHeader className="bg-green-50 rounded-t-lg">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                          <User className="w-5 h-5 text-green-600" />
                          Delivery Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 space-y-4">
                        <div>
                          <Label className="text-slate-600 text-sm">Sender</Label>
                          <p className="font-medium">{shipment.sender_name}</p>
                          <p className="text-sm text-slate-500">{shipment.sender_address}</p>
                        </div>
                        <div>
                          <Label className="text-slate-600 text-sm">Receiver</Label>
                          <p className="font-medium">{shipment.receiver_name}</p>
                          <p className="text-sm text-slate-500">{shipment.receiver_address}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Tracking Events */}
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-purple-50 rounded-t-lg">
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-purple-600" />
                        Tracking History
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      {events.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                          <Clock className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                          <p>No tracking events yet. Check back later for updates.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {events.map((event, index) => (
                            <motion.div
                              key={event.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
                            >
                              <div className="flex-shrink-0">
                                {getStatusIcon(event.status)}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="font-semibold capitalize">
                                    {event.status.replace('_', ' ')}
                                  </span>
                                  <span className="text-sm text-slate-500">
                                    {new Date(event.created_at).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-slate-700 mb-2">{event.description}</p>
                                {event.location && (
                                  <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <MapPin className="w-4 h-4" />
                                    {event.location}
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
