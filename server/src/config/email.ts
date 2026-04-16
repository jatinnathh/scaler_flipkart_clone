import nodemailer from 'nodemailer';

// Create transporter lazily so env vars are guaranteed to be loaded
function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: 465,            // Direct SSL — avoids STARTTLS socket close on Render/Vercel
    secure: true,         // true for port 465
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000,  // 10s to establish connection
    greetingTimeout: 10000,    // 10s for server greeting
    socketTimeout: 15000,      // 15s for socket inactivity
    tls: {
      rejectUnauthorized: false,  // accept self-signed certs on cloud
    },
  });
}

// ---------- Send helper ----------

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️  SMTP_USER / SMTP_PASS not configured — skipping email.');
    return;
  }

  const transporter = getTransporter();

  await transporter.sendMail({
    from: `"Flipkart Clone" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });

  console.log(`📧 Email sent to ${to}`);
}

// ---------- Order confirmation email ----------

export async function sendOrderConfirmationEmail(to: string, order: {
  order_number: string;
  total: number;
  items: { product_name: string; quantity: number; price: number }[];
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  payment_method: string;
}) {
  const itemRows = order.items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.product_name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f3f6;">
      <div style="max-width: 600px; margin: 0 auto; background: white;">
        <!-- Header -->
        <div style="background: #2874F0; padding: 24px 32px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Flipkart</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 12px;">Order Confirmation</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px;">
          <div style="background: #f0f9f0; border-left: 4px solid #388E3C; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
            <h2 style="margin: 0 0 4px; color: #388E3C; font-size: 18px;">✅ Order Placed Successfully!</h2>
            <p style="margin: 0; color: #666; font-size: 14px;">Order #${order.order_number}</p>
          </div>

          <p style="color: #212121; font-size: 15px; line-height: 1.6;">
            Hi <strong>${order.shipping_name}</strong>,<br>
            Thank you for your order! We're getting it ready to be shipped. We'll notify you when it's on its way.
          </p>

          <!-- Items Table -->
          <h3 style="color: #212121; margin: 24px 0 12px; font-size: 16px; border-bottom: 2px solid #2874F0; padding-bottom: 8px;">
            Order Items
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 10px 12px; text-align: left; color: #878787;">Product</th>
                <th style="padding: 10px 12px; text-align: center; color: #878787;">Qty</th>
                <th style="padding: 10px 12px; text-align: right; color: #878787;">Price</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding: 14px 12px; text-align: right; font-weight: 700; font-size: 16px; color: #212121;">Total:</td>
                <td style="padding: 14px 12px; text-align: right; font-weight: 700; font-size: 16px; color: #388E3C;">₹${order.total.toLocaleString('en-IN')}</td>
              </tr>
            </tfoot>
          </table>

          <!-- Shipping Address -->
          <h3 style="color: #212121; margin: 24px 0 12px; font-size: 16px; border-bottom: 2px solid #2874F0; padding-bottom: 8px;">
            Delivery Address
          </h3>
          <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; font-size: 14px; color: #424242;">
            <strong>${order.shipping_name}</strong><br>
            ${order.shipping_address}<br>
            ${order.shipping_city}, ${order.shipping_state} - ${order.shipping_pincode}
          </div>

          <!-- Payment -->
          <p style="margin-top: 20px; padding: 12px 16px; background: #FFF3E0; border-radius: 8px; font-size: 14px; color: #E65100;">
            💳 Payment: <strong>${order.payment_method === 'cod' ? 'Cash on Delivery' : 'Paid via Razorpay'}</strong>
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f5f5f5; padding: 20px 32px; text-align: center; font-size: 12px; color: #878787;">
          <p style="margin: 0;">This is an automated email from Flipkart Clone.</p>
          <p style="margin: 4px 0 0;">Built as a Scaler Academy Assignment</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const subject = `Order Confirmed — ${order.order_number} | Flipkart Clone`;

  try {
    await sendEmail(to, subject, html);
    await logEmailToDb(to, subject, 'sent');
  } catch (error: any) {
    console.error('Failed to send order confirmation email:', error);
    await logEmailToDb(to, subject, 'failed', error.message);
    // Don't throw — email failure shouldn't break order placement
  }
}

// ---------- DB logging ----------

async function logEmailToDb(recipient: string, subject: string, status: 'sent' | 'failed', errorMessage?: string) {
  try {
    const { query: dbQuery } = await import('./db.js');
    await dbQuery(
      `INSERT INTO email_logs (recipient, subject, status, error_message) VALUES ($1, $2, $3, $4)`,
      [recipient, subject, status, errorMessage || null]
    );
  } catch (err) {
    // Silently fail — logging shouldn't break anything
    console.error('Failed to log email:', err);
  }
}
