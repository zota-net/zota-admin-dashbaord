'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Users,
  AlertCircle,
  TrendingUp,
  Server,
  Wifi,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/admin/cards/stat-card';
import { RecentActivityCard } from '@/components/admin/cards/recent-activity-card';
import { SystemHealthCard } from '@/components/admin/cards/system-health-card';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin">
          <Activity className="w-8 h-8 text-primary" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="p-8 space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          System overview and management controls
        </p>
      </motion.div>

      {/* KPI Stats */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={itemVariants}
      >
        <StatCard
          title="Total Users"
          value="1,234"
          change="+12%"
          icon={Users}
          trend="up"
        />
        <StatCard
          title="Active Agents"
          value="89"
          change="+5%"
          icon={Activity}
          trend="up"
        />
        <StatCard
          title="System Alerts"
          value="12"
          change="-2%"
          icon={AlertCircle}
          trend="down"
        />
        <StatCard
          title="Revenue"
          value="$12.5K"
          change="+23%"
          icon={TrendingUp}
          trend="up"
        />
      </motion.div>

      {/* Main Content Grid */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        variants={itemVariants}
      >
        {/* System Health */}
        <div className="lg:col-span-2">
          <SystemHealthCard />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              View System Logs
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Manage Permissions
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Security Settings
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Generate Report
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
        <RecentActivityCard />
      </motion.div>
    </motion.div>
  );
}
