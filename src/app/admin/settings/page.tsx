'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Lock,
  Users,
  Shield,
  User,
  KeyRound,
  Plus,
  Trash2,
  Edit,
  Loader2,
} from 'lucide-react';
import { adminsService } from '@/lib/api';
import { useAdminStore } from '@/lib/store/admin-store';
import type { AdminUser } from '@/lib/api/types';
import { AddAdminDialog } from '@/components/admin/dialogs/add-admin-dialog';
import { RoleChangeDialog } from '@/components/admin/dialogs/role-change-dialog';
import { RemoveAdminDialog } from '@/components/admin/dialogs/remove-admin-dialog';

export default function SettingsPage() {
  const { session } = useAdminStore();
  const isSuperAdmin = session?.admin?.role === 'SuperAdmin';

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isLoadingAdmins, setIsLoadingAdmins] = useState(true);

  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [showRoleChange, setShowRoleChange] = useState(false);
  const [showRemoveAdmin, setShowRemoveAdmin] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);

  const fetchAdmins = useCallback(async () => {
    setIsLoadingAdmins(true);
    try {
      const data = await adminsService.getAll();
      setAdmins(data);
    } catch {
      // silent
    } finally {
      setIsLoadingAdmins(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  return (
    <div className="space-y-6">
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
                  <Input id="fullname" defaultValue={session?.admin?.fullname || ''} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={session?.admin?.email || ''} />
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
            <CardContent className="space-y-6">
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
                {!isLoadingAdmins && (
                  <Badge variant="secondary" className="ml-2">{admins.length}</Badge>
                )}
              </CardTitle>
              {isSuperAdmin && (
                <Button size="sm" onClick={() => setShowAddAdmin(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Admin
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingAdmins ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : admins.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No admin users found.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      {isSuperAdmin && <TableHead className="w-[100px]">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell className="font-medium">
                          {admin.fullname}
                          {admin.id === Number(session?.admin?.id) && (
                            <Badge variant="outline" className="ml-2 text-[10px]">You</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">{admin.email}</TableCell>
                        <TableCell className="text-muted-foreground">{admin.phone || '—'}</TableCell>
                        <TableCell>
                          <Badge variant={admin.role === 'SuperAdmin' ? 'default' : 'secondary'}>
                            {admin.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : '—'}
                        </TableCell>
                        {isSuperAdmin && (
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  setSelectedAdmin(admin);
                                  setShowRoleChange(true);
                                }}
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </Button>
                              {admin.id !== Number(session?.admin?.id) && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => {
                                    setSelectedAdmin(admin);
                                    setShowRemoveAdmin(true);
                                  }}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
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
            <CardContent className="space-y-6">
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

      {/* Dialogs */}
      <AddAdminDialog
        open={showAddAdmin}
        onOpenChange={setShowAddAdmin}
        onAdminAdded={fetchAdmins}
      />

      {selectedAdmin && (
        <>
          <RoleChangeDialog
            open={showRoleChange}
            onOpenChange={setShowRoleChange}
            adminId={selectedAdmin.id}
            adminName={selectedAdmin.fullname}
            currentRole={selectedAdmin.role}
            onRoleChanged={fetchAdmins}
          />
          <RemoveAdminDialog
            open={showRemoveAdmin}
            onOpenChange={setShowRemoveAdmin}
            adminId={selectedAdmin.id}
            adminName={selectedAdmin.fullname}
            adminEmail={selectedAdmin.email}
            onAdminRemoved={fetchAdmins}
          />
        </>
      )}
    </div>
  );
}
