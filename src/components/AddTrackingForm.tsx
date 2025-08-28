import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const AddTrackingForm = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    senderName: "",
    senderPhone: "",
    senderAddress: "",
    receiverName: "",
    receiverPhone: "",
    receiverAddress: "",
    packageDescription: "",
    weight: "",
    status: "pending"
  });
  
  const { toast } = useToast();
  const { user } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to create a shipment",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!formData.senderName || !formData.senderAddress || 
        !formData.receiverName || !formData.receiverAddress) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Generate tracking number
      const { data: trackingData, error: trackingError } = await supabase
        .rpc('generate_tracking_number');

      if (trackingError) {
        console.error('Error generating tracking number:', trackingError);
        throw new Error(`Failed to generate tracking number: ${trackingError.message}`);
      }

      // Create shipment
      const { data: shipment, error: shipmentError } = await supabase
        .from('shipments')
        .insert({
          tracking_number: trackingData,
          sender_name: formData.senderName,
          sender_phone: formData.senderPhone,
          sender_address: formData.senderAddress,
          receiver_name: formData.receiverName,
          receiver_phone: formData.receiverPhone,
          receiver_address: formData.receiverAddress,
          package_description: formData.packageDescription,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          status: formData.status,
          created_by: user.id
        })
        .select()
        .single();

      if (shipmentError) {
        console.error('Shipment creation error:', shipmentError);
        
        // Check if it's an RLS error
        if (shipmentError.code === '42501') {
          throw new Error("Permission denied. Please check your Row Level Security policies.");
        }
        
        throw new Error(`Failed to create shipment: ${shipmentError.message}`);
      }

      // Create initial tracking event
      const { error: eventError } = await supabase
        .from('tracking_events')
        .insert({
          shipment_id: shipment.id,
          status: formData.status,
          description: `Package ${formData.status}`,
          location: formData.senderAddress
        });

      if (eventError) {
        console.error('Tracking event creation error:', eventError);
        // We don't throw here as the shipment was created successfully
        // We can still show success but log the tracking event issue
      }

      toast({
        title: "Shipment created successfully",
        description: `Tracking number: ${trackingData}`,
      });

      // Reset form
      setFormData({
        senderName: "",
        senderPhone: "",
        senderAddress: "",
        receiverName: "",
        receiverPhone: "",
        receiverAddress: "",
        packageDescription: "",
        weight: "",
        status: "pending"
      });

    } catch (error: any) {
      console.error('Error creating shipment:', error);
      toast({
        title: "Error creating shipment",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">Add New Tracking</CardTitle>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sender Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Sender Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="senderName">Sender Name *</Label>
                <Input
                  id="senderName"
                  value={formData.senderName}
                  onChange={(e) => handleInputChange("senderName", e.target.value)}
                  placeholder="Enter sender name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="senderPhone">Sender Phone</Label>
                <Input
                  id="senderPhone"
                  value={formData.senderPhone}
                  onChange={(e) => handleInputChange("senderPhone", e.target.value)}
                  placeholder="Enter sender phone"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="senderAddress">Sender Address *</Label>
                <Textarea
                  id="senderAddress"
                  value={formData.senderAddress}
                  onChange={(e) => handleInputChange("senderAddress", e.target.value)}
                  placeholder="Enter sender address"
                  required
                />
              </div>
            </div>

            {/* Receiver Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Receiver Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="receiverName">Receiver Name *</Label>
                <Input
                  id="receiverName"
                  value={formData.receiverName}
                  onChange={(e) => handleInputChange("receiverName", e.target.value)}
                  placeholder="Enter receiver name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="receiverPhone">Receiver Phone</Label>
                <Input
                  id="receiverPhone"
                  value={formData.receiverPhone}
                  onChange={(e) => handleInputChange("receiverPhone", e.target.value)}
                  placeholder="Enter receiver phone"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="receiverAddress">Receiver Address *</Label>
                <Textarea
                  id="receiverAddress"
                  value={formData.receiverAddress}
                  onChange={(e) => handleInputChange("receiverAddress", e.target.value)}
                  placeholder="Enter receiver address"
                  required
                />
              </div>
            </div>
          </div>

          {/* Package Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Package Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="packageDescription">Package Description</Label>
                <Input
                  id="packageDescription"
                  value={formData.packageDescription}
                  onChange={(e) => handleInputChange("packageDescription", e.target.value)}
                  placeholder="Describe the package"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => handleInputChange("weight", e.target.value)}
                  placeholder="0.0"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Initial Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="picked_up">Picked Up</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Shipment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};