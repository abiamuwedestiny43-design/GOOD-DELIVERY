const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Create a single global transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// ✅ Verify transporter once
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Mail server not ready:', error);
  } else {
    console.log('✅ Mail server ready to send emails');
  }
});

// Contact form email endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const mailOptions = {
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to: process.env.CONTACT_EMAIL || process.env.SMTP_USER,
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p>Sent from your website contact form</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('❌ Error sending contact form email:', error);

    if (error.code === 'EAUTH') {
      res.status(500).json({ message: 'Authentication failed. Check your email credentials.' });
    } else if (error.code === 'ECONNECTION') {
      res.status(500).json({ message: 'Connection to email server failed.' });
    } else {
      res.status(500).json({ message: 'Error sending email' });
    }
  }
});

// Shipment email endpoint
app.post('/api/send-shipment-email', async (req, res) => {
  try {
    const { to, shipment } = req.body;

    if (!to || !shipment) {
      return res.status(400).json({ message: 'Missing email or shipment data' });
    }

    const emailHtml = `
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
              <div class="tracking-number">${shipment.tracking_number}</div>
              <p>Use this number to track your package online</p>
              <a href="https://www.frangilesfasts.online/tracking?number=${shipment.tracking_number}" class="btn">Track Your Package</a>
            </div>
            
            <div class="details-grid">
              <div class="detail-section">
                <div class="detail-title">📦 Package Details</div>
                <div class="detail-item">Weight: ${shipment.weight || 'N/A'}</div>
                <div class="detail-item">Description: ${shipment.package_description || 'N/A'}</div>
                <div class="detail-item">Service: ${shipment.service_type || 'Standard'}</div>
              </div>
              
              <div class="detail-section">
                <div class="detail-title">📍 Delivery Details</div>
                <div class="detail-item">To: ${shipment.receiver_name}</div>
                <div class="detail-item">Address: ${shipment.receiver_address}</div>
                <div class="detail-item">Phone: ${shipment.receiver_phone || 'N/A'}</div>
              </div>
            </div>
            
            <div class="detail-section">
              <div class="detail-title">ℹ️ What's Next?</div>
              <div class="detail-item">• Your package will be dispatched within 24 hours</div>
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

    await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to,
      subject: `📦 Shipment ${shipment.tracking_number} Created - Frangiles Fasts Logistics`,
      html: emailHtml,
    });

    res.status(200).json({ message: 'Shipment email sent successfully' });
  } catch (error) {
    console.error('❌ Error sending shipment email:', error);
    res.status(500).json({ message: 'Failed to send shipment email' });
  }
});

// Shipment update email endpoint
app.post('/api/send-shipment-update-email', async (req, res) => {
  try {
    const { to, shipment, trackingEvent } = req.body;

    if (!to || !shipment || !trackingEvent) {
      return res.status(400).json({ message: 'Missing email, shipment, or tracking event data' });
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Shipment Update - Frangiles Fasts Logistics</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #16a34a, #15803d); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .tracking-box { background-color: #ecfdf5; border: 2px solid #16a34a; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
          .tracking-number { font-size: 24px; font-weight: bold; color: #16a34a; margin: 10px 0; font-family: monospace; }
          .detail-section { background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .detail-title { font-weight: bold; color: #374151; margin-bottom: 10px; }
          .detail-item { margin: 5px 0; color: #6b7280; }
          .footer { background-color: #374151; color: white; padding: 20px; text-align: center; }
          .btn { background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📦 Shipment Update</h1>
            <p>Your package status has changed!</p>
          </div>
          
          <div class="content">
            <div class="tracking-box">
              <h2>Tracking Number</h2>
              <div class="tracking-number">${shipment.tracking_number}</div>
              <p>Status: <strong>${trackingEvent.status}</strong></p>
              <p>Current Location: <strong>${trackingEvent.location || 'N/A'}</strong></p>
              <a href="https://www.frangilesfasts.online/tracking?number=${shipment.tracking_number}" class="btn">Track Your Package</a>
            </div>

            <div class="detail-section">
              <div class="detail-title">📜 Update Details</div>
              <div class="detail-item">${trackingEvent.description}</div>
              <div class="detail-item">Updated: ${new Date(trackingEvent.created_at).toLocaleString()}</div>
            </div>

            <div class="detail-section">
              <div class="detail-title">Receiver</div>
              <div class="detail-item">Name: ${shipment.receiver_name}</div>
              <div class="detail-item">Address: ${shipment.receiver_address}</div>
            </div>
          </div>
          
          <div class="footer">
            <p>Thanks for using Frangiles Fasts Logistics!</p>
            <p>Need help? Contact support@frangilesfasts.online</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to,
      subject: `📦 Shipment Update - ${shipment.tracking_number}`,
      html: emailHtml,
    });

    res.status(200).json({ message: 'Shipment update email sent successfully' });
  } catch (error) {
    console.error('❌ Error sending shipment update email:', error);
    res.status(500).json({ message: 'Failed to send shipment update email' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Email server running on port ${PORT}`);
  console.log('Make sure your .env file is properly configured with email credentials');
});
