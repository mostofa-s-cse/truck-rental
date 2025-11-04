# Email SMTP Configuration Guide

## Step 1: Install Required Package

Run this command in the server directory:

```bash
cd server
npm install nodemailer @types/nodemailer
```

If you get permission errors, try:
```bash
sudo chown -R $(whoami) ~/.npm
npm install nodemailer @types/nodemailer
```

---

## Step 2: Configure SMTP in .env File

Add these lines to your `server/.env` file:

### For Gmail (Recommended for Development):

```env
# SMTP Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password-here"
SMTP_FROM_NAME="Truck Rental Service"
SMTP_FROM_EMAIL="noreply@truckrental.com"

# Client URL (for email links)
CLIENT_URL="http://localhost:3000"
```

### How to Get Gmail App Password:

1. **Enable 2-Factor Authentication:**
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Enter "Truck Rental App"
   - Click "Generate"
   - Copy the 16-character password
   - Paste it as `SMTP_PASS` in your .env file

---

## Step 3: Alternative SMTP Providers

### Outlook/Hotmail:
```env
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@outlook.com"
SMTP_PASS="your-password"
```

### Yahoo Mail:
```env
SMTP_HOST="smtp.mail.yahoo.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@yahoo.com"
SMTP_PASS="your-app-password"
```

### SendGrid (Professional):
```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
```

**Get SendGrid API Key:**
- Sign up at https://sendgrid.com
- Free tier: 100 emails/day
- Go to Settings → API Keys → Create API Key

### Mailgun (Professional):
```env
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="postmaster@your-domain.mailgun.org"
SMTP_PASS="your-mailgun-smtp-password"
```

**Get Mailgun Credentials:**
- Sign up at https://mailgun.com
- Free tier: 5,000 emails/month
- Get SMTP credentials from dashboard

---

## Step 4: Restart Server

After configuring SMTP, restart your server:

```bash
cd server
npm run dev
```

You should see:
```
✅ Email service initialized successfully
```

If SMTP is not configured, you'll see:
```
⚠️  SMTP configuration is missing. Email sending will be disabled.
```

---

## Step 5: Test Email Sending

### Test Registration Email:

1. Register a new user at `http://localhost:3000/register`
2. Check the email inbox (including spam folder)
3. You should receive a verification email

### Test from Server Console:

Create a test file `server/test-email.ts`:

```typescript
import { emailService } from './src/services/emailService';
import dotenv from 'dotenv';

dotenv.config();

async function testEmail() {
  console.log('Testing email service...');
  
  const result = await emailService.sendVerificationEmail(
    'test@example.com',  // Replace with your email
    'Test User',
    'test-token-12345'
  );
  
  console.log('Email sent:', result);
  process.exit(0);
}

testEmail();
```

Run the test:
```bash
cd server
npx ts-node test-email.ts
```

---

## Email Templates Included:

### 1. **Verification Email** (On Registration)
- Welcome message
- Verification link (valid for 24 hours)
- Professional design with branding

### 2. **Welcome Email** (After Verification)
- Confirmation of successful verification
- Overview of features
- Call-to-action to dashboard

### 3. **Password Reset Email**
- Secure reset link (valid for 1 hour)
- Security warnings
- Instructions

### 4. **Booking Confirmation Email**
- Booking details (ID, driver, route, fare)
- Pickup information
- Link to track booking

---

## Email Features:

✅ **Professional HTML Templates**
- Responsive design
- Mobile-friendly
- Consistent branding
- Clear call-to-action buttons

✅ **Security**
- Token-based verification
- Expiration times
- Secure links

✅ **Error Handling**
- Graceful fallback if SMTP not configured
- Detailed logging
- Error notifications

✅ **Plain Text Fallback**
- Auto-generated from HTML
- Ensures deliverability

---

## Troubleshooting:

### Issue: "Email service not configured"

**Solution:**
1. Check `.env` file has all SMTP_* variables
2. Restart server after adding variables
3. Check for typos in variable names

### Issue: "Authentication failed"

**Solution:**
1. **Gmail:** Use App Password, not regular password
2. **Gmail:** Enable 2-Factor Authentication first
3. **Other providers:** Check username/password are correct

### Issue: Emails go to spam

**Solution:**
1. Use a professional "From" email address
2. Don't use ALL CAPS in subject lines
3. Include unsubscribe link (for production)
4. Use a real domain email (not Gmail) for production
5. Set up SPF, DKIM, and DMARC records (for production)

### Issue: "Connection timeout"

**Solution:**
1. Check SMTP_HOST is correct
2. Check SMTP_PORT (usually 587 or 465)
3. Check firewall isn't blocking the port
4. Try SMTP_PORT="465" and SMTP_SECURE="true"

### Issue: Emails not sending

**Solution:**
1. Check server logs for errors
2. Verify SMTP credentials are correct
3. Test with a different email provider
4. Check email quota (free tiers have limits)

---

## Production Recommendations:

### 1. Use Professional Email Service:
- **SendGrid** - 100 emails/day free
- **Mailgun** - 5,000 emails/month free
- **AWS SES** - 62,000 emails/month free (if hosted on AWS)

### 2. Use Custom Domain Email:
```env
SMTP_FROM_NAME="Truck Rental Service"
SMTP_FROM_EMAIL="noreply@yourdomain.com"
```

### 3. Set Up Email Authentication:
- SPF Record
- DKIM Signature
- DMARC Policy

### 4. Monitor Email Delivery:
- Track bounce rates
- Monitor spam reports
- Set up alerts for failures

### 5. Add Rate Limiting:
- Limit verification email resends
- Prevent email spam
- Use queue for bulk emails

---

## Email Service API:

### Send Verification Email:
```typescript
import { emailService } from './services/emailService';

await emailService.sendVerificationEmail(
  'user@example.com',
  'John Doe',
  'verification-token-123'
);
```

### Send Welcome Email:
```typescript
await emailService.sendWelcomeEmail(
  'user@example.com',
  'John Doe'
);
```

### Send Password Reset:
```typescript
await emailService.sendPasswordResetEmail(
  'user@example.com',
  'John Doe',
  'reset-token-456'
);
```

### Send Booking Confirmation:
```typescript
await emailService.sendBookingConfirmationEmail(
  'user@example.com',
  'John Doe',
  {
    bookingId: 'BK123456',
    driverName: 'Driver Name',
    truckType: 'PICKUP',
    source: 'Dhaka',
    destination: 'Chittagong',
    fare: 5000,
    pickupTime: '2024-01-15T10:00:00Z'
  }
);
```

### Send Custom Email:
```typescript
await emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Your Subject',
  html: '<h1>Your HTML Content</h1>',
  text: 'Plain text version' // optional
});
```

---

## Security Best Practices:

1. **Never commit .env file** - It's already in .gitignore
2. **Use App Passwords** - Don't use your main email password
3. **Rotate credentials regularly** - Especially in production
4. **Use environment-specific configs** - Different SMTP for dev/staging/prod
5. **Monitor for suspicious activity** - Track email sending patterns
6. **Implement rate limiting** - Prevent email abuse
7. **Validate email addresses** - Before sending
8. **Use HTTPS links** - In all email templates

---

## Testing Checklist:

- [ ] SMTP credentials added to `.env`
- [ ] Server restarted after adding credentials
- [ ] Email service shows "✅ initialized successfully"
- [ ] Register new user
- [ ] Verification email received
- [ ] Click verification link works
- [ ] Welcome email received after verification
- [ ] Email templates look good on mobile
- [ ] Email templates look good on desktop
- [ ] Links in emails work correctly
- [ ] Plain text version is readable

---

## Support:

If you encounter issues:
1. Check server logs in `server/logs/`
2. Verify SMTP credentials are correct
3. Try a different email provider
4. Check email provider's status page
5. Review this guide's troubleshooting section

---

**Created:** After email service implementation
**Last Updated:** Latest version

