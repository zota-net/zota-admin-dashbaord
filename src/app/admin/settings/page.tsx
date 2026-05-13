'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Lock,
  Bell,
  Users,
  Shield,
  User,
  Mail,
  KeyRound,
  Plus,
  Trash2,
  Edit,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function SettingsPage() {
  const [admins, setAdmins] = useState<Admin[]>([
    { id: '1', name: 'Super Admin', email: 'admin@zota.com', role: 'SuperAdmin', createdAt: '2024-01-01' },
    { id: '2', name: 'Support Agent', email: 'support@zota.com', role: 'Admin', createdAt: '2024-01-15' },
  ]);
  const [showAddAdmin, setShowAddAdmin] = useState(false);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your profile, admin accounts, and system preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="admins">Admins</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Admin Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullname">Full Name</Label>
                  <Input id="fullname" defaultValue="Super Admin" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="admin@zota.com" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRound className="w-5 h-5" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input id="currentPassword" type="password" />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button>Update Password</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
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

        {/* Admins Tab */}
        <TabsContent value="admins" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Admin Users
              </CardTitle>
              <Dialog open={showAddAdmin} onOpenChange={setShowAddAdmin}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Admin
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Admin</DialogTitle>
                    <DialogDescription>
                      Create a new administrator account with specific roles
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="newAdminName">Name</Label>
                      <Input id="newAdminName" placeholder="Admin name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newAdminEmail">Email</Label>
                      <Input id="newAdminEmail" type="email" placeholder="admin@zota.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newAdminRole">Role</Label>
                      <select className="w-full p-2 border rounded-md bg-background text-sm">
                        <option value="Admin">Admin</option>
                        <option value="SuperAdmin">SuperAdmin</option>
                        <option value="Support">Support</option>
                      </select>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <Button variant="outline" onClick={() => setShowAddAdmin(false)}>Cancel</Button>
                      <Button onClick={() => setShowAddAdmin(false)}>Create Admin</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <div className="grid grid-cols-4 gap-4 p-3 text-sm font-medium text-muted-foreground bg-muted/50">
                  <div>Name</div>
                  <div>Email</div>
                  <div>Role</div>
                  <div>Actions</div>
                </div>
                {admins.map((admin) => (
                  <div key={admin.id} className="grid grid-cols-4 gap-4 p-3 text-sm border-t items-center">
                    <div className="font-medium">{admin.name}</div>
                    <div className="text-muted-foreground">{admin.email}</div>
                    <div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        admin.role === 'SuperAdmin'
                          ? 'bg-purple-500/10 text-purple-500'
                          : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {admin.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => setAdmins(prev => prev.filter(a => a.id !== admin.id))}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
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
