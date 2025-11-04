# Quick Email Setup - Next Steps

## ✅ Already Done:
- [x] `nodemailer` package installed
- [x] Email service created
- [x] Auth service updated
- [x] Server ready

---

## 🚀 Next Steps:

### Step 1: Add SMTP Configuration to `.env`

Open `server/.env` and add these lines:

```env
# SMTP Email Configuration (Gmail Example)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-gmail-app-password"
SMTP_FROM_NAME="Truck Rental Service"
SMTP_FROM_EMAIL="noreply@truckrental.com"

# Client URL for email links
CLIENT_URL="http://localhost:3000"
```

### Step 2: Get Gmail App Password

**Quick Instructions:**
1. Go to: https://myaccount.google.com/security
2. Enable **2-Step Verification**
3. Go to: https://myaccount.google.com/apppasswords
4. Select: **Mail** → **Other (Custom name)**
5. Name it: **Truck Rental App**
6. Click **Generate**
7. Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)
8. Paste it as `SMTP_PASS` in your `.env` file (remove spaces)

### Step 3: Restart Server

```bash
cd server
npm run dev
```

### Step 4: Check Console

You should see:
```
✅ Email service initialized successfully
```

If you see:
```
⚠️  SMTP configuration is missing. Email sending will be disabled.
```
Then double-check your `.env` file has all SMTP_* variables.

---

## 🧪 Test It:

1. **Register New User:**
   - Go to: `http://localhost:3000/register`
   - Fill in the form
   - Click "Register"

2. **Check Email:**
   - Check your inbox (and spam folder)
   - You should receive: **"Verify Your Email Address"**
   - Click the verification link

3. **Verify Email:**
   - You'll be redirected to verification page
   - Check email again
   - You should receive: **"Email Verified Successfully!"**

---

## 📧 What Emails Are Sent:

### 1. Registration → Verification Email
```
Subject: Verify Your Email Address - Truck Rental Service
Link Expires: 24 hours
```

### 2. After Verification → Welcome Email
```
Subject: Welcome to Truck Rental Service! 🎉
Features overview and dashboard link
```

### 3. Resend Verification → Verification Email
```
Subject: Verify Your Email Address - Truck Rental Service
New token generated
```

---

## 🔧 Alternative: Use Without Email

If you don't want to set up email right now:

1. **Skip SMTP configuration** - Don't add SMTP_* to `.env`
2. **Server will work** - But emails won't be sent
3. **Check console logs** - Verification URLs will be printed:
   ```
   Verification URL: http://localhost:3000/verify-email?token=abc123...
   ```
4. **Copy the link** - Manually paste it in browser to verify

---

## 🐛 Troubleshooting:

### Error: "Authentication failed"
- **Gmail:** Make sure you're using **App Password**, not your regular password
- **Gmail:** 2-Step Verification must be enabled first

### Error: "Connection timeout"
- Check your internet connection
- Check firewall isn't blocking port 587
- Try changing `SMTP_PORT` to "465" and `SMTP_SECURE` to "true"

### Emails go to spam
- Normal for development with Gmail
- In production, use professional email service (SendGrid, Mailgun)

### Error: "Email service not configured"
- Check `.env` file has all SMTP_* variables
- No spaces around the `=` sign
- No quotes needed (unless value contains spaces)
- Restart server after adding variables

---

## 📚 Full Documentation:

For more details, check:
- `EMAIL_SMTP_SETUP_GUIDE.md` - Complete setup guide
- Alternative SMTP providers (SendGrid, Mailgun, etc.)
- Production recommendations
- Security best practices

---

## ✅ Verification Checklist:

- [ ] Added SMTP configuration to `server/.env`
- [ ] Generated Gmail App Password
- [ ] Restarted server
- [ ] Saw "Email service initialized" in console
- [ ] Registered test user
- [ ] Received verification email
- [ ] Clicked verification link
- [ ] Received welcome email
- [ ] Successfully logged in

---

**Need Help?** Check the server console logs at `server/logs/` for detailed error messages.

**Created:** After nodemailer installation

