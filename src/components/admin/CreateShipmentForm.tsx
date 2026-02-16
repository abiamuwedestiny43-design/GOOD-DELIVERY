import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, ArrowRight, ArrowLeft } from 'lucide-react';

interface CreateShipmentFormProps {
  onShipmentCreated: (shipment: any) => void;
}

export const CreateShipmentForm = ({ onShipmentCreated }: CreateShipmentFormProps) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('sender');
  const { toast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    // Sender Information
    sender_name: '',
    sender_email: '',
    sender_phone: '',
    sender_address: '',

    // Receiver Information
    receiver_name: '',
    receiver_email: '',
    receiver_phone: '',
    receiver_address: '',

    // Package Information
    package_description: '',
    weight: '',
    quantity: '1',

    // Shipping Details
    service_type: 'standard',
    sending_date: '',
    delivery_date: '',
    status: 'pending',
    current_location: '',

    // Insurance & Additional Services
    insurance: false,
    insurance_amount: '',
    special_instructions: '',

    // Payment Information
    payment_method: 'credit_card',
    payment_status: 'pending'
  });

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateInsuranceAmount = () => {
    if (formData.insurance) {
      return 50; // Fixed insurance amount
    }
    return 0;
  };

  const calculateShippingFee = () => {
  const baseFee = 95; // flat service fee
  const ratePerKg = 20; // USD per kg (you can adjust this)
  const weight = formData.weight ? parseFloat(formData.weight) : 0;

  const serviceMultiplier = {
    'standard': 1.2,    // no multiplier
    'express': 1.7,   // +50%
    'priority': 2.5,    // +100%
    'overnight': 3.9    // +200%
  }[formData.service_type] || 1;

  const weightFee = weight * ratePerKg * serviceMultiplier;

  return baseFee + weightFee;
};


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to create a shipment',
        variant: 'destructive',
      });
      return;
    }

    // Validate required fields
    const requiredFields = [
      'sender_name', 'sender_email', 'sender_address',
      'receiver_name', 'receiver_email', 'receiver_address',
      'package_description', 'weight', 'current_location'
    ];

    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);

    if (missingFields.length > 0) {
      toast({
        title: 'Missing required fields',
        description: `Please fill in: ${missingFields.join(', ').replace(/_/g, ' ')}`,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Generate tracking number
      const trackingNumber = 'SL' + new Date().toISOString().replace(/-/g, '').slice(0, 8) + Math.floor(1000 + Math.random() * 9000);

      // Calculate fees
      const shippingFee = calculateShippingFee();
      const insuranceAmount = formData.insurance ? calculateInsuranceAmount() : 0;
      const totalAmount = shippingFee + insuranceAmount;

      const { data: shipment, error: shipmentError } = await supabase
        .from('shipments')
        .insert({
          tracking_number: trackingNumber,

          // Sender information
          sender_name: formData.sender_name,
          sender_email: formData.sender_email,
          sender_phone: formData.sender_phone || null,
          sender_address: formData.sender_address,

          // Receiver information
          receiver_name: formData.receiver_name,
          receiver_email: formData.receiver_email,
          receiver_phone: formData.receiver_phone || null,
          receiver_address: formData.receiver_address,

          // Package information
          package_description: formData.package_description,
          weight: parseFloat(formData.weight),
          quantity: parseInt(formData.quantity) || 1,

          // Shipping details
          shipping_fee: totalAmount,
          service_type: formData.service_type,
          sending_date: formData.sending_date || null,
          delivery_date: formData.delivery_date || null,
          status: formData.status,
          current_location: formData.current_location,

          // Insurance & additional services
          insurance: formData.insurance,
          insurance_amount: insuranceAmount,
          special_instructions: formData.special_instructions || null,

          // Payment information
          payment_method: formData.payment_method,
          payment_status: formData.payment_status,

          created_by: user.id,
        })
        .select()
        .single();

      if (shipmentError) {
        console.error('Supabase error details:', shipmentError);
        throw new Error(`Failed to create shipment: ${shipmentError.message}`);
      }

      // Create initial tracking event with location
      await supabase.from('tracking_events').insert({
        shipment_id: shipment.id,
        status: formData.status,
        location: formData.current_location,
        description: `Shipment created at ${formData.current_location}. Status: ${formData.status}`,
      });

      // Send email notification to receiver
      try {
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Shipment Created -  EC WorldWide Service</title>
          </head>
          <body>
            <h2>Your Shipment Has Been Created</h2>
            <p>Tracking Number: <strong>${trackingNumber}</strong></p>
            <p>Current Location: ${formData.current_location}</p>
            <p>Status: ${formData.status}</p>
            <p>Use this number to track your package on our website.</p>
          </body>
          </html>
        `;

await fetch('http://localhost:3001/api/send-shipment-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    to: formData.receiver_email,
    shipment,
  }),
});
        console.log("Email notification sent successfully");
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
        // Don't fail the entire operation if email fails
      }

      onShipmentCreated(shipment);

      toast({
        title: 'Shipment created successfully!',
        description: `Tracking number: ${trackingNumber}. Email notification sent to receiver.`
      });

      // Reset form
      setFormData({
        sender_name: '',
        sender_email: '',
        sender_phone: '',
        sender_address: '',
        receiver_name: '',
        receiver_email: '',
        receiver_phone: '',
        receiver_address: '',
        package_description: '',
        weight: '',
        quantity: '1',
        service_type: 'standard',
        sending_date: '',
        delivery_date: '',
        status: 'pending',
        current_location: '',
        insurance: false,
        insurance_amount: '',
        special_instructions: '',
        payment_method: 'credit_card',
        payment_status: 'pending'
      });
      setActiveTab('sender');

    } catch (err: any) {
      console.error('Full error:', err);
      toast({
        title: 'Error creating shipment',
        description: err.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <CardTitle className="text-2xl font-semibold">Create New Shipment</CardTitle>
        <CardDescription className="text-emerald-100">
          Complete all sections to create a new shipment with tracking
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="sender">Sender</TabsTrigger>
            <TabsTrigger value="receiver">Receiver</TabsTrigger>
            <TabsTrigger value="package">Package</TabsTrigger>
            <TabsTrigger value="shipping">Shipping</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Sender Information */}
            <TabsContent value="sender" className="space-y-4">
              <h3 className="text-lg font-semibold">Sender Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sender_name">Full Name *</Label>
                  <Input
                    id="sender_name"
                    value={formData.sender_name}
                    onChange={(e) => handleInputChange('sender_name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sender_email">Email *</Label>
                  <Input
                    id="sender_email"
                    type="email"
                    value={formData.sender_email}
                    onChange={(e) => handleInputChange('sender_email', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sender_phone">Phone</Label>
                  <Input
                    id="sender_phone"
                    type="tel"
                    value={formData.sender_phone}
                    onChange={(e) => handleInputChange('sender_phone', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sender_address">Full Address *</Label>
                <Textarea
                  id="sender_address"
                  value={formData.sender_address}
                  onChange={(e) => handleInputChange('sender_address', e.target.value)}
                  placeholder="Street, City, State, ZIP Code"
                  required
                />
              </div>

              <Button type="button" onClick={() => setActiveTab('receiver')} className="gap-2">
                Next: Receiver Information
                <ArrowRight className="w-4 h-4" />
              </Button>
            </TabsContent>

            {/* Receiver Information */}
            <TabsContent value="receiver" className="space-y-4">
              <h3 className="text-lg font-semibold">Receiver Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="receiver_name">Full Name *</Label>
                  <Input
                    id="receiver_name"
                    value={formData.receiver_name}
                    onChange={(e) => handleInputChange('receiver_name', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receiver_email">Email *</Label>
                  <Input
                    id="receiver_email"
                    type="email"
                    value={formData.receiver_email}
                    onChange={(e) => handleInputChange('receiver_email', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receiver_phone">Phone</Label>
                  <Input
                    id="receiver_phone"
                    type="tel"
                    value={formData.receiver_phone}
                    onChange={(e) => handleInputChange('receiver_phone', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="receiver_address">Full Address *</Label>
                <Textarea
                  id="receiver_address"
                  value={formData.receiver_address}
                  onChange={(e) => handleInputChange('receiver_address', e.target.value)}
                  placeholder="Street, City, State, ZIP Code"
                  required
                />
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setActiveTab('sender')} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button type="button" onClick={() => setActiveTab('package')} className="gap-2">
                  Next: Package Details
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </TabsContent>

            {/* Package Information */}
            <TabsContent value="package" className="space-y-4">
              <h3 className="text-lg font-semibold">Package Details</h3>

              <div className="space-y-2">
                <Label htmlFor="package_description">Package Description *</Label>
                <Textarea
                  id="package_description"
                  value={formData.package_description}
                  onChange={(e) => handleInputChange('package_description', e.target.value)}
                  placeholder="Describe the contents of the package"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg) *</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setActiveTab('receiver')} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button type="button" onClick={() => setActiveTab('shipping')} className="gap-2">
                  Next: Shipping Options
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </TabsContent>

            {/* Shipping Options */}
            <TabsContent value="shipping" className="space-y-4">
              <h3 className="text-lg font-semibold">Shipping Options</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service_type">Service Type</Label>
                  <Select
                    value={formData.service_type}
                    onValueChange={(value) => handleInputChange('service_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard (3-5 days)</SelectItem>
                      <SelectItem value="express">Express (2-3 days)</SelectItem>
                      <SelectItem value="priority">Priority (1-2 days)</SelectItem>
                      <SelectItem value="overnight">Overnight (Next day)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Initial Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleInputChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
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
                  <Label htmlFor="current_location">Current Location *</Label>
                  <Input
                    id="current_location"
                    value={formData.current_location}
                    onChange={(e) => handleInputChange('current_location', e.target.value)}
                    placeholder="Enter current location (e.g., Lagos, Nigeria)"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sending_date">Sending Date</Label>
                  <Input
                    id="sending_date"
                    type="date"
                    value={formData.sending_date}
                    onChange={(e) => handleInputChange('sending_date', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delivery_date">Expected Delivery Date</Label>
                  <Input
                    id="delivery_date"
                    type="date"
                    value={formData.delivery_date}
                    onChange={(e) => handleInputChange('delivery_date', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="insurance"
                    checked={formData.insurance}
                    onCheckedChange={(checked) => handleInputChange('insurance', checked)}
                  />
                  <Label htmlFor="insurance">Add Insurance</Label>
                </div>

                {formData.insurance && (
                  <div className="space-y-2">
                    <Label htmlFor="insurance_amount">Insurance Amount</Label>
                    <Input
                      id="insurance_amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={calculateInsuranceAmount()}
                      disabled
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="special_instructions">Special Instructions</Label>
                <Textarea
                  id="special_instructions"
                  value={formData.special_instructions}
                  onChange={(e) => handleInputChange('special_instructions', e.target.value)}
                  placeholder="Any special handling instructions..."
                />
              </div>

              <div className="bg-emerald-50 p-4 rounded-lg">
                <h4 className="font-semibold text-emerald-800">Estimated Costs</h4>
                <p className="text-emerald-600">
                  Shipping: ${calculateShippingFee().toFixed(2)} |
                  Insurance: ${calculateInsuranceAmount().toFixed(2)} |
                  Total: ${(calculateShippingFee() + calculateInsuranceAmount()).toFixed(2)}
                </p>
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setActiveTab('package')} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button type="button" onClick={() => setActiveTab('payment')} className="gap-2">
                  Next: Payment
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </TabsContent>

            {/* Payment Information */}
            <TabsContent value="payment" className="space-y-4">
              <h3 className="text-lg font-semibold">Payment Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payment_method">Payment Method</Label>
                  <Select
                    value={formData.payment_method}
                    onValueChange={(value) => handleInputChange('payment_method', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cash">Cash on Delivery</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_status">Payment Status</Label>
                  <Select
                    value={formData.payment_status}
                    onValueChange={(value) => handleInputChange('payment_status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="partial">Partial Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800">Order Summary</h4>
                <div className="text-green-600 space-y-1">
                  <p>Shipping: ${calculateShippingFee().toFixed(2)}</p>
                  <p>Insurance: ${calculateInsuranceAmount().toFixed(2)}</p>
                  <p className="font-bold">Total: ${(calculateShippingFee() + calculateInsuranceAmount()).toFixed(2)}</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setActiveTab('shipping')} className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button type="submit" disabled={loading} className="flex-1 gap-2">
                  <Plus className="w-4 h-4" />
                  {loading ? 'Creating Shipment...' : 'Create Shipment & Generate Tracking'}
                </Button>
              </div>
            </TabsContent>
          </form>
        </Tabs>
      </CardContent>
    </Card>
  );
};
