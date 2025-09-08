import { useRef, useState } from 'react';
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
import { ShipmentReceipt, type Shipment } from '@/components/ShipmentReceipt';
import { downloadNodeAsPDF } from '@/lib/pdf';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Email template generator
const generateShipmentEmailHtml = (shipmentData: any) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Shipment Created - Frangiles Fasts Logistics</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .tracking-box { background-color: #eff6ff; border: 2px solid #2563eb; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
        .tracking-number { font-size: 24px; font-weight: bold; color: #2563eb; margin: 10px 0; font-family: monospace; }
        .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
        .detail-section { background-color: #f8fafc; padding: 15px; border-radius: 8px; }
        .detail-title { font-weight: bold; color: #374151; margin-bottom: 10px; }
        .detail-item { margin: 5px 0; color: #6b7280; }
        .footer { background-color: #374151; color: white; padding: 20px; text-align: center; }
        .btn { background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚚 Frangiles Fasts Logistics</h1>
          <p>Your shipment has been successfully created!</p>
        </div>
        
        <div class="content">
          <div class="tracking-box">
            <h2>Your Tracking Number</h2>
            <div class="tracking-number">${shipmentData.tracking_number}</div>
            <p>Use this number to track your package online</p>
            <a href="${window.location.origin}/track?number=${shipmentData.tracking_number}" class="btn">Track Your Package</a>
          </div>
          
          <div class="details-grid">
            <div class="detail-section">
              <div class="detail-title">📦 Package Details</div>
              <div class="detail-item">Weight: ${shipmentData.weight || 'N/A'}</div>
              <div class="detail-item">Description: ${shipmentData.package_description || 'N/A'}</div>
              <div class="detail-item">Service: ${shipmentData.service_type || 'Standard'}</div>
            </div>
            
            <div class="detail-section">
              <div class="detail-title">📍 Delivery Details</div>
              <div class="detail-item">To: ${shipmentData.receiver_name}</div>
              <div class="detail-item">Address: ${shipmentData.receiver_address}</div>
              <div class="detail-item">Phone: ${shipmentData.receiver_phone || 'N/A'}</div>
            </div>
          </div>
          
          <div class="detail-section">
            <div class="detail-title">ℹ️ What's Next?</div>
            <div class="detail-item">• Your package will be picked up within 24 hours</div>
            <div class="detail-item">• You'll receive updates via email as your package moves</div>
            <div class="detail-item">• Track your package anytime using the link above</div>
            <div class="detail-item">• Contact us if you have any questions</div>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing Frangiles Fasts Logistics!</p>
          <p>Questions? Contact us at support@frangilesfasts.online</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const AddTrackingForm = () => {
  const [loading, setLoading] = useState(false);
  const [lastShipment, setLastShipment] = useState<Shipment | null>(null);
  const [activeTab, setActiveTab] = useState('sender');
  const receiptRef = useRef<HTMLDivElement>(null);

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
    package_value: '',
    weight: '',
    dimensions: '',
    quantity: '1',

    // Shipping Details
    service_type: 'standard',
    sending_date: '',
    delivery_date: '',
    status: 'pending',

    // Insurance & Additional Services
    insurance: false,
    insurance_amount: '',
    special_instructions: '',
    fragile: false,
    signature_required: false,

    // Payment Information
    payment_method: 'credit_card',
    payment_status: 'pending'
  });

  const { toast } = useToast();
  const { user } = useAuth();

  const handleInputChange = (field: string, value: string | boolean | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateInsuranceAmount = () => {
    if (formData.insurance && formData.package_value) {
      const packageValue = parseFloat(formData.package_value);
      return Math.min(packageValue * 0.01, 100); // 1% of value, max $100
    }
    return 0;
  };

  const calculateShippingFee = () => {
    const baseFee = 15;
    const weightFee = formData.weight ? parseFloat(formData.weight) * 2 : 0;
    const serviceMultiplier = {
      'standard': 1,
      'express': 1.5,
      'priority': 2,
      'overnight': 3
    }[formData.service_type] || 1;

    return (baseFee + weightFee) * serviceMultiplier;
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
      'package_description', 'weight'
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
          package_value: formData.package_value ? parseFloat(formData.package_value) : null,
          weight: parseFloat(formData.weight),
          dimensions: formData.dimensions || null,
          quantity: parseInt(formData.quantity) || 1,
          fragile: formData.fragile,

          // Shipping details
          shipping_fee: totalAmount,
          service_type: formData.service_type,
          sending_date: formData.sending_date || null,
          delivery_date: formData.delivery_date || null,
          status: formData.status,
          signature_required: formData.signature_required,

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

      // Create initial tracking event
      await supabase.from('tracking_events').insert({
        shipment_id: shipment.id,
        status: formData.status,
        description: `Shipment created and is ${formData.status}`,
        location: formData.sender_address,
      });

      // Send email notification to receiver
      try {
        const emailHtml = generateShipmentEmailHtml({
          ...shipment,
          tracking_number: trackingNumber
        });
        await supabase.functions.invoke('send-shipment-email', {
          body: {
            to: formData.receiver_email,
            subject: `Your shipment ${trackingNumber} has been created - Frangiles Fasts Logistics`,
            html: emailHtml,
            shipmentData: shipment
          }
        });
        console.log("Email notification sent successfully");
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
        // Don't fail the entire operation if email fails
      }

      setLastShipment(shipment as any);

      toast({
        title: 'Shipment created successfully!',
        description: `Tracking number: ${trackingNumber}. Email notification sent to receiver.`
      });

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

  const handleDownloadPDF = async () => {
    if (!lastShipment || !receiptRef.current) return;
    await downloadNodeAsPDF(receiptRef.current, `shipment_${lastShipment.tracking_number}.pdf`);
  };

  return (
    <Card className="w-full max-w-6xl mx-auto rounded-2xl shadow-xl border border-gray-200">
      {/* <AdminDashboard /> */}
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-t-2xl">
        <CardTitle className="text-2xl font-semibold">Create New Shipment</CardTitle>
        <CardDescription className="text-blue-100">
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

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Sender Information */}
            <TabsContent value="sender" className="space-y-6">
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

              <Button type="button" onClick={() => setActiveTab('receiver')}>
                Next: Receiver Information
              </Button>
            </TabsContent>

            {/* Receiver Information */}
            <TabsContent value="receiver" className="space-y-6">
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
                <Button type="button" variant="outline" onClick={() => setActiveTab('sender')}>
                  Back
                </Button>
                <Button type="button" onClick={() => setActiveTab('package')}>
                  Next: Package Details
                </Button>
              </div>
            </TabsContent>

            {/* Package Information */}
            <TabsContent value="package" className="space-y-6">
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

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <Label htmlFor="dimensions">Dimensions (LxWxH)</Label>
                  <Input
                    id="dimensions"
                    value={formData.dimensions}
                    onChange={(e) => handleInputChange('dimensions', e.target.value)}
                    placeholder="10x5x3 in"
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

                <div className="space-y-2">
                  <Label htmlFor="package_value">Value ($)</Label>
                  <Input
                    id="package_value"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.package_value}
                    onChange={(e) => handleInputChange('package_value', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="fragile"
                    checked={formData.fragile}
                    onCheckedChange={(checked) => handleInputChange('fragile', checked)}
                  />
                  <Label htmlFor="fragile">Fragile Item</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="signature_required"
                    checked={formData.signature_required}
                    onCheckedChange={(checked) => handleInputChange('signature_required', checked)}
                  />
                  <Label htmlFor="signature_required">Signature Required</Label>
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setActiveTab('receiver')}>
                  Back
                </Button>
                <Button type="button" onClick={() => setActiveTab('shipping')}>
                  Next: Shipping Options
                </Button>
              </div>
            </TabsContent>

            {/* Shipping Options */}
            <TabsContent value="shipping" className="space-y-6">
              <h3 className="text-lg font-semibold">Shipping Options</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="in_transit">In Transit</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <p className="text-sm text-gray-500">
                      Insurance covers up to ${formData.package_value || '0'} at 1% of declared value
                    </p>
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

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800">Estimated Costs</h4>
                <p className="text-blue-600">
                  Shipping: ${calculateShippingFee().toFixed(2)} |
                  Insurance: ${calculateInsuranceAmount().toFixed(2)} |
                  Total: ${(calculateShippingFee() + calculateInsuranceAmount()).toFixed(2)}
                </p>
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setActiveTab('package')}>
                  Back
                </Button>
                <Button type="button" onClick={() => setActiveTab('payment')}>
                  Next: Payment
                </Button>
              </div>
            </TabsContent>

            {/* Payment Information */}
            <TabsContent value="payment" className="space-y-6">
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
                <Button type="button" variant="outline" onClick={() => setActiveTab('shipping')}>
                  Back
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creating Shipment...' : 'Create Shipment & Generate Tracking'}
                </Button>
              </div>
            </TabsContent>
          </form>
        </Tabs>

        {/* Hidden print area for PDF */}
        <div className="sr-only print:block mt-8" aria-hidden>
          {lastShipment && <ShipmentReceipt ref={receiptRef} shipment={lastShipment} />}
        </div>

        {lastShipment && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800">Shipment Created Successfully!</h3>
            <p className="text-green-600">Tracking Number: {lastShipment.tracking_number}</p>
            <Button
              onClick={handleDownloadPDF}
              variant="outline"
              className="mt-2"
            >
              Download Receipt
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};