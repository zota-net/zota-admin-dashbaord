import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api/client';

interface BackendVerifyResponse {
  status: number;
  message: string;
  data?: {
    token?: string;
    user?: { id: string | number; fullname: string; email: string; role: string };
  };
}

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json({ message: 'Email and OTP are required' }, { status: 400 });
    }

    const response = await api.post<BackendVerifyResponse>(
      '/auth/verify-login-otp',
      { email, otp },
      { skipAuth: true }
    );

    if (response.status !== 200 || !response.data?.token || !response.data?.user) {
      return NextResponse.json({ message: response.message || 'Verification failed' }, { status: 400 });
    }

    const { user } = response.data;
    if (user.role !== 'Admin' && user.role !== 'SuperAdmin') {
      return NextResponse.json(
        { message: 'This account is not authorized for the admin panel' },
        { status: 403 }
      );
    }

    return NextResponse.json({ token: response.data.token, user });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message || 'Verification failed' }, { status: error.status });
    }
    console.error('OTP verification error:', error);
    return NextResponse.json({ message: 'Verification failed' }, { status: 400 });
  }
}
