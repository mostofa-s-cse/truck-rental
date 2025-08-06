import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const tranId = searchParams.get('tran_id');
  const status = searchParams.get('status');
  const valId = searchParams.get('val_id');
  const amount = searchParams.get('amount');
  const currency = searchParams.get('currency');

  // Redirect to the user dashboard with success parameters
  const redirectUrl = new URL('/dashboard/user/bookings', request.url);
  redirectUrl.searchParams.set('payment', 'success');
  if (tranId) redirectUrl.searchParams.set('tran_id', tranId);
  if (status) redirectUrl.searchParams.set('status', status);
  if (valId) redirectUrl.searchParams.set('val_id', valId);
  if (amount) redirectUrl.searchParams.set('amount', amount);
  if (currency) redirectUrl.searchParams.set('currency', currency);

  return NextResponse.redirect(redirectUrl);
} 