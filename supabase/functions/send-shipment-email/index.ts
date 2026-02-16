import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
  shipmentData?: Record<string, unknown>;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, html }: EmailRequest = await req.json();

    console.log("Attempting to send email to:", to);

    // Get SMTP configuration from environment
    const smtpHost = Deno.env.get("SMTP_HOST");
    const smtpPort = parseInt(Deno.env.get("SMTP_PORT") || "587");
    const smtpUser = Deno.env.get("SMTP_USER");
    const smtpPass = Deno.env.get("SMTP_PASS");
    const smtpFrom = Deno.env.get("SMTP_FROM") || smtpUser;

    if (!smtpHost || !smtpUser || !smtpPass) {
      throw new Error("SMTP configuration missing. Please check your environment variables.");
    }

    console.log("Email configuration:", {
      host: smtpHost,
      port: smtpPort,
      user: smtpUser,
      to: to,
      subject: subject
    });

    // Create SMTP client and send email
    const client = new SmtpClient();

    try {
      // Connect to SMTP server
      await client.connect({
        hostname: smtpHost,
        port: smtpPort,
        username: smtpUser,
        password: smtpPass,
      });
      console.log("SMTP connection successful");

      // Send email
      await client.send({
        from: smtpFrom!,
        to: to,
        subject: subject,
        content: "HTML content - please view in an HTML-enabled email client",
        html: html,
      });

      await client.close();
      console.log("Email sent successfully to:", to);

    } catch (smtpError: unknown) {
      const errorMessage = smtpError instanceof Error ? smtpError.message : String(smtpError);
      console.error("SMTP error:", smtpError);
      await client.close();
      throw new Error(`Failed to send email: ${errorMessage}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully",
        recipient: to
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in send-shipment-email function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);