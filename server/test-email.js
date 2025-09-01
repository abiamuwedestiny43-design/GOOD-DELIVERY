const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

// Verify transporter configuration
const verifyTransporter = async (transporter) => {
  try {
    await transporter.verify();
    console.log('✓ Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error('✗ Error verifying email transporter:', error.message);
    return false;
  }
};

// Email endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    console.log('Attempting to send email from:', email);
    
    const transporter = createTransporter();
    const isVerified = await verifyTransporter(transporter);

    if (!isVerified) {
      return res.status(500).json({ message: 'Email service not configured properly' });
    }

    // Setup email data
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: process.env.CONTACT_EMAIL,
      subject: `New Contact Form: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Contact Form Submission</h2>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #2563eb;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="color: #64748b; font-size: 12px;">
            Sent from your website contact form at ${new Date().toLocaleString()}
          </p>
        </div>
      `,
      text: `New Contact Form Submission\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\nMessage:\n${message}`,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('✓ Email sent successfully:', info.messageId);

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('✗ Error sending email:', error.message);
    
    // More specific error messages
    if (error.code === 'EAUTH') {
      res.status(500).json({ message: 'Authentication failed. Check your email credentials.' });
    } else if (error.code === 'ECONNECTION') {
      res.status(500).json({ message: 'Connection to email server failed.' });
    } else {
      res.status(500).json({ message: 'Error sending email: ' + error.message });
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Email server is running',
    timestamp: new Date().toISOString()
  });
});

// Test email endpoint
app.post('/api/test-email', async (req, res) => {
  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: process.env.CONTACT_EMAIL,
      subject: 'Test Email from Server',
      text: 'This is a test email to verify your server configuration is working correctly.',
      html: '<p>This is a test email to verify your server configuration is working correctly.</p>'
    });
    
    console.log('✓ Test email sent:', info.messageId);
    res.json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('✗ Test email failed:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✓ Email server running on port ${PORT}`);
  console.log(`✓ SMTP User: ${process?.env?.SMTP_USER}`);
  console.log('✓ Health check available at: http://localhost:3001/api/health');
  console.log('✓ Test email endpoint: POST http://localhost:3001/api/test-email');
});
