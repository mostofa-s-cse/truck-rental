import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tranId = searchParams.get('tran_id');

  // Redirect to the user dashboard with cancellation parameters
  const redirectUrl = new URL('/dashboard/user/bookings', request.url);
  redirectUrl.searchParams.set('payment', 'cancelled');
  if (tranId) redirectUrl.searchParams.set('tran_id', tranId);

  return NextResponse.redirect(redirectUrl);
} 