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
  Navigation,
  Info
} from "lucide-react";

interface Shipment {
  id: string;
  tracking_number: string;
  status: string;
  package_description: string;
  weight: number;
  sender_name: string;
  sender_address: string;
  receiver_name: string;
  receiver_address: string;
  shipping_instructions?: string; // Made optional
  current_location?: string; // Made optional
  estimated_delivery?: string; // Made optional
  // Additional properties that might exist in your database
  created_at?: string;
  created_by?: string;
  delivery_date?: string;
  dimensions?: string;
  fragile?: boolean;
  insurance?: boolean;
  insurance_amount?: number;
  pickup_date?: string;
  service_type?: string;
  special_handling?: string;
  priority?: string;
  cost?: number;
  payment_status?: string;
  payment_method?: string;
  tracking_url?: string;
  recipient_phone?: string;
  sender_phone?: string;
  delivery_instructions?: string;
  signature_required?: boolean;
  delivery_confirmation?: string;
  updated_at?: string;
}

interface TrackingEvent {
  id: string;
  status: string;
  description: string;
  location: string;
  created_at: string;
}

export const TrackParcel = () => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [events, setEvents] = useState<TrackingEvent[]>([]);
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
    if (!trackingNumber.trim()) {
      setError("Please enter a tracking number.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setShipment(null);
    setEvents([]);

    try {
      // Find shipment by tracking number
      const cleanTrackingNumber = trackingNumber.replace(/\s+/g, "").toUpperCase();
      const { data: shipmentData, error: shipmentError } = await supabase
        .from("shipments")
        .select("*")
        .eq("tracking_number", cleanTrackingNumber)
        .single();

      if (shipmentError) {
        console.error("Shipment query error:", shipmentError);
        setError("No shipment found for this tracking number.");
        return;
      }

      if (!shipmentData) {
        setError("No shipment found for this tracking number.");
        return;
      }

      setShipment(shipmentData);

      // Fetch tracking events
      const { data: eventsData, error: eventsError } = await supabase
        .from("tracking_events")
        .select("*")
        .eq("shipment_id", shipmentData.id)
        .order("created_at", { ascending: false }); // Show most recent first

      if (eventsError) {
        console.error("Error fetching tracking events:", eventsError);
        // Don't set error here, just log it - events are optional
      } else {
        setEvents(eventsData || []);
      }
    } catch (err: any) {
      console.error("Tracking error:", err);
      setError(err.message || "An error occurred while tracking your package.");
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

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "N/A";
    }
  };

  const formatStatus = (status: string) => {
    return status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
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
                  onChange={(e) => setTrackingNumber(e.target.value.replace(/\s+/g, ""))}
                  onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
                  className="h-12 text-lg border-2 border-blue-200 focus:border-blue-500"
                />
              </div>
              <Button
                onClick={handleTrack}
                disabled={loading || !trackingNumber.trim()}
                className="h-12 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white disabled:opacity-50"
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
                      <div className="absolute left-4 top-4 h-2/3 w-1 bg-blue-200 hidden md:block"></div>

                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
                        {statusStages.map((stage, index) => {
                          const isActive = index <= currentStatusIndex;
                          const isCurrent = index === currentStatusIndex;

                          return (
                            <div key={stage.status} className="flex items-center md:flex-col gap-3 md:gap-2 text-center flex-1">
                              <div className="relative">
                                <div
                                  className={`w-10 h-10 rounded-full flex items-center justify-center z-10 relative ${isActive ? stage.color : "bg-gray-300"
                                    }`}
                                >
                                  {isActive && <CheckCircle className="w-5 h-5 text-white" />}
                                </div>
                                {isCurrent && (
                                  <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="absolute inset-0 rounded-full border-2 border-blue-400"
                                  />
                                )}
                              </div>

                              <div>
                                <p
                                  className={`font-semibold text-sm md:text-base ${isActive ? "text-slate-900" : "text-gray-500"
                                    }`}
                                >
                                  {stage.label}
                                </p>
                                {isCurrent && (
                                  <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-blue-600 text-xs md:text-sm font-medium"
                                  >
                                    Current
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
                        <div className="flex justify-between items-start">
                          <span className="text-slate-600">Tracking Number:</span>
                          <span className="font-mono font-semibold text-right">{shipment.tracking_number}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Status:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(shipment.status)} text-white`}>
                            {formatStatus(shipment.status)}
                          </span>
                        </div>
                        <div className="flex justify-between items-start">
                          <span className="text-slate-600">Description:</span>
                          <span className="font-medium text-right max-w-[60%]">{shipment.package_description || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Weight:</span>
                          <span className="font-medium">{shipment.weight ? `${shipment.weight} kg` : "N/A"}</span>
                        </div>
                        {shipment.dimensions && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">Dimensions:</span>
                            <span className="font-medium">{shipment.dimensions}</span>
                          </div>
                        )}
                        {shipment.estimated_delivery && (
                          <div className="flex justify-between items-start">
                            <span className="text-slate-600">Est. Delivery:</span>
                            <span className="font-medium text-right">{formatDate(shipment.estimated_delivery)}</span>
                          </div>
                        )}
                        {shipment.service_type && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">Service Type:</span>
                            <span className="font-medium">{shipment.service_type}</span>
                          </div>
                        )}
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
                          {shipment.sender_phone && (
                            <p className="text-sm text-slate-500">{shipment.sender_phone}</p>
                          )}
                        </div>
                        <div>
                          <Label className="text-slate-600 text-sm">Receiver</Label>
                          <p className="font-medium">{shipment.receiver_name}</p>
                          <p className="text-sm text-slate-500">{shipment.receiver_address}</p>
                          {shipment.recipient_phone && (
                            <p className="text-sm text-slate-500">{shipment.recipient_phone}</p>
                          )}
                        </div>
                        {(shipment.shipping_instructions || shipment.delivery_instructions) && (
                          <div className="pt-2 border-t">
                            <Label className="text-slate-600 text-sm flex items-center gap-1">
                              <Info className="w-4 h-4" />
                              Special Instructions
                            </Label>
                            <p className="text-sm text-slate-700 mt-1 bg-yellow-50 p-2 rounded-md">
                              {shipment.shipping_instructions || shipment.delivery_instructions}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Current Location & Status */}
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-amber-50 rounded-t-lg">
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-amber-600" />
                        Current Location & Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <h4 className="font-medium text-slate-700">Current Location</h4>
                          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-md">
                            <MapPin className="w-5 h-5 text-blue-500" />
                            <span className="font-semibold">
                              {shipment.current_location || "Location information not available"}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium text-slate-700">Current Status</h4>
                          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-md">
                            {getStatusIcon(shipment.status)}
                            <span className="font-semibold">
                              {formatStatus(shipment.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tracking Events */}
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-purple-50 rounded-t-lg">
                      <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Clock className="w-5 h-5 text-purple-600" />
                        Tracking History
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Current shipment info as latest event */}
                        {shipment && (
                          <motion.div
                            key="current-status"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex gap-4 p-4 border rounded-lg bg-blue-50 shadow-sm"
                          >
                            <div className="flex-shrink-0">
                              {getStatusIcon(shipment.status)}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-semibold">
                                  {formatStatus(shipment.status)} (Current)
                                </span>
                                <span className="text-sm text-slate-500">
                                  {formatDate(shipment.updated_at || shipment.created_at)}
                                </span>
                              </div>
                              <p className="text-slate-700 mb-2">
                                Latest update: Package is currently <strong>{formatStatus(shipment.status).toLowerCase()}</strong>.
                              </p>
                              {shipment.current_location && (
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                  <MapPin className="w-4 h-4" />
                                  {shipment.current_location}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}

                        {/* Historical events */}
                        {events.length > 0 ? (
                          events.map((event, index) => (
                            <motion.div
                              key={event.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: (index + 1) * 0.1 }}
                              className="flex gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow"
                            >
                              <div className="flex-shrink-0">
                                {getStatusIcon(event.status)}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                  <span className="font-semibold">
                                    {formatStatus(event.status)}
                                  </span>
                                  <span className="text-sm text-slate-500">
                                    {formatDate(event.created_at)}
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
                          ))
                        ) : (
                          <div className="text-center py-8 text-slate-500">
                            <Clock className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                            <p>No additional tracking events available yet.</p>
                            <p className="text-sm mt-2">Check back later for more updates.</p>
                          </div>
                        )}
                      </div>
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
