import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { SmtpClient } from 'https://deno.land/x/smtp@v0.7.0/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

interface StatusUpdateRequest {
  to: string
  shipmentData: any
  newStatus: string
}

const generateStatusUpdateEmailHtml = (
  shipmentData: any,
  newStatus: string
) => {
  const statusMessages = {
    pending: 'Your shipment is being prepared for pickup.',
    picked_up:
      'Your shipment has been picked up and is on its way to our facility.',
    in_transit: 'Your shipment is currently in transit to the destination.',
    out_for_delivery: 'Your shipment is out for delivery and will arrive soon!',
    delivered: 'Your shipment has been successfully delivered!',
    returned: 'Your shipment is being returned to the sender.',
  }

  const statusEmojis = {
    pending: '📦',
    picked_up: '🚚',
    in_transit: '✈️',
    out_for_delivery: '🚛',
    delivered: '✅',
    returned: '↩️',
  }

  const statusColor = {
    pending: '#f59e0b',
    picked_up: '#3b82f6',
    in_transit: '#8b5cf6',
    out_for_delivery: '#06b6d4',
    delivered: '#10b981',
    returned: '#ef4444',
  }

  const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:3000'

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Shipment Status Update -  EC WorldWide Service</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #2563eb, #7c3aed); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .status-box { background-color: ${
          statusColor[newStatus] || '#f59e0b'
        }20; border: 2px solid ${
    statusColor[newStatus] || '#f59e0b'
  }; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
        .status-emoji { font-size: 48px; margin-bottom: 10px; }
        .status-title { font-size: 24px; font-weight: bold; color: ${
          statusColor[newStatus] || '#f59e0b'
        }; margin: 10px 0; }
        .tracking-number { font-size: 20px; font-weight: bold; color: #2563eb; margin: 10px 0; font-family: monospace; }
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
          <h1>🚚  EC WorldWide Service</h1>
          <p>Shipment Status Update</p>
        </div>
        
        <div class="content">
          <div class="status-box">
            <div class="status-emoji">${statusEmojis[newStatus] || '📦'}</div>
            <div class="status-title">${newStatus
              .replace('_', ' ')
              .toUpperCase()}</div>
            <div class="tracking-number">${shipmentData.tracking_number}</div>
            <p>${
              statusMessages[newStatus] ||
              'Your shipment status has been updated.'
            }</p>
            <a href="${siteUrl}/track?number=${
    shipmentData.tracking_number
  }" class="btn">Track Your Package</a>
          </div>
          
          <div class="details-grid">
            <div class="detail-section">
              <div class="detail-title">📦 Package Details</div>
              <div class="detail-item">Description: ${
                shipmentData.package_description || 'N/A'
              }</div>
              <div class="detail-item">Weight: ${
                shipmentData.weight || 'N/A'
              }</div>
            </div>
            
            <div class="detail-section">
              <div class="detail-title">📍 Delivery Address</div>
              <div class="detail-item">To: ${shipmentData.receiver_name}</div>
              <div class="detail-item">Address: ${
                shipmentData.receiver_address
              }</div>
            </div>
          </div>
          
          <div class="detail-section">
            <div class="detail-title">ℹ️ What's Next?</div>
            ${
              newStatus === 'delivered'
                ? '<div class="detail-item">• Your package has been delivered successfully!</div><div class="detail-item">• Thank you for choosing  EC WorldWide Service</div>'
                : '<div class="detail-item">• You will receive further updates as your package progresses</div><div class="detail-item">• Track your package anytime using the link above</div>'
            }
            <div class="detail-item">• Contact us if you have any questions</div>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing  EC WorldWide Service!</p>
          <p>Questions? Contact us at support@ecwservices.sbs</p>
        </div>
      </div>
    </body>
    </html>
  `
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { to, shipmentData, newStatus }: StatusUpdateRequest =
      await req.json()

    console.log('Attempting to send status update email to:', to)

    // Generate status update email HTML
    const emailHtml = generateStatusUpdateEmailHtml(shipmentData, newStatus)

    // Get SMTP configuration from environment
    const smtpHost = Deno.env.get('SMTP_HOST')
    const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '587')
    const smtpUser = Deno.env.get('SMTP_USER')
    const smtpPass = Deno.env.get('SMTP_PASS')
    const smtpFrom = Deno.env.get('SMTP_FROM') || smtpUser

    if (!smtpHost || !smtpUser || !smtpPass) {
      throw new Error(
        'SMTP configuration missing. Please check your environment variables.'
      )
    }

    console.log('Status update email configuration:', {
      host: smtpHost,
      port: smtpPort,
      user: smtpUser,
      to: to,
      status: newStatus,
      tracking: shipmentData.tracking_number,
    })

    // Create SMTP client and send email
    const client = new SmtpClient()

    try {
      // Connect to SMTP server
      await client.connect({
        hostname: smtpHost,
        port: smtpPort,
        username: smtpUser,
        password: smtpPass,
      })
      console.log('SMTP connection successful')

      // Send status update email
      await client.send({
        from: smtpFrom!,
        to: to,
        subject: `Shipment Status Update: ${newStatus
          .replace('_', ' ')
          .toUpperCase()} - ${shipmentData.tracking_number}`,
        content: `Your shipment status has been updated to: ${newStatus}. Tracking number: ${shipmentData.tracking_number}`,
        html: emailHtml,
      })

      await client.close()
      console.log('Status update email sent successfully to:', to)
    } catch (smtpError: any) {
      console.error('SMTP error:', smtpError)
      await client.close()
      throw new Error(
        `Failed to send status update email: ${smtpError.message}`
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Status update email sent successfully',
        recipient: to,
        newStatus: newStatus,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    )
  } catch (error: any) {
    console.error('Error in send-status-update function:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    )
  }
}

serve(handler)
