import { NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api/client';

interface BackendLoginResponse {
  status: number;
  message: string;
  data?: { token?: string; email?: string; user?: Record<string, unknown> };
}

function unauthorizedRole(role: unknown) {
  return role !== 'Admin' && role !== 'SuperAdmin';
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const response = await api.post<BackendLoginResponse>('/auth/login', { email, password }, { skipAuth: true });

    // Two-factor OTP flow: credentials accepted, OTP emailed (HTTP 206)
    if (response.status === 206) {
      return NextResponse.json({
        otpRequired: true,
        email: response.data?.email ?? email,
        message: response.message,
      });
    }

    // Direct login (OTP flow disabled on the backend)
    if (response.status === 200 && response.data?.token && response.data?.user) {
      const user = response.data.user as { id: string | number; fullname: string; email: string; role: string };
      if (unauthorizedRole(user.role)) {
        return NextResponse.json({ message: 'This account is not authorized for the admin panel' }, { status: 403 });
      }
      return NextResponse.json({
        otpRequired: false,
        token: response.data.token,
        user,
      });
    }

    return NextResponse.json({ message: response.message || 'Authentication failed' }, { status: 401 });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }
    if (error instanceof ApiError && error.status === 402) {
      return NextResponse.json({ message: error.message }, { status: 402 });
    }
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Authentication failed' }, { status: 401 });
  }
}
