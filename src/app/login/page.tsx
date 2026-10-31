'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Lock,
  MailCheck,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/common';
import { useAdminStore } from '@/lib/store/admin-store';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
});

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only digits'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type OtpFormData = z.infer<typeof otpSchema>;

interface AdminUserPayload {
  id: string | number;
  fullname: string;
  email: string;
  role: string;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAdminStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpPending, setOtpPending] = useState(false);
  const [otpEmail, setOtpEmail] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<LoginFormData | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const otpForm = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const finalizeLogin = (token: string, user: AdminUserPayload) => {
    if (user.role !== 'Admin' && user.role !== 'SuperAdmin') {
      toast.error('This account is not authorized for the admin panel');
      return false;
    }
    login({
      token,
      admin: {
        id: String(user.id),
        fullname: user.fullname,
        email: user.email,
        role: user.role as 'Admin' | 'SuperAdmin',
      },
    });
    toast.success(`Welcome back, ${user.fullname}`);
    router.push('/admin');
    return true;
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.message || 'Authentication failed');
      }

      setCredentials(data);

      if (body.otpRequired) {
        setOtpEmail(body.email ?? data.email);
        setOtpPending(true);
        otpForm.reset({ otp: '' });
        toast.info('A 6-digit verification code was sent to your email');
        return;
      }

      finalizeLogin(body.token, body.user);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onOtpSubmit = async (data: OtpFormData) => {
    if (!otpEmail) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail, otp: data.otp }),
      });

      const body = await res.json();

      if (!res.ok) {
        throw new Error(body.message || 'Verification failed');
      }

      if (!finalizeLogin(body.token, body.user)) {
        setOtpPending(false);
        setOtpEmail(null);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendOtp = async () => {
    if (!credentials) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || 'Could not resend the code');
      toast.success(body.otpRequired ? 'New code sent to your email' : 'New code sent');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not resend the code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const backToCredentials = () => {
    setOtpPending(false);
    setOtpEmail(null);
    setCredentials(null);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,106,0,0.06),transparent_60%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-[420px] relative"
      >
        <div className="flex flex-col items-center gap-3 mb-6">
          <Logo size="lg" />
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight">Platform Administration</h1>
            <p className="text-sm text-muted-foreground">
              {otpPending ? 'Two-factor verification required' : 'Sign in to the ZOTA control panel'}
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!otpPending ? (
            <motion.div key="credentials" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}>
              <Card className="border-border/60 shadow-sm">
                <CardContent className="pt-6">
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@zota.io"
                        autoComplete="email"
                        {...form.register('email')}
                      />
                      {form.formState.errors.email && (
                        <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          autoComplete="current-password"
                          className="pr-10"
                          {...form.register('password')}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full w-10 text-muted-foreground"
                          onClick={() => setShowPassword((v) => !v)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      {form.formState.errors.password && (
                        <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
                      )}
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Lock className="h-4 w-4 mr-2" />
                      )}
                      Continue
                    </Button>
                  </form>

                  <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    Restricted to Admin & SuperAdmin accounts
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div key="otp" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}>
              <Card className="border-border/60 shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center gap-2 mb-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <MailCheck className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm text-center text-muted-foreground">
                      We sent a 6-digit code to<br />
                      <span className="font-medium text-foreground">{otpEmail}</span>
                    </p>
                  </div>

                  <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="otp" className="sr-only">Verification code</Label>
                      <Input
                        id="otp"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        placeholder="000000"
                        className="text-center text-lg tracking-[0.5em] font-mono"
                        {...otpForm.register('otp')}
                      />
                      {otpForm.formState.errors.otp && (
                        <p className="text-xs text-destructive text-center">{otpForm.formState.errors.otp.message}</p>
                      )}
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Verify & sign in
                    </Button>
                  </form>

                  <div className="mt-4 flex items-center justify-between text-xs">
                    <Button variant="ghost" size="sm" className="h-8 text-muted-foreground" onClick={backToCredentials}>
                      <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
                      Back
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 text-primary" onClick={resendOtp} disabled={isSubmitting}>
                      <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                      Resend code
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
