'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2, Building, ShieldCheck, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { useAdminStore } from '@/lib/store/admin-store';

const AUTH_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth`;

export default function AdminLoginPage() {
  const router = useRouter();
  const login = useAdminStore((state) => state.login);

  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${AUTH_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();

      // 206 = OTP sent, proceed to OTP step
      if (json.status === 206 || res.status === 206) {
        setStep('otp');
        return;
      }

      if (!res.ok) {
        throw new Error(json.message || 'Login failed');
      }

      // Direct login (no OTP) — token at root level
      const userData = json.data ?? json;
      login({
        token: userData.token,
        admin: {
          id: userData.user.id,
          fullname: userData.user.fullname,
          email: userData.user.email,
          role: userData.user.role,
        },
      });
      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${AUTH_URL}/verify-login-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || 'OTP verification failed');
      }

      // Response: { status, message, data: { token, user } }
      const userData = json.data ?? json;
      login({
        token: userData.token,
        admin: {
          id: userData.user.id,
          fullname: userData.user.fullname,
          email: userData.user.email,
          role: userData.user.role,
        },
      });
      router.push('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-[400px]"
      >
        <AnimatePresence mode="wait">
          {step === 'credentials' ? (
            <motion.div
              key="credentials"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="flex flex-col items-center mb-8">
                <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center mb-4">
                  <Building className="h-6 w-6 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">Zota Admin</h1>
                <p className="text-muted-foreground mt-1">Sign in to your admin dashboard</p>
              </div>

              <Card className="border-border shadow-sm">
                <CardContent className="p-6">
                  <form onSubmit={handleCredentials} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@zota.com"
                        autoComplete="email"
                        disabled={isLoading}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Enter your password"
                          autoComplete="current-password"
                          disabled={isLoading}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                        {error}
                      </div>
                    )}

                    <Button type="submit" disabled={isLoading} className="w-full">
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="flex flex-col items-center mb-8 text-center">
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <ShieldCheck className="h-7 w-7 text-primary" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">Verify your login</h1>
                <p className="text-muted-foreground mt-1">A 6-digit code was sent to</p>
                <p className="font-medium flex items-center gap-1 mt-1">
                  <Mail className="w-4 h-4" />
                  {email}
                </p>
              </div>

              <Card className="border-border shadow-sm">
                <CardContent className="p-6">
                  <form onSubmit={handleOtp} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="otp">One-Time Code</Label>
                      <Input
                        id="otp"
                        type="text"
                        inputMode="numeric"
                        placeholder="000000"
                        maxLength={6}
                        disabled={isLoading}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                        required
                      />
                    </div>

                    {error && (
                      <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                        {error}
                      </div>
                    )}

                    <Button type="submit" disabled={isLoading || otp.length !== 6} className="w-full">
                      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify & Sign In'}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                      <button
                        type="button"
                        onClick={() => { setStep('credentials'); setOtp(''); setError(''); }}
                        className="hover:text-foreground transition-colors underline underline-offset-4"
                      >
                        Back to login
                      </button>
                    </p>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
