'use client';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { downloadNodeAsPDF } from '@/lib/pdf';
// import { ShipmentReceipt } from './ShipmentReceipt';
import { Search, Download, Printer } from 'lucide-react';
import { CreateShipmentForm } from './CreateShipmentForm';
import { ShipmentReceipt } from '../ShipmentReceipt';
import { Shipment } from '@/types/shipment';

export const PrintReceiptSection = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const { toast } = useToast();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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

      // Fetch current location from tracking events
      const { data: trackingData } = await supabase
        .from('tracking_events')
        .select('location')
        .eq('shipment_id', shipmentData.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const transformedShipment: Shipment = {
        ...shipmentData,
        current_location: trackingData?.location || 'Not specified'
      } as unknown as Shipment;

      setShipment(transformedShipment);
      toast({
        title: 'Shipment found',
        description: 'Ready to print receipt',
      });

    } catch (err: unknown) {
      console.error('Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      setShipment(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!shipment) return;

    try {
      // Create a temporary container for PDF generation
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '-9999px';
      document.body.appendChild(tempContainer);

      // Render the receipt component in the temporary container
      tempContainer.innerHTML = `
        <div style="width: 800px; padding: 20px; background: white;">
          <div id="temp-receipt">
            ${document.getElementById('receipt-print')?.innerHTML || ''}
          </div>
        </div>
      `;

      // Wait for any images or styles to load
      await new Promise(resolve => setTimeout(resolve, 500));

      const receiptElement = tempContainer.querySelector('#temp-receipt');
      if (receiptElement) {
        await downloadNodeAsPDF(receiptElement as HTMLElement, `receipt_${shipment.tracking_number}.pdf`);
        toast({
          title: 'PDF Downloaded',
          description: 'Receipt has been downloaded successfully',
        });
      }

      // Clean up
      document.body.removeChild(tempContainer);
    } catch (error) {
      console.error('PDF download error:', error);
      toast({
        title: 'Download Failed',
        description: 'Failed to download PDF. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handlePrint = () => {
    if (!shipment) return;

    const printContent = document.getElementById('receipt-print');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt - ${shipment.tracking_number}</title>
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                background: white;
                color: #000;
              }
              @media print {
                body { 
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
                @page { 
                  margin: 0;
                  size: auto;
                }
                .receipt-container {
                  width: 100%;
                  max-width: 800px;
                  margin: 0 auto;
                  background: white !important;
                }
                * {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
              }
              .receipt-container {
                width: 100%;
                max-width: 800px;
                margin: 0 auto;
                background: white;
                color: #000;
              }
            </style>
          </head>
          <body>
            <div class="receipt-container">
              ${printContent.innerHTML}
            </div>
            <script>
              window.onload = function() {
                window.focus();
                window.print();
                // window.close(); // Uncomment to auto-close after printing
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      <CreateShipmentForm onShipmentCreated={setShipment} />

      <Card className="w-full">
        <CardHeader className="bg-gradient-to-r from-emerald-600 to-purple-600 text-white">
          <CardTitle className="text-xl">Print Shipment Receipt</CardTitle>
          <CardDescription className="text-emerald-100">
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
                className="bg-emerald-600 hover:bg-emerald-700 gap-2"
              >
                <Search className="w-4 h-4" />
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
                    <p className="text-sm text-green-700">
                      Location: <span className="capitalize">{shipment.current_location}</span>
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleDownloadPDF}
                      variant="outline"
                      size="sm"
                      className="border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </Button>
                    <Button
                      onClick={handlePrint}
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 gap-2"
                    >
                      <Printer className="w-4 h-4" />
                      Print Receipt
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Hidden receipt for printing - Only render on client side */}
            {isClient && shipment && (
              <div className="sr-only">
                <div id="receipt-print" ref={receiptRef}>
                  <ShipmentReceipt shipment={shipment} />
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="bg-gray-50 p-4 rounded-lg mt-6">
              <h4 className="font-semibold text-gray-800 mb-2">Instructions:</h4>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Enter the tracking number exactly as shown on the shipment</li>
                <li>Click "Find Shipment" to retrieve the shipment details</li>
                <li>Download PDF for digital records or Print for physical copies</li>
                <li>Ensure your printer is connected and ready before printing</li>
                <li>Allow pop-ups for this site to enable printing functionality</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
