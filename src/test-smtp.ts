import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const testSMTP = async () => {
  const client = new SmtpClient();
  
  try {
    console.log("Testing SMTP connection to Gmail...");
    
    await client.connect({
      hostname: "smtp.gmail.com",
      port: 587,
      username: "anugrahruthmasih@gmail.com",
      password: "fatwpsmndchlzyow", // Your App Password
    });

    console.log("✅ SMTP connection successful!");

    await client.send({
      from: "anugrahruthmasih@gmail.com",
      to: "test@example.com", // Replace with your test email
      subject: "SMTP Test Email",
      content: "This is a test email to verify SMTP configuration is working.",
    });

    await client.close();
    
    console.log("✅ Test email sent successfully!");
    
  } catch (error: any) {
    console.error("❌ SMTP test failed:", error.message);
    await client.close();
  }
};

testSMTP();
