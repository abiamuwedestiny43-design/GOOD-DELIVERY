import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export const TrackParcel = () => {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [shipment, setShipment] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="w-full max-w-3xl mx-auto mt-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            Track Your Parcel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Enter Tracking Number"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
            <Button onClick={handleTrack} disabled={loading}>
              {loading ? "Tracking..." : "Track"}
            </Button>
          </div>

          {error && <p className="text-red-500">{error}</p>}

          {shipment && (
            <div className="space-y-4">
              <div className="p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
                <h3 className="font-medium text-lg">Shipment Details</h3>
                <p><b>Tracking Number:</b> {shipment.tracking_number}</p>
                <p><b>Status:</b> {shipment.status}</p>
                <p><b>Sender:</b> {shipment.sender_name} ({shipment.sender_address})</p>
                <p><b>Receiver:</b> {shipment.receiver_name} ({shipment.receiver_address})</p>
                <p><b>Package:</b> {shipment.package_description || "N/A"}</p>
                <p><b>Weight:</b> {shipment.weight ? `${shipment.weight} kg` : "N/A"}</p>
              </div>

              <div>
                <h3 className="font-medium text-lg mb-2">Tracking Events</h3>
                {events.length === 0 ? (
                  <p>No events yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {events.map((event) => (
                      <li key={event.id} className="p-3 border rounded-md bg-white dark:bg-gray-900">
                        <p><b>Status:</b> {event.status}</p>
                        <p><b>Location:</b> {event.location || "Unknown"}</p>
                        <p><b>Description:</b> {event.description}</p>
                        <p className="text-sm text-gray-500">{new Date(event.created_at).toLocaleString()}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
