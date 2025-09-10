import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Copy } from 'lucide-react';
import { Shipment } from '@/types/shipment';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EditShipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shipment: Shipment | null;
  onUpdate: () => void;
}

export const EditShipmentDialog = ({
  open,
  onOpenChange,
  shipment,
  onUpdate,
}: EditShipmentDialogProps) => {
  const [formData, setFormData] = useState<Partial<Shipment>>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (shipment) {
      setFormData(shipment);
    }
  }, [shipment]);

  const handleInputChange = (
    field: keyof Shipment,
    value: string | number | boolean | null,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Improved email handling with better error management

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!shipment) return;

  setLoading(true);
  try {
    // --- Update shipment fields ---
    const updateData = {
      tracking_number: formData.tracking_number ?? shipment.tracking_number,
      status: formData.status ?? shipment.status,
      current_location: formData.current_location ?? shipment.current_location,
      sender_name: formData.sender_name ?? shipment.sender_name,
      receiver_name: formData.receiver_name ?? shipment.receiver_name,
      receiver_email: formData.receiver_email ?? shipment.receiver_email,
      special_instructions:
        formData.special_instructions ?? shipment.special_instructions,
    };

    const { error: updateError } = await supabase
      .from('shipments')
      .update(updateData)
      .eq('id', shipment.id);

    if (updateError) throw updateError;

    // --- Insert tracking event ---
    const trackingEvent = {
      shipment_id: shipment.id,
      status: updateData.status,
      location: updateData.current_location,
      previous_location: shipment.current_location,
      description: `Status changed to "${updateData.status}". Location moved from "${shipment.current_location || 'N/A'}" to "${updateData.current_location || 'N/A'}".`,
      timestamp: new Date().toISOString(), // Use timestamp instead of created_at
    };

    const { error: insertError } = await supabase
      .from('tracking_events')
      .insert([trackingEvent]);

    if (insertError) {
      console.error('Tracking event insert error:', insertError);
      // Continue even if tracking event fails - don't break the whole update
    }

    // Send email update with improved error handling
    const receiverEmail = updateData.receiver_email || shipment.receiver_email;
    
    if (receiverEmail && receiverEmail.includes('@')) {
      try {
        // Use the correct port (3001) or set up proxy
        const emailResponse = await fetch('http://localhost:3001/api/send-shipment-update-email', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: receiverEmail,
            shipment: { ...shipment, ...updateData },
            trackingEvent
          }),
        });

        // Check if response is ok before trying to parse JSON
        if (emailResponse.ok) {
          // Only try to parse JSON if there's content
          let emailResult = null;
          const contentType = emailResponse.headers.get('content-type');
          
          if (contentType && contentType.includes('application/json')) {
            try {
              emailResult = await emailResponse.json();
              console.log('Email sent successfully:', emailResult);
            } catch (parseError) {
              console.log('Email sent successfully (no JSON response)');
            }
          } else {
            console.log('Email sent successfully (non-JSON response)');
          }
          
          toast({
            title: 'Shipment updated',
            description: 'Shipment updated and email notification sent successfully.',
          });
        } else {
          // Handle HTTP errors (404, 500, etc.)
          let errorMessage = `HTTP ${emailResponse.status}: ${emailResponse.statusText}`;
          
          // Only try to parse JSON if the response has content and is JSON
          const contentType = emailResponse.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            try {
              const errorData = await emailResponse.json();
              errorMessage = errorData.message || errorMessage;
            } catch (parseError) {
              // If response isn't valid JSON, use the status text
              console.error('Error parsing error response:', parseError);
            }
          }
          
          throw new Error(errorMessage);
        }
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        
        // More specific error messages
        let errorDescription = 'Email notification failed to send.';
        if (emailError.message.includes('404')) {
          errorDescription = 'Email service not available. Is your email server running on port 3001?';
        } else if (emailError.message.includes('Failed to fetch')) {
          errorDescription = 'Cannot connect to email service. Check if your email server is running.';
        }
        
        toast({
          title: 'Shipment updated',
          description: `Shipment updated successfully, but ${errorDescription}`,
          variant: 'default',
        });
      }
    } else {
      toast({
        title: 'Shipment updated',
        description: 'Shipment updated successfully. No email sent (missing or invalid email address).',
      });
    }

    onUpdate();
    onOpenChange(false);
  } catch (error) {
    console.error('Update error:', error);
    toast({
      title: 'Error updating shipment',
      description: error.message || 'An unexpected error occurred',
      variant: 'destructive',
    });
  } finally {
    setLoading(false);
  }
};

  const copyTrackingNumber = () => {
    if (shipment?.tracking_number) {
      navigator.clipboard.writeText(shipment.tracking_number);
      toast({
        title: 'Copied to clipboard',
        description: 'Tracking number copied to clipboard.',
      });
    }
  };

  if (!shipment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Shipment</DialogTitle>
          <DialogDescription>
            Update the shipment details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tracking Number */}
          <div className="space-y-2">
            <Label htmlFor="tracking_number">Tracking Number</Label>
            <div className="flex gap-2">
              <Input
                id="tracking_number"
                value={
                  formData.tracking_number !== undefined
                    ? formData.tracking_number
                    : shipment.tracking_number
                }
                onChange={(e) => handleInputChange('tracking_number', e.target.value)}
                required
                className="font-mono"
              />
              <Button
                type="button"
                variant="outline"
                onClick={copyTrackingNumber}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Status & Current Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={
                  formData.status !== undefined
                    ? formData.status
                    : (shipment.status || 'pending')
                }
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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

            <div className="space-y-2">
              <Label htmlFor="current_location">Current Location</Label>
              <Input
                id="current_location"
                value={
                  formData.current_location !== undefined
                    ? formData.current_location
                    : (shipment.current_location || '')
                }
                onChange={(e) =>
                  handleInputChange('current_location', e.target.value)
                }
                placeholder="Enter current location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sender_name">Sender Name</Label>
              <Input
                id="sender_name"
                value={
                  formData.sender_name !== undefined
                    ? formData.sender_name
                    : shipment.sender_name
                }
                onChange={(e) => handleInputChange('sender_name', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiver_name">Receiver Name</Label>
              <Input
                id="receiver_name"
                value={
                  formData.receiver_name !== undefined
                    ? formData.receiver_name
                    : shipment.receiver_name
                }
                onChange={(e) =>
                  handleInputChange('receiver_name', e.target.value)
                }
                required
              />
            </div>
          </div>

          {/* Special Instructions */}
          <div className="space-y-2">
            <Label htmlFor="special_instructions">Special Instructions</Label>
            <Textarea
              id="special_instructions"
              value={
                formData.special_instructions !== undefined
                  ? formData.special_instructions
                  : (shipment.special_instructions || '')
              }
              onChange={(e) =>
                handleInputChange('special_instructions', e.target.value)
              }
              placeholder="Any special handling instructions..."
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Shipment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
