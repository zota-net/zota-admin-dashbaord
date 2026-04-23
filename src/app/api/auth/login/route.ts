import { NextResponse } from 'next/server';
import { api } from '@/lib/api/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const response = await api.post<{ status: number; message: string; data: { token: string; user: { id: string; fullname: string; email: string; role: string } } }>(
      '/auth/login',
      { email, password },
      { skipAuth: true }
    );

    if (!response.status || response.status !== 200) {
      return NextResponse.json(
        { message: response.message || 'Invalid credentials' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      token: response.data.token,
      user: response.data.user,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Authentication failed' },
      { status: 401 }
    );
  }
}