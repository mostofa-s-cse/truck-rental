import nodemailer from 'nodemailer';
import { logError } from '../utils/logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    try {
      // Check if SMTP is configured
      if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('⚠️  SMTP configuration is missing. Email sending will be disabled.');
        console.warn('   Please configure SMTP settings in .env file');
        return;
      }

      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      console.log('✅ Email service initialized successfully');
    } catch (error) {
      logError(error, { operation: 'initialize_email_service' });
      console.error('❌ Failed to initialize email service:', error);
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      console.warn('⚠️  Email service not configured. Email not sent to:', options.to);
      return false;
    }

    try {
      const mailOptions = {
        from: `"${process.env.SMTP_FROM_NAME || 'Truck Rental Service'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.stripHtml(options.html),
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', info.messageId);
      return true;
    } catch (error) {
      logError(error, { 
        operation: 'send_email', 
        to: options.to, 
        subject: options.subject 
      });
      console.error('❌ Failed to send email:', error);
      return false;
    }
  }

  // Strip HTML tags for plain text version
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '');
  }

  // Send verification email
  async sendVerificationEmail(email: string, name: string, verificationToken: string): Promise<boolean> {
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(to right, #2563eb, #1e40af); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
          .button { display: inline-block; padding: 12px 30px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚚 Welcome to Truck Rental Service!</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>Thank you for registering with Truck Rental Service. We're excited to have you on board!</p>
            <p>To complete your registration and start using our services, please verify your email address by clicking the button below:</p>
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #2563eb;">${verificationUrl}</p>
            <p><strong>This verification link will expire in 24 hours.</strong></p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 14px;">If you didn't create an account with us, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Truck Rental Service. All rights reserved.</p>
            <p>Need help? Contact us at ${process.env.SMTP_FROM_EMAIL || 'support@truckrente.com'}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Verify Your Email Address - Truck Rental Service',
      html,
    });
  }

  // Send welcome email after verification
  async sendWelcomeEmail(email: string, name: string): Promise<boolean> {
    const dashboardUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(to right, #10b981, #059669); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
          .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .feature { background: #f0fdf4; padding: 15px; margin: 10px 0; border-left: 4px solid #10b981; border-radius: 5px; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Email Verified Successfully!</h1>
          </div>
          <div class="content">
            <h2>Welcome aboard, ${name}!</h2>
            <p>Your email has been verified successfully. You now have full access to all our features!</p>
            
            <h3>What you can do now:</h3>
            <div class="feature">
              <strong>🔍 Search Trucks</strong><br>
              Find the perfect truck for your transportation needs
            </div>
            <div class="feature">
              <strong>📅 Book Services</strong><br>
              Book trucks instantly with verified drivers
            </div>
            <div class="feature">
              <strong>⭐ Rate & Review</strong><br>
              Share your experience and help others make informed decisions
            </div>
            <div class="feature">
              <strong>📊 Track Bookings</strong><br>
              Monitor your bookings in real-time
            </div>

            <div style="text-align: center;">
              <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p>Need help getting started? Check out our <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/about">About Page</a> or <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/contact">Contact Us</a>.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Truck Rental Service. All rights reserved.</p>
            <p>Questions? Reach out to ${process.env.SMTP_FROM_EMAIL || 'support@truckrental.com'}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Welcome to Truck Rental Service! 🎉',
      html,
    });
  }

  // Send password reset email
  async sendPasswordResetEmail(email: string, name: string, resetToken: string): Promise<boolean> {
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(to right, #ef4444, #dc2626); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
          .button { display: inline-block; padding: 12px 30px; background: #ef4444; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fef2f2; padding: 15px; border-left: 4px solid #ef4444; border-radius: 5px; margin: 20px 0; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Password Reset Request</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>We received a request to reset your password for your Truck Rental Service account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #ef4444;">${resetUrl}</p>
            
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>This link will expire in 1 hour</li>
                <li>If you didn't request this, please ignore this email</li>
                <li>Your password will remain unchanged unless you click the link above</li>
              </ul>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 14px;">For security reasons, never share this link with anyone.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Truck Rental Service. All rights reserved.</p>
            <p>If you need assistance, contact us at ${process.env.SMTP_FROM_EMAIL || 'support@truckrental.com'}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: 'Password Reset Request - Truck Rental Service',
      html,
    });
  }

  // Send booking confirmation email
  async sendBookingConfirmationEmail(
    email: string,
    name: string,
    bookingDetails: {
      bookingId: string;
      driverName: string;
      truckType: string;
      source: string;
      destination: string;
      fare: number;
      pickupTime: string;
    }
  ): Promise<boolean> {
    const bookingUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/dashboard/user/bookings`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(to right, #2563eb, #1e40af); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; }
          .button { display: inline-block; padding: 12px 30px; background: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .booking-details { background: #f0f9ff; padding: 20px; border-radius: 5px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-label { font-weight: bold; color: #1e40af; }
          .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Booking Confirmed!</h1>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>Your booking has been confirmed successfully! Here are your booking details:</p>
            
            <div class="booking-details">
              <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span>${bookingDetails.bookingId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Driver:</span>
                <span>${bookingDetails.driverName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Truck Type:</span>
                <span>${bookingDetails.truckType}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Pickup Location:</span>
                <span>${bookingDetails.source}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Destination:</span>
                <span>${bookingDetails.destination}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Pickup Time:</span>
                <span>${new Date(bookingDetails.pickupTime).toLocaleString()}</span>
              </div>
              <div class="detail-row" style="border-bottom: none;">
                <span class="detail-label">Total Fare:</span>
                <span style="font-size: 20px; color: #10b981; font-weight: bold;">৳${bookingDetails.fare}</span>
              </div>
            </div>

            <div style="text-align: center;">
              <a href="${bookingUrl}" class="button">View Booking Details</a>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p><strong>What's Next?</strong></p>
            <ul>
              <li>The driver will contact you before pickup</li>
              <li>Track your booking in real-time through your dashboard</li>
              <li>Make sure to be ready at the pickup location</li>
            </ul>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Truck Rental Service. All rights reserved.</p>
            <p>Need help? Contact us at ${process.env.SMTP_FROM_EMAIL || 'support@truckrental.com'}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail({
      to: email,
      subject: `Booking Confirmed - ${bookingDetails.bookingId}`,
      html,
    });
  }
}

export const emailService = new EmailService();

