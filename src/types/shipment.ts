export interface Shipment {
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
  package_value: number | null;
  weight: number | null;
  quantity: number | null;
  service_type: string | null;
  shipping_fee: number | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
  sending_date: string | null;
  delivery_date: string | null;
  signature_required: boolean | null;
  insurance: boolean | null;
  insurance_amount: number | null;
  special_instructions: string | null;
  payment_method: string | null;
  payment_status: string | null;
  created_by: string | null;
  current_location?: string;
}

export interface TrackingEvent {
  id: string;
  shipment_id: string;
  status: string;
  location: string | null;
  description: string | null;
  created_at: string | null;
  previous_location?: string;
}

export interface LocationHistory {
  from: string;
  to: string;
  timestamp: string;
  formattedDate: string;
}
