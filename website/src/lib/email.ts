// Brevo (Sendinblue) Email Service
// Documentation: https://developers.brevo.com/

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_API_URL = 'https://api.brevo.com/v3';

// Default sender info
const DEFAULT_SENDER = {
  name: process.env.BREVO_SENDER_NAME || 'Atomic Tawk',
  email: process.env.BREVO_SENDER_EMAIL || 'noreply@atomictawk.com',
};

// Newsletter list ID (create this in Brevo dashboard)
const NEWSLETTER_LIST_ID = parseInt(process.env.BREVO_NEWSLETTER_LIST_ID || '2');

interface EmailOptions {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  sender?: { name: string; email: string };
  replyTo?: { email: string; name?: string };
  tags?: string[];
}

interface ContactOptions {
  email: string;
  firstName?: string;
  lastName?: string;
  attributes?: Record<string, any>;
  listIds?: number[];
  updateEnabled?: boolean;
}

// Check if Brevo is configured
export function isBrevoConfigured(): boolean {
  return !!BREVO_API_KEY;
}

// Send a transactional email
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!BREVO_API_KEY) {
    console.log('Brevo not configured, skipping email send');
    return { success: false, error: 'Brevo API key not configured' };
  }

  try {
    const requestBody = {
      sender: options.sender || DEFAULT_SENDER,
      to: options.to,
      subject: options.subject,
      htmlContent: options.htmlContent,
      textContent: options.textContent,
      replyTo: options.replyTo,
      tags: options.tags,
    };
    
    console.log('Brevo sendEmail request:', {
      sender: requestBody.sender,
      to: requestBody.to,
      subject: requestBody.subject,
      tags: requestBody.tags,
    });
    
    const response = await fetch(`${BREVO_API_URL}/smtp/email`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Brevo sendEmail response status:', response.status);
    
    const text = await response.text();
    console.log('Brevo sendEmail response body:', text);
    
    let data: any = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.log('Could not parse email response as JSON');
      }
    }

    if (!response.ok) {
      console.error('Brevo email error:', data);
      return { success: false, error: data.message || 'Failed to send email' };
    }

    console.log('Brevo email sent successfully, messageId:', data.messageId);
    return { success: true, messageId: data.messageId };
  } catch (error) {
    console.error('Brevo email error:', error);
    return { success: false, error: 'Failed to send email' };
  }
}

// Add or update a contact in Brevo
export async function addContact(options: ContactOptions): Promise<{ success: boolean; error?: string }> {
  if (!BREVO_API_KEY) {
    console.log('Brevo not configured, skipping contact add');
    return { success: false, error: 'Brevo API key not configured' };
  }

  try {
    const requestBody = {
      email: options.email,
      attributes: {
        FIRSTNAME: options.firstName,
        LASTNAME: options.lastName,
        ...options.attributes,
      },
      listIds: options.listIds || [NEWSLETTER_LIST_ID],
      updateEnabled: options.updateEnabled ?? true,
    };
    
    console.log('Brevo addContact request:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(`${BREVO_API_URL}/contacts`, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Brevo addContact response status:', response.status);
    
    // Handle successful responses (201 Created often has no body)
    if (response.status === 201 || response.status === 204) {
      console.log('Brevo contact added successfully');
      return { success: true };
    }

    // Try to parse response body
    const text = await response.text();
    console.log('Brevo addContact response body:', text);
    
    let data: any = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.log('Could not parse response as JSON');
      }
    }

    if (!response.ok) {
      // Contact already exists is not really an error
      if (data.code === 'duplicate_parameter') {
        console.log('Contact already exists, treating as success');
        return { success: true };
      }
      console.error('Brevo contact error:', data);
      return { success: false, error: data.message || `Failed to add contact (${response.status})` };
    }

    return { success: true };
  } catch (error) {
    console.error('Brevo contact error:', error);
    return { success: false, error: 'Failed to add contact' };
  }
}

// Subscribe to newsletter
export async function subscribeToNewsletter(
  email: string, 
  name?: string,
  source?: string
): Promise<{ success: boolean; error?: string }> {
  // Add to Brevo contact list
  const result = await addContact({
    email,
    firstName: name,
    attributes: {
      SOURCE: source || 'website',
      SUBSCRIBED_AT: new Date().toISOString(),
    },
    listIds: [NEWSLETTER_LIST_ID],
  });

  if (result.success) {
    // Send welcome email
    console.log('Sending welcome email to:', email);
    const emailResult = await sendWelcomeEmail(email, name);
    console.log('Welcome email result:', emailResult);
  }

  return result;
}

// Send welcome email to new subscriber
export async function sendWelcomeEmail(email: string, name?: string): Promise<{ success: boolean; error?: string }> {
  const firstName = name || 'Mate';
  console.log('sendWelcomeEmail called for:', email);
  
  const result = await sendEmail({
    to: [{ email, name }],
    subject: 'Welcome to Atomic Tawk - You\'re In!',
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #E3E2D5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
          .header { background-color: #353535; padding: 30px; text-align: center; border-bottom: 8px solid #CCAA4C; }
          .header img { max-width: 200px; }
          .header h1 { color: #CCAA4C; font-size: 28px; margin: 20px 0 0; text-transform: uppercase; letter-spacing: 2px; }
          .content { padding: 40px 30px; }
          .content h2 { color: #353535; font-size: 24px; margin-bottom: 20px; }
          .content p { color: #666; line-height: 1.6; margin-bottom: 15px; }
          .button { display: inline-block; background-color: #CCAA4C; color: #353535; padding: 15px 30px; text-decoration: none; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin: 20px 0; }
          .footer { background-color: #353535; padding: 20px; text-align: center; }
          .footer p { color: #AEACA1; font-size: 12px; margin: 5px 0; }
          .stamp { color: #FF6B35; font-weight: bold; text-transform: uppercase; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Atomic Tawk</h1>
          </div>
          <div class="content">
            <h2>G'day ${firstName}!</h2>
            <p>Welcome to the <span class="stamp">Atomic Tawk</span> broadcast network. You're now officially part of the crew.</p>
            <p>Here's what you can expect:</p>
            <ul style="color: #666; line-height: 1.8;">
              <li>🔧 Weekly mechanical updates and shed tips</li>
              <li>🚗 First access to new burnout content</li>
              <li>🎮 Gaming session announcements</li>
              <li>🛒 Exclusive deals on merch and gear</li>
            </ul>
            <p>In the meantime, check out our latest content:</p>
            <a href="https://atomictawk.com/shows" class="button">Browse Shows →</a>
            <p style="margin-top: 30px; font-size: 14px; color: #999;">
              Stay tuned. Keep your engine humming.<br>
              – The Atomic Tawk Crew
            </p>
          </div>
          <div class="footer">
            <p>Atomic Tawk Media | Broadcasting since the atomic age</p>
            <p>You received this because you subscribed at atomictawk.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
    textContent: `
G'day ${firstName}!

Welcome to the Atomic Tawk broadcast network. You're now officially part of the crew.

Here's what you can expect:
- Weekly mechanical updates and shed tips
- First access to new burnout content
- Gaming session announcements
- Exclusive deals on merch and gear

Check out our latest content at: https://atomictawk.com/shows

Stay tuned. Keep your engine humming.
– The Atomic Tawk Crew
    `,
    tags: ['welcome', 'newsletter'],
  });
  
  console.log('sendWelcomeEmail result:', result);
  return result;
}

// Send contact form notification
export async function sendContactFormEmail(
  formData: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }
): Promise<{ success: boolean; error?: string }> {
  // Send notification to admin
  const adminResult = await sendEmail({
    to: [{ email: process.env.CONTACT_FORM_EMAIL || 'hello@atomictawk.com' }],
    subject: `[Contact Form] ${formData.subject}`,
    replyTo: { email: formData.email, name: formData.name },
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #fff; border: 1px solid #ddd; }
          .header { background: #353535; color: #CCAA4C; padding: 20px; }
          .content { padding: 20px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; }
          .value { color: #333; margin-top: 5px; }
          .message { background: #f9f9f9; padding: 15px; border-left: 4px solid #CCAA4C; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">New Contact Form Submission</h2>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">From</div>
              <div class="value">${formData.name} &lt;${formData.email}&gt;</div>
            </div>
            <div class="field">
              <div class="label">Subject</div>
              <div class="value">${formData.subject}</div>
            </div>
            <div class="field">
              <div class="label">Message</div>
              <div class="message">${formData.message.replace(/\n/g, '<br>')}</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    textContent: `
New Contact Form Submission

From: ${formData.name} <${formData.email}>
Subject: ${formData.subject}

Message:
${formData.message}
    `,
    tags: ['contact-form'],
  });

  // Send confirmation to user
  await sendEmail({
    to: [{ email: formData.email, name: formData.name }],
    subject: 'We received your message - Atomic Tawk',
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #E3E2D5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #fff; }
          .header { background: #353535; padding: 30px; text-align: center; border-bottom: 8px solid #CCAA4C; }
          .header h1 { color: #CCAA4C; margin: 0; }
          .content { padding: 30px; }
          .footer { background: #353535; padding: 20px; text-align: center; color: #AEACA1; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Message Received</h1>
          </div>
          <div class="content">
            <p>G'day ${formData.name},</p>
            <p>Thanks for reaching out to Atomic Tawk HQ. We've received your transmission and will get back to you within 48 hours.</p>
            <p>Your message reference: <strong>${formData.subject}</strong></p>
            <p style="margin-top: 30px;">
              Cheers,<br>
              The Atomic Tawk Crew
            </p>
          </div>
          <div class="footer">
            <p>Atomic Tawk Media</p>
          </div>
        </div>
      </body>
      </html>
    `,
    textContent: `
G'day ${formData.name},

Thanks for reaching out to Atomic Tawk HQ. We've received your transmission and will get back to you within 48 hours.

Your message reference: ${formData.subject}

Cheers,
The Atomic Tawk Crew
    `,
    tags: ['contact-confirmation'],
  });

  return adminResult;
}

// Send order confirmation email
export async function sendOrderConfirmationEmail(
  order: {
    orderNumber: string;
    email: string;
    name: string;
    items: { name: string; quantity: number; price: number; variant?: string }[];
    total: number;
    shippingAddress?: any;
  }
): Promise<{ success: boolean; error?: string }> {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        ${item.name}${item.variant ? ` (${item.variant})` : ''}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${(item.price / 100).toFixed(2)}</td>
    </tr>
  `).join('');

  return sendEmail({
    to: [{ email: order.email, name: order.name }],
    subject: `Order Confirmed - ${order.orderNumber}`,
    htmlContent: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background-color: #E3E2D5; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background: #fff; }
          .header { background: #353535; padding: 30px; text-align: center; border-bottom: 8px solid #CCAA4C; }
          .header h1 { color: #CCAA4C; margin: 0; font-size: 24px; }
          .content { padding: 30px; }
          .order-number { background: #CCAA4C; color: #353535; padding: 10px 20px; display: inline-block; font-weight: bold; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #353535; color: #fff; padding: 10px; text-align: left; }
          .total { font-size: 20px; font-weight: bold; color: #353535; }
          .footer { background: #353535; padding: 20px; text-align: center; color: #AEACA1; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed!</h1>
          </div>
          <div class="content">
            <p>G'day ${order.name},</p>
            <p>Thanks for your order! We're getting it ready for dispatch.</p>
            
            <div class="order-number">Order: ${order.orderNumber}</div>
            
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" style="padding: 15px 10px; text-align: right; font-weight: bold;">Total:</td>
                  <td style="padding: 15px 10px; text-align: right;" class="total">$${(order.total / 100).toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
            
            <p>We'll send you a shipping confirmation once your order is on its way.</p>
            
            <p style="margin-top: 30px;">
              Cheers,<br>
              The Atomic Tawk Crew
            </p>
          </div>
          <div class="footer">
            <p>Atomic Tawk Media | <a href="https://atomictawk.com/store" style="color: #CCAA4C;">Shop</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    tags: ['order-confirmation'],
  });
}
