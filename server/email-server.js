const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Email transporter configuration with better error handling
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail', // Use service instead of host/port for Gmail
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
    console.log('Server is ready to take our messages');
    return true;
  } catch (error) {
    console.error('Error verifying transporter:', error);
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

    const transporter = createTransporter();
    const isVerified = await verifyTransporter(transporter);

    if (!isVerified) {
      return res.status(500).json({ message: 'Email service not configured properly' });
    }

    // Setup email data
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

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    
    // More specific error messages
    if (error.code === 'EAUTH') {
      res.status(500).json({ message: 'Authentication failed. Check your email credentials.' });
    } else if (error.code === 'ECONNECTION') {
      res.status(500).json({ message: 'Connection to email server failed.' });
    } else {
      res.status(500).json({ message: 'Error sending email' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Email server running on port ${PORT}`);
  console.log('Make sure your .env file is properly configured with email credentials');
});
