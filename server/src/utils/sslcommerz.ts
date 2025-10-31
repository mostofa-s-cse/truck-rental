/**
 * SSLCommerz utility functions
 */

export function getSSLCUrl(type: 'success' | 'fail' | 'cancel' | 'ipn'): string {
  const baseUrl = process.env.SERVER_URL_API || 'http://localhost:4000';
  
  switch (type) {
    case 'success':
      return `${baseUrl}/api/v1/sslcommerz/payment/success`;
    case 'fail':
      return `${baseUrl}/api/v1/sslcommerz/payment/failure`;
    case 'cancel':
      return `${baseUrl}/api/v1/sslcommerz/payment/cancel`;
    case 'ipn':
      return `${baseUrl}/api/v1/sslcommerz/ipn`;
    default:
      throw new Error(`Unknown SSLCommerz URL type: ${type}`);
  }
}

export function validateSSLCommerzConfig(): boolean {
  const storeId = process.env.SSLCOMMERZ_STORE_ID;
  const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;
  
  if (!storeId || !storePassword) {
    console.warn('SSLCommerz credentials not configured');
    return false;
  }
  
  return true;
}

export function getSSLCommerzConfig() {
  return {
    storeId: process.env.SSLCOMMERZ_STORE_ID || '',
    storePassword: process.env.SSLCOMMERZ_STORE_PASSWORD || '',
    sandboxMode: process.env.SSLCOMMERZ_SANDBOX_MODE === 'true',
    isLive: process.env.SSLCOMMERZ_SANDBOX_MODE !== 'true'
  };
} 