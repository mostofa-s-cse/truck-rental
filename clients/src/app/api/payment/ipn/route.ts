import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const ipnData = await request.json();
    
    // Forward the IPN data to the server
    const serverUrl = process.env.SERVER_URL_API || 'http://localhost:4000';
    const response = await fetch(`${serverUrl}/api/v1/payments/ipn`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ipnData),
    });

    if (response.ok) {
      return NextResponse.json({ success: true });
    } else {
      console.error('IPN forwarding failed:', response.status, response.statusText);
      return NextResponse.json({ success: false }, { status: 500 });
    }
  } catch (error) {
    console.error('IPN processing error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
} 