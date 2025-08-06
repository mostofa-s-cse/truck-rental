import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tranId = searchParams.get('tran_id');
  const status = searchParams.get('status');
  const error = searchParams.get('error');

  // Redirect to the user dashboard with failure parameters
  const redirectUrl = new URL('/dashboard/user/bookings', request.url);
  redirectUrl.searchParams.set('payment', 'failed');
  if (tranId) redirectUrl.searchParams.set('tran_id', tranId);
  if (status) redirectUrl.searchParams.set('status', status);
  if (error) redirectUrl.searchParams.set('error', error);

  return NextResponse.redirect(redirectUrl);
} 