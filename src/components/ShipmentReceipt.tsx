import React, { forwardRef } from 'react';

export type Shipment = {
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
  shipping_fee: number | null;
  service_type: string | null;
  sending_date: string | null;
  delivery_date: string | null;
  status: string | null;
  insurance: boolean | null;
  insurance_amount: number | null;
  special_instructions: string | null;
  payment_method: string | null;
  payment_status: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export const ShipmentReceipt = forwardRef<HTMLDivElement, { shipment: Shipment }>(
  ({ shipment }, ref) => {
    const formatDate = (dateString: string | null) => {
      if (!dateString) return '-';
      // Extract just the date part to avoid timezone issues
      const dateOnly = dateString.split('T')[0];
      const [year, month, day] = dateOnly.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[parseInt(month) - 1]} ${parseInt(day)}, ${year}`;
    };

    const formatCurrency = (amount: number | null) => {
      if (amount === null || amount === 0) return "UNDECLARED";
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount);
    };

    const formatServiceType = (serviceType: string | null) => {
      if (!serviceType) return 'Standard';
      return serviceType.charAt(0).toUpperCase() + serviceType.slice(1).replace('_', ' ');
    };

    const formatPaymentMethod = (method: string | null) => {
      if (!method) return 'Online Transfer';
      return method.split('_').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    };

    const totalAmount = (shipment.shipping_fee || 0) + (shipment.insurance_amount || 0);

    return (
      <div ref={ref as any} className="w-full mx-auto bg-white text-gray-800 p-4 font-sans text-sm shadow-lg">
        {/* Header */}
        <div className="text-center border-b border-gray-200 pb-4 mb-4">
          <div className="bg-blue-600 text-white p-3 -mx-3 -mt-2 mb-3">
            <h1 className="text-xl font-bold"> Zenfiq Express Service</h1>
            <p className="text-sm opacity-90">Premium Shipping Solutions</p>
          </div>
          <p className="text-gray-600">Receipt #: {shipment.tracking_number}</p>
          <p className="text-gray-600">Date: {new Date().toLocaleDateString()}</p>
          <p className="text-gray-600">Time: {new Date().toLocaleTimeString()}</p>
        </div>

        {/* Sender & Receiver */}
        <div className="flex justify-between mb-4">
          <div className="w-48">
            <div className="bg-blue-100 p-2 mb-2 text-center rounded">
              <span className="font-bold text-blue-800">SENDER</span>
            </div>
            <p><span className="font-semibold">Name:</span> {shipment.sender_name}</p>
            <p><span className="font-semibold">Phone:</span> {shipment.sender_phone || '-'}</p>
            <p><span className="font-semibold">Email:</span> {shipment.sender_email || '-'}</p>
            <p><span className="font-semibold">Address:</span> {shipment.sender_address}</p>
          </div>
          <div className="w-48">
            <div className="bg-purple-100 p-2 mb-2 text-center rounded">
              <span className="font-bold text-purple-800">RECEIVER</span>
            </div>
            <p><span className="font-semibold">Name:</span> {shipment.receiver_name}</p>
            <p><span className="font-semibold">Phone:</span> {shipment.receiver_phone || '-'}</p>
            <p><span className="font-semibold">Email:</span> {shipment.receiver_email || '-'}</p>
            <p><span className="font-semibold">Address:</span> {shipment.receiver_address}</p>
          </div>
        </div>

        {/* Package Details */}
        <div className="border border-green-200 p-3 mb-4 rounded">
          <div className="bg-green-100 p-2 mb-2 text-center -mx-2 -mt-2 rounded-t">
            <span className="font-bold text-green-800">PACKAGE DETAILS</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <p><span className="font-semibold">Weight:</span> {shipment.weight ? `${shipment.weight} kg` : '-'}</p>
            <p><span className="font-semibold">Quantity:</span> {shipment.quantity || '1'}</p>
          </div>
          <div className="mt-4 border-t border-green-200 pt-2">
            <p className="font-semibold">Description:</p>
            <p>{shipment.package_description || '-'}</p>
          </div>
        </div>

        {/* Shipping Info */}
        <div className="border border-orange-200 p-3 mb-4 rounded">
          <div className="bg-orange-100 p-2 mb-2 text-center -mx-2 -mt-2 rounded-t">
            <span className="font-bold text-orange-800">SHIPPING INFO</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <p><span className="font-semibold">Service:</span> {formatServiceType(shipment.service_type)}</p>
            <p><span className="font-semibold">Status:</span> {shipment.status?.replace('_', ' ') || 'Pending'}</p>
            <p><span className="font-semibold">Send Date:</span> {formatDate(shipment.sending_date)}</p>
            <p><span className="font-semibold">Delivery Date:</span> {formatDate(shipment.delivery_date)}</p>
            <p><span className="font-semibold">Insurance:</span> {shipment.insurance ? 'Yes' : 'No'}</p>
            {shipment.insurance && (
              <p><span className="font-semibold">Insurance Amount:</span> {formatCurrency(shipment.insurance_amount)}</p>
            )}
          </div>
          {shipment.special_instructions && (
            <p className="mt-2 border-t border-dashed border-orange-300 pt-2">
              <span className="font-semibold">Instructions:</span> {shipment.special_instructions}
            </p>
          )}
        </div>

        {/* Payment Info */}
        <div className="border border-red-200 p-3 mb-4 rounded">
          <div className="bg-red-100 p-2 mb-2 text-center -mx-2 -mt-2 rounded-t">
            <span className="font-bold text-red-800">PAYMENT DETAILS</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold">Shipping Fee:</span>
              <span>{formatCurrency(shipment.shipping_fee)}</span>
            </div>
            {shipment.insurance && (
              <div className="flex justify-between">
                <span className="font-semibold">Insurance:</span>
                <span>{formatCurrency(shipment.insurance_amount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-semibold">Method:</span>
              <span>{formatPaymentMethod(shipment?.payment_method) || 'Transfer'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Status:</span>
              <span className={
                shipment?.payment_status === 'paid'
                  ? 'text-green-600 font-bold'
                  : 'text-orange-600'
              }>
                {shipment.payment_status?.toUpperCase() || 'PAID'}
              </span>
            </div>
            <div className="border-t border-dashed border-gray-300 pt-2 flex justify-between font-bold">
              <span>TOTAL:</span>
              <span>{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center border-t border-gray-200 pt-3">
          <div className="bg-red-500 text-white p-2 -mx-2 mb-2 rounded">
            <p className="font-bold">THANK YOU FOR YOUR BUSINESS</p>
          </div>
          <p className="text-gray-600">Support: support@zenfiqexpressdeliveryservice.online</p>
        </div>
      </div>
    );
  }
);

ShipmentReceipt.displayName = 'ShipmentReceipt';

