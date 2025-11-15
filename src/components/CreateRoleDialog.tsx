'use client';

import { useState } from 'react';
import { Role, RegisteredResource, PermissionAction } from '@/lib/access-control/permissions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dictionary } from '@/lib/i18n/getDictionary';
import { Plus } from 'lucide-react';

export interface RoleFormData {
  name: string;
  description: string;
  permissionIds: string[];
}

export interface CreateRoleDialogProps {
  dictionary: Dictionary;
  resources: RegisteredResource[];
  onCreateRole: (data: RoleFormData) => Promise<void>;
}

export function CreateRoleDialog({
  dictionary,
  resources,
  onCreateRole,
}: CreateRoleDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    description: '',
    permissionIds: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onCreateRole(formData);
      setOpen(false);
      setFormData({ name: '', description: '', permissionIds: [] });
    } catch (error) {
      console.error('Error creating role:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = (resourceKey: string, action: PermissionAction) => {
    const permissionId = `${resourceKey}:${action}`;
    setFormData((prev) => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permissionId)
        ? prev.permissionIds.filter((id) => id !== permissionId)
        : [...prev.permissionIds, permissionId],
    }));
  };

  const isPermissionSelected = (resourceKey: string, action: PermissionAction) => {
    const permissionId = `${resourceKey}:${action}`;
    return formData.permissionIds.includes(permissionId);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg">
          <Plus className="mr-2 h-4 w-4" />
          {dictionary.roles.createRole}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dictionary.roles.createRole}</DialogTitle>
          <DialogDescription>
            Create a new role and assign permissions to it
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{dictionary.roles.roleName}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter role name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{dictionary.roles.description}</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter role description"
              />
            </div>

            <div className="space-y-2">
              <Label>{dictionary.roles.assignPermissions}</Label>
              <Tabs defaultValue={resources[0]?.key || 'dashboard'} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  {resources.slice(0, 3).map((resource) => (
                    <TabsTrigger key={resource.key} value={resource.key}>
                      {resource.displayNameKey.split('.').pop()}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {resources.map((resource) => (
                  <TabsContent key={resource.key} value={resource.key} className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">{resource.key}</CardTitle>
                        <CardDescription>{resource.type}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3">
                          {resource.defaultActions.map((action) => (
                            <div key={action} className="flex items-center space-x-2">
                              <Checkbox
                                id={`${resource.key}-${action}`}
                                checked={isPermissionSelected(resource.key, action)}
                                onCheckedChange={() => togglePermission(resource.key, action)}
                              />
                              <Label
                                htmlFor={`${resource.key}-${action}`}
                                className="text-sm font-normal cursor-pointer"
                              >
                                {dictionary.permissions[action as keyof typeof dictionary.permissions]}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {dictionary.common.cancel}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? dictionary.common.loading : dictionary.common.create}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
