# SSLCommerz Payment Gateway Integration

This document provides instructions for setting up SSLCommerz payment gateway integration for the truck booking system.

## Prerequisites

1. SSLCommerz merchant account (sandbox or live)
2. Store ID and Store Password from SSLCommerz
3. Node.js and npm installed
4. Database setup with Prisma

## Environment Variables

Add the following environment variables to your `.env` file:

```env
# SSLCommerz Configuration
SSLCOMMERZ_STORE_ID=your_store_id_here
SSLCOMMERZ_STORE_PASSWORD=your_store_password_here

# For sandbox testing (development)
NODE_ENV=development

# For production
NODE_ENV=production
```

## SSLCommerz Account Setup

### 1. Sandbox Account (Development)
1. Visit [SSLCommerz Sandbox](https://developer.sslcommerz.com/)
2. Create a sandbox account
3. Get your sandbox Store ID and Store Password
4. Use these credentials for testing

### 2. Live Account (Production)
1. Visit [SSLCommerz](https://sslcommerz.com/)
2. Apply for a merchant account
3. Complete the verification process
4. Get your live Store ID and Store Password

## Payment Flow

### 1. Booking Creation
- User searches for trucks
- Selects a driver and clicks "Book Now"
- Fills booking details (source, destination, pickup time)
- System calculates fare based on distance and truck type

### 2. Payment Processing
- User fills payment information
- System creates payment session with SSLCommerz
- User is redirected to SSLCommerz payment gateway
- User completes payment using various methods:
  - Credit/Debit Cards
  - Mobile Banking
  - Internet Banking
  - Cash on Delivery

### 3. Payment Callbacks
- **Success**: User is redirected to success page
- **Failure**: User is redirected to failure page
- **Cancel**: User is redirected to cancellation page
- **IPN**: Server receives instant payment notification

## API Endpoints

### Server-side Endpoints

```
POST /api/v1/payments/session
- Create payment session with SSLCommerz

POST /api/v1/payments/validate
- Validate payment after completion

GET /api/v1/payments/status/:bookingId
- Get payment status for a booking

POST /api/v1/payments/refund/:bookingId
- Process payment refund

GET /api/v1/payments/success
- Handle successful payment callback

GET /api/v1/payments/fail
- Handle failed payment callback

GET /api/v1/payments/cancel
- Handle cancelled payment callback

POST /api/v1/payments/ipn
- Handle instant payment notification
```

### Client-side API Routes

```
GET /api/payment/success
- Redirect to user dashboard with success parameters

GET /api/payment/fail
- Redirect to user dashboard with failure parameters

GET /api/payment/cancel
- Redirect to user dashboard with cancellation parameters

POST /api/payment/ipn
- Forward IPN data to server
```

## Payment Methods Supported

1. **Credit/Debit Cards**
   - Visa
   - MasterCard
   - American Express

2. **Mobile Banking**
   - bKash
   - Nagad
   - Rocket
   - Upay

3. **Internet Banking**
   - All major Bangladeshi banks

4. **Cash on Delivery**
   - Available for eligible orders

## Testing

### Sandbox Testing
1. Use sandbox credentials
2. Use test card numbers provided by SSLCommerz
3. Test all payment methods
4. Verify callbacks work correctly

### Test Card Numbers
```
Visa: 4111111111111111
MasterCard: 5555555555554444
Expiry: Any future date
CVV: Any 3 digits
```

## Security Considerations

1. **HTTPS Required**: All payment communications must use HTTPS
2. **Store Credentials**: Keep store ID and password secure
3. **IPN Validation**: Always validate IPN data
4. **Transaction Logging**: Log all payment transactions
5. **Error Handling**: Implement proper error handling

## Error Handling

### Common Errors
1. **Invalid Store ID/Password**: Check credentials
2. **Network Issues**: Implement retry logic
3. **Invalid Amount**: Ensure amount format is correct
4. **Callback Failures**: Monitor callback URLs

### Debugging
1. Check server logs for payment errors
2. Verify SSLCommerz dashboard for transaction status
3. Test with sandbox environment first
4. Monitor IPN delivery

## Production Deployment

### 1. Environment Setup
```env
NODE_ENV=production
SSLCOMMERZ_STORE_ID=your_live_store_id
SSLCOMMERZ_STORE_PASSWORD=your_live_store_password
```

### 2. SSL Certificate
- Ensure valid SSL certificate is installed
- All payment URLs must use HTTPS

### 3. Callback URLs
- Update callback URLs to production domain
- Ensure URLs are publicly accessible
- Test all callback endpoints

### 4. Monitoring
- Set up payment transaction monitoring
- Monitor failed payments
- Set up alerts for payment issues

## Troubleshooting

### Payment Session Creation Fails
1. Check store credentials
2. Verify network connectivity
3. Check request payload format
4. Review SSLCommerz error logs

### Callbacks Not Working
1. Verify callback URLs are accessible
2. Check server logs for errors
3. Test with SSLCommerz test tool
4. Ensure proper response format

### IPN Not Received
1. Check IPN URL accessibility
2. Verify server can receive POST requests
3. Check SSLCommerz IPN settings
4. Monitor server logs

## Support

For SSLCommerz support:
- Email: support@sslcommerz.com
- Phone: +880 1847 141 141
- Documentation: https://developer.sslcommerz.com/

For application support:
- Check server logs
- Review payment service implementation
- Test with sandbox environment 