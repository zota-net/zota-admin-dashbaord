'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Server,
  Wifi,
  Zap,
  Clock,
  HardDrive,
  Users,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/common';
import { StatsCard } from '@/components/admin/cards/stat-card';
import { clientsService, reportsService, walletsService } from '@/lib/api';
import type { Client, SalesReport } from '@/lib/api/types';
import { format, parseISO } from 'date-fns';

export default function AdminDashboardPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Aggregate stats across all clients
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalClients, setTotalClients] = useState(0);
  const [totalSales, setTotalSales] = useState(0);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const clientsData = await clientsService.getAll();
        setClients(clientsData);
        setTotalClients(clientsData.length);

        // Calculate aggregate revenue from all clients
        let totalRev = 0;
        let totalTrans = 0;

        for (const client of clientsData) {
          try {
            const salesReport = await reportsService.getSalesReport(client.id);
            totalRev += salesReport.summary.totalRevenue ?? 0;
            totalTrans += salesReport.sales.length;
          } catch (e) {
            // Skip clients with no sales
          }
        }

        setTotalRevenue(totalRev);
        setTotalSales(totalTrans);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Recent clients (sorted by creation date)
  const recentClients = useMemo(() => {
    return [...clients]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [clients]);

  // Clients by status
  const clientsByStatus = useMemo(() => {
    const counts = { Active: 0, Pending: 0, InActive: 0, Suspended: 0 };
    clients.forEach((c) => {
      if (c.status in counts) counts[c.status as keyof typeof counts]++;
    });
    return counts;
  }, [clients]);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      maximumFractionDigits: 0,
    }).format(amount);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'text-green-500';
      case 'Pending':
        return 'text-yellow-500';
      case 'Suspended':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-1"
        >
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting()}, Admin
          </h1>
          <p className="text-muted-foreground">
            Here is what is happening with your platform today.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <StatsCard
              title="Total Revenue"
              value={totalRevenue}
              description="Revenue from all clients"
              icon={Server}
              variant="primary"
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title="Total Clients"
              value={totalClients}
              suffix=""
              decimals={0}
              description="Active businesses"
              icon={Users}
              variant="success"
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title="Total Sales"
              value={totalSales}
              suffix=""
              decimals={0}
              description="Voucher transactions"
              icon={Activity}
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title="Active Clients"
              value={clientsByStatus.Active}
              suffix=""
              decimals={0}
              description="Currently active"
              icon={Zap}
              variant="success"
            />
          </StaggerItem>
        </StaggerContainer>

        {/* Charts and Info Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Client Overview */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                All Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              ) : clients.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <p className="text-sm">No clients yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentClients.map((client) => (
                    <Link
                      key={client.id}
                      href={`/admin/users/${client.id}`}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{client.businessName}</p>
                        <p className="text-xs text-muted-foreground truncate">{client.adminEmail}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-medium ${getStatusColor(client.status)}`}>
                          {client.status}
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </Link>
                  ))}
                  <Link
                    href="/admin/users"
                    className="flex items-center justify-center gap-2 p-3 rounded-lg border border-dashed hover:bg-muted/50 transition-colors text-muted-foreground"
                  >
                    <span className="text-sm">View all {totalClients} clients</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Client Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    <span className="text-sm">Active</span>
                  </div>
                  <span className="font-semibold text-green-500">{clientsByStatus.Active}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    <span className="text-sm">Pending</span>
                  </div>
                  <span className="font-semibold text-yellow-500">{clientsByStatus.Pending}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-gray-400" />
                    <span className="text-sm">InActive</span>
                  </div>
                  <span className="font-semibold text-gray-400">{clientsByStatus.InActive}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    <span className="text-sm">Suspended</span>
                  </div>
                  <span className="font-semibold text-red-500">{clientsByStatus.Suspended}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StaggerItem>
            <Link
              href="/admin/users"
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="font-semibold">Manage Clients</p>
                <p className="text-xs text-muted-foreground">View and manage all clients</p>
              </div>
            </Link>
          </StaggerItem>
          <StaggerItem>
            <Link
              href="/admin/vouchers"
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <Server className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-semibold">Manage Vouchers</p>
                <p className="text-xs text-muted-foreground">View and create vouchers</p>
              </div>
            </Link>
          </StaggerItem>
          <StaggerItem>
            <Link
              href="/admin/payments"
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-semibold">View Payments</p>
                <p className="text-xs text-muted-foreground">Monitor all transactions</p>
              </div>
            </Link>
          </StaggerItem>
          <StaggerItem>
            <Link
              href="/admin/agents"
              className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <Activity className="h-8 w-8 text-purple-500" />
              <div>
                <p className="font-semibold">Manage Agents</p>
                <p className="text-xs text-muted-foreground">Manage agent accounts</p>
              </div>
            </Link>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </PageTransition>
  );
}