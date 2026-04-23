'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lock, Bell, Users, Shield } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure system settings, permissions, and preferences
        </p>
      </div>

      <Tabs defaultValue="security" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Two-Factor Authentication</h3>
                <p className="text-sm text-muted-foreground">
                  Enable two-factor authentication for all admin accounts
                </p>
                <Button variant="outline">Configure 2FA</Button>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Session Management</h3>
                <p className="text-sm text-muted-foreground">
                  Set session timeout and security policies
                </p>
                <Button variant="outline">Manage Sessions</Button>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">API Keys</h3>
                <p className="text-sm text-muted-foreground">
                  Generate and manage API keys for integrations
                </p>
                <Button variant="outline">Manage API Keys</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Email Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Configure email alerts and notification preferences
                </p>
                <Button variant="outline">Configure Email</Button>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Alert Thresholds</h3>
                <p className="text-sm text-muted-foreground">
                  Set system alert thresholds and triggers
                </p>
                <Button variant="outline">Set Thresholds</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Role & Permission Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Admin Roles</h3>
                <p className="text-sm text-muted-foreground">
                  Create and manage admin roles with specific permissions
                </p>
                <Button variant="outline">Manage Roles</Button>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Admin Users</h3>
                <p className="text-sm text-muted-foreground">
                  Add, remove, or modify admin user accounts
                </p>
                <Button variant="outline">Manage Admin Users</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                System Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Database</h3>
                <p className="text-sm text-muted-foreground">
                  Backup, maintenance, and optimization settings
                </p>
                <Button variant="outline">Database Settings</Button>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Cache Management</h3>
                <p className="text-sm text-muted-foreground">
                  Clear and configure application cache
                </p>
                <Button variant="outline">Clear Cache</Button>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">System Health</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor system performance and health metrics
                </p>
                <Button variant="outline">View Health</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
