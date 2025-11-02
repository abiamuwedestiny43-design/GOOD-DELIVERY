'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { downloadNodeAsPDF } from '@/lib/pdf';
import { Shipment, ShipmentReceipt } from './ShipmentReceipt';

export const PrintReceiptSection = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const { toast } = useToast();

  const handlePrintReceipt = async () => {
    if (!trackingNumber.trim()) {
      toast({
        title: 'Tracking number required',
        description: 'Please enter a tracking number',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data: shipmentData, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('tracking_number', trackingNumber.trim())
        .single();

      if (error) {
        console.error('Error fetching shipment:', error);
        throw new Error('Shipment not found. Please check the tracking number.');
      }

      if (!shipmentData) {
        throw new Error('No shipment found with this tracking number.');
      }

      // Transform database fields to match Shipment type with defaults for missing fields
      const transformedShipment: Shipment = {
        id: shipmentData.id,
        tracking_number: shipmentData.tracking_number,
        sender_name: shipmentData.sender_name,
        sender_email: shipmentData.sender_email,
        sender_phone: shipmentData.sender_phone,
        sender_address: shipmentData.sender_address,
        receiver_name: shipmentData.receiver_name,
        receiver_email: shipmentData.receiver_email,
        receiver_phone: shipmentData.receiver_phone,
        receiver_address: shipmentData.receiver_address,
        package_description: shipmentData.package_description,
        weight: shipmentData.weight,
        status: shipmentData.status,
        created_at: shipmentData.created_at,
        updated_at: shipmentData.updated_at,
        // Fields that exist in the interface but not necessarily in DB
        package_value: null,
        quantity: null,
        service_type: null,
        sending_date: shipmentData.sending_date,
        delivery_date: shipmentData.delivery_date,
        shipping_fee: shipmentData.shipping_fee,
        signature_required: null,
        insurance: null,
        insurance_amount: null,
        special_instructions: null,
        payment_method: null,
        payment_status: null,
      };

      setShipment(transformedShipment);
      toast({
        title: 'Shipment found',
        description: 'Ready to print receipt',
      });

    } catch (err: any) {
      console.error('Error:', err);
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
      setShipment(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!shipment) return;
    
    const receiptElement = document.getElementById('receipt-print');
    if (receiptElement) {
      await downloadNodeAsPDF(receiptElement, `receipt_${shipment.tracking_number}.pdf`);
    }
  };

  const handlePrint = () => {
    if (!shipment) return;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const receiptElement = document.getElementById('receipt-print');
      if (receiptElement) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Receipt - ${shipment.tracking_number}</title>
              <style>
                body { 
                  margin: 0; 
                  padding: 0; 
                  font-family: monospace;
                  background: white;
                }
                @media print {
                  body { -webkit-print-color-adjust: exact; }
                }
              </style>
            </head>
            <body>
              ${receiptElement.outerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        
        printWindow.onload = () => {
          printWindow.focus();
          printWindow.print();
          // printWindow.close(); // Uncomment to auto-close after printing
        };
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardTitle className="text-xl">Print Shipment Receipt</CardTitle>
        <CardDescription className="text-blue-100">
          Enter tracking number to generate and print receipt
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Tracking Number Input */}
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="trackingNumber">Tracking Number</Label>
              <Input
                id="trackingNumber"
                placeholder="Enter tracking number (e.g., SL202312310001)"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handlePrintReceipt();
                  }
                }}
                className="font-mono"
              />
            </div>
            <Button 
              onClick={handlePrintReceipt} 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Searching...' : 'Find Shipment'}
            </Button>
          </div>

          {/* Results and Actions */}
          {shipment && (
            <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4 mt-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-semibold text-green-800">Shipment Found!</h3>
                  <p className="text-sm text-green-700">
                    Tracking: <span className="font-mono font-bold">{shipment.tracking_number}</span>
                  </p>
                  <p className="text-sm text-green-700">
                    Status: <span className="capitalize">{shipment.status}</span>
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleDownloadPDF}
                    variant="outline"
                    size="sm"
                    className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                  >
                    Download PDF
                  </Button>
                  <Button 
                    onClick={handlePrint}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Print Receipt
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Hidden receipt for printing */}
          <div className="sr-only">
            {shipment && (
              <div id="receipt-print">
                <ShipmentReceipt shipment={shipment} />
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 p-4 rounded-lg mt-6">
            <h4 className="font-semibold text-gray-800 mb-2">Instructions:</h4>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Enter the tracking number exactly as shown on the shipment</li>
              <li>Click "Find Shipment" to retrieve the shipment details</li>
              <li>Download PDF for digital records or Print for physical copies</li>
              <li>Ensure your printer is connected and ready before printing</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};