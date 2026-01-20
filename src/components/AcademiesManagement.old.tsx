'use client';

import { useEffect, useMemo, useState } from 'react';
import { Building2, Plus, UserPlus, CheckCircle2, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import toast from 'react-hot-toast';
import {
  createAcademyAction,
  assignExistingAcademyManagerAction,
  getEligibleAcademyManagersAction,
  getAllAcademiesAction,
  setCurrentAcademyAction,
  updateAcademyAction,
  deleteAcademyAction,
} from '@/lib/actions/academyActions';

type Academy = {
  id: string;
  name: string;
  nameAr: string;
  slug: string;
  image?: string;
  isActive: boolean;
};

type AcademyManagerSummary = {
  userId: string;
  email: string;
  username: string;
  fullName?: string;
  role: string;
};

type EligibleManagerUser = {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  role: string;
};

export function AcademiesManagement(props: { locale: string; dictionary: any }) {
  const { locale, dictionary } = props;

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [managersByAcademyId, setManagersByAcademyId] = useState<Record<string, AcademyManagerSummary | null>>({});

  const [academyForm, setAcademyForm] = useState({ name: '', nameAr: '', slug: '', image: '' });

  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [selectedAcademyId, setSelectedAcademyId] = useState<string | null>(null);
  const [eligibleManagersLoading, setEligibleManagersLoading] = useState(false);
  const [eligibleManagers, setEligibleManagers] = useState<EligibleManagerUser[]>([]);
  const [selectedManagerUserId, setSelectedManagerUserId] = useState<string>('');

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingAcademyId, setEditingAcademyId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', nameAr: '', slug: '', image: '', isActive: true });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingAcademyId, setDeletingAcademyId] = useState<string | null>(null);

  const title = useMemo(() => dictionary.settings?.academies || 'Academies', [dictionary]);

  const load = async () => {
    setLoading(true);
    try {
      const result = await getAllAcademiesAction();
      if (result.success) {
        setAcademies(result.academies as Academy[]);
        setManagersByAcademyId(((result as any).managersByAcademyId || {}) as Record<string, AcademyManagerSummary | null>);
      } else {
        toast.error(result.error || 'Failed to load academies');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load academies');
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateAcademy = async () => {
    if (!academyForm.name.trim() || !academyForm.nameAr.trim()) {
      toast.error('Name and Arabic name are required');
      return;
    }

    setCreating(true);
    try {
      const result = await createAcademyAction({
        name: academyForm.name.trim(),
        nameAr: academyForm.nameAr.trim(),
        slug: academyForm.slug.trim() || undefined,
        image: academyForm.image.trim() || undefined,
      });

      if (result.success) {
        toast.success('Academy created');
        setAcademyForm({ name: '', nameAr: '', slug: '', image: '' });
        await load();
      } else {
        toast.error(result.error || 'Failed to create academy');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to create academy');
    }
    setCreating(false);
  };

  const ensureEligibleManagersLoaded = async () => {
    if (eligibleManagers.length > 0) return;
    setEligibleManagersLoading(true);
    try {
      const result = await getEligibleAcademyManagersAction();
      if (result.success) {
        setEligibleManagers((result.users || []) as EligibleManagerUser[]);
      } else {
        toast.error(result.error || 'Failed to load eligible managers');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to load eligible managers');
    }
    setEligibleManagersLoading(false);
  };

  const openAssignManager = async (academyId: string) => {
    setSelectedAcademyId(academyId);
    const existing = managersByAcademyId[academyId];
    setSelectedManagerUserId(existing?.userId || '');
    setAssignDialogOpen(true);

    await ensureEligibleManagersLoaded();
  };

  const handleAssignManager = async () => {
    if (!selectedAcademyId) return;

    const userId = selectedManagerUserId.trim();
    if (!userId) {
      toast.error('Please select a user');
      return;
    }

    setAssigning(true);
    try {
      const result = await assignExistingAcademyManagerAction({ academyId: selectedAcademyId, userId });

      if (result.success) {
        toast.success('Manager assigned');
        setAssignDialogOpen(false);
        setSelectedAcademyId(null);
        await load();
      } else {
        toast.error(result.error || 'Failed to assign manager');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to assign manager');
    }
    setAssigning(false);
  };

  const openEditDialog = (academy: Academy) => {
    setEditingAcademyId(academy.id);
    setEditForm({
      name: academy.name,
      nameAr: academy.nameAr,
      slug: academy.slug,
      image: academy.image || '',
      isActive: academy.isActive,
    });
    setEditDialogOpen(true);
  };

  const handleUpdateAcademy = async () => {
    if (!editingAcademyId) return;
    if (!editForm.name.trim() || !editForm.nameAr.trim()) {
      toast.error('Name and Arabic name are required');
      return;
    }

    setEditing(true);
    try {
      const result = await updateAcademyAction(editingAcademyId, {
        name: editForm.name.trim(),
        nameAr: editForm.nameAr.trim(),
        slug: editForm.slug.trim() || undefined,        image: editForm.image.trim() || undefined,        isActive: editForm.isActive,
      });

      if (result.success) {
        toast.success('Academy updated');
        setEditDialogOpen(false);
        setEditingAcademyId(null);
        await load();
      } else {
        toast.error(result.error || 'Failed to update academy');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to update academy');
    }
    setEditing(false);
  };

  const openDeleteDialog = (academyId: string) => {
    setDeletingAcademyId(academyId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteAcademy = async () => {
    if (!deletingAcademyId) return;

    setDeleting(true);
    try {
      const result = await deleteAcademyAction(deletingAcademyId);

      if (result.success) {
        toast.success('Academy deleted');
        setDeleteDialogOpen(false);
        setDeletingAcademyId(null);
        await load();
      } else {
        toast.error(result.error || 'Failed to delete academy');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to delete academy');
    }
    setDeleting(false);
  };

  const handleSetCurrent = async (academyId: string) => {
    try {
      const result = await setCurrentAcademyAction(locale, academyId);
      if (result.success) {
        toast.success('Current academy updated');
      } else {
        toast.error(result.error || 'Failed to set current academy');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to set current academy');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-600 dark:text-gray-400">{dictionary.common?.loading || 'Loading...'}</p>
      </div>
    );
  }

  return (
    <>
      <Card className="border-2 border-[#DDDDDD] dark:border-[#000000] overflow-hidden">
        <CardHeader className="bg-gray-50 dark:bg-[#1a1a1a] border-b-2 border-[#DDDDDD] dark:border-[#000000] py-4">
          <CardTitle className="text-xl font-bold text-[#262626] dark:text-white flex items-center gap-3">
            <div className="p-2 bg-black/5 dark:bg-white/5 rounded-lg">
              <Building2 className="h-5 w-5 text-[#262626] dark:text-white" />
            </div>
            {title}
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6 bg-white dark:bg-[#262626] space-y-6">
          {/* Create academy */}
          <div className="p-5 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl border-2 border-[#DDDDDD] dark:border-[#000000]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-[#262626] dark:text-white font-semibold">Name (English)</Label>
                <Input
                  value={academyForm.name}
                  onChange={(e) => setAcademyForm((p) => ({ ...p, name: e.target.value }))}
                  className="h-12 bg-white dark:bg-[#262626] border-2 border-[#DDDDDD] dark:border-[#000000] focus:border-black/30 dark:focus:border-white/20"
                  placeholder="e.g. DNA Academy Riyadh"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#262626] dark:text-white font-semibold">Name (Arabic)</Label>
                <Input
                  value={academyForm.nameAr}
                  onChange={(e) => setAcademyForm((p) => ({ ...p, nameAr: e.target.value }))}
                  className="h-12 bg-white dark:bg-[#262626] border-2 border-[#DDDDDD] dark:border-[#000000] focus:border-black/30 dark:focus:border-white/20"
                  placeholder="Localized name"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[#262626] dark:text-white font-semibold">Slug (optional)</Label>
                <Input
                  value={academyForm.slug}
                  onChange={(e) => setAcademyForm((p) => ({ ...p, slug: e.target.value }))}
                  className="h-12 bg-white dark:bg-[#262626] border-2 border-[#DDDDDD] dark:border-[#000000] focus:border-black/30 dark:focus:border-white/20"
                  placeholder="e.g. riyadh"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                onClick={handleCreateAcademy}
                disabled={creating}
                className="h-12 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                {creating ? (dictionary.common?.loading || 'Loading...') : 'Create Academy'}
              </Button>
            </div>
          </div>

          {/* List academies */}
          <div className="space-y-3">
            {academies.map((a) => (
              <div
                key={a.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white dark:bg-[#1a1a1a] rounded-xl border-2 border-[#DDDDDD] dark:border-[#000000]"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <p className="font-bold text-[#262626] dark:text-white truncate">{a.name}</p>
                    {a.isActive ? (
                      <span className="text-xs font-semibold text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-950/30 px-2 py-1 rounded">Active</span>
                    ) : (
                      <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30 px-2 py-1 rounded">Inactive</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{a.nameAr}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 truncate">{a.slug}</p>

                  <div className="mt-2">
                    {managersByAcademyId[a.id] ? (
                      <p className="text-xs text-gray-700 dark:text-gray-300 truncate">
                        <span className="font-semibold text-gray-900 dark:text-white">Manager:</span>{' '}
                        {managersByAcademyId[a.id]?.fullName ? `${managersByAcademyId[a.id]?.fullName} · ` : ''}
                        {managersByAcademyId[a.id]?.email}
                        {managersByAcademyId[a.id]?.username ? ` · ${managersByAcademyId[a.id]?.username}` : ''}
                        {managersByAcademyId[a.id]?.role ? ` · ${managersByAcademyId[a.id]?.role}` : ''}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Manager:</span> Not assigned
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <Button
                    variant="outline"
                    onClick={() => handleSetCurrent(a.id)}
                    className="h-10 border-2 border-[#DDDDDD] dark:border-[#000000] hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2 text-gray-700 dark:text-gray-200" />
                    Set Current
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => openEditDialog(a)}
                    className="h-10 border-2 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => openDeleteDialog(a.id)}
                    disabled={a.id === 'default'}
                    className="h-10 border-2 border-red-500 dark:border-red-400 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>

                  <Button
                    onClick={() => void openAssignManager(a.id)}
                    className="h-10 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-colors"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign Manager
                  </Button>
                </div>
              </div>
            ))}

            {academies.length === 0 && (
              <div className="text-center py-12 bg-gray-50 dark:bg-[#1a1a1a] rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
                <Building2 className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 font-medium">No academies yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={assignDialogOpen}
        onOpenChange={(open) => {
          setAssignDialogOpen(open);
          if (!open) {
            setSelectedAcademyId(null);
            setSelectedManagerUserId('');
          }
        }}
      >
        <DialogContent className="sm:max-w-[560px] bg-white dark:bg-[#262626] border-2 border-[#DDDDDD] dark:border-[#000000]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#262626] dark:text-white">Assign Academy Manager</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[#262626] dark:text-white font-semibold">Select a user</Label>
              <Select value={selectedManagerUserId} onValueChange={setSelectedManagerUserId}>
                <SelectTrigger className="h-12 w-full bg-white dark:bg-[#1a1a1a] border-2 border-[#DDDDDD] dark:border-[#000000] focus:border-black/30 dark:focus:border-white/20">
                  <SelectValue placeholder={eligibleManagersLoading ? 'Loading...' : 'Choose an admin/manager user'} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#262626] border-2 border-[#DDDDDD] dark:border-[#000000]">
                  {eligibleManagers.length === 0 ? (
                    <SelectItem value="__none" disabled>
                      {eligibleManagersLoading ? 'Loading...' : 'No eligible users found'}
                    </SelectItem>
                  ) : (
                    eligibleManagers.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {(u.fullName ? `${u.fullName} · ` : '') + u.email + (u.username ? ` · ${u.username}` : '') + (u.role ? ` · ${u.role}` : '')}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Only active users with role <span className="font-semibold">admin</span> or <span className="font-semibold">manager</span> can be assigned.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setAssignDialogOpen(false);
                setSelectedAcademyId(null);
              }}
              className="h-12 bg-white dark:bg-[#1a1a1a] border-2 border-[#DDDDDD] dark:border-[#000000]"
            >
              {dictionary.common?.cancel || 'Cancel'}
            </Button>
            <Button
              onClick={handleAssignManager}
              disabled={assigning}
              className="h-12 bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transition-colors"
            >
              {assigning ? (dictionary.common?.loading || 'Loading...') : 'Assign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Academy Dialog */}
      <Dialog
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) {
            setEditingAcademyId(null);
            setEditForm({ name: '', nameAr: '', slug: '', image: '', isActive: true });
          }
        }}
      >
        <DialogContent className="sm:max-w-[560px] bg-white dark:bg-[#262626] border-2 border-[#DDDDDD] dark:border-[#000000]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#262626] dark:text-white">Edit Academy</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[#262626] dark:text-white font-semibold">Name (English)</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                className="h-12 bg-white dark:bg-[#1a1a1a] border-2 border-[#DDDDDD] dark:border-[#000000]"
                placeholder="e.g. DNA Academy Riyadh"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#262626] dark:text-white font-semibold">Name (Arabic)</Label>
              <Input
                value={editForm.nameAr}
                onChange={(e) => setEditForm((p) => ({ ...p, nameAr: e.target.value }))}
                className="h-12 bg-white dark:bg-[#1a1a1a] border-2 border-[#DDDDDD] dark:border-[#000000]"
                placeholder="Localized name"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#262626] dark:text-white font-semibold">Slug</Label>
              <Input
                value={editForm.slug}
                onChange={(e) => setEditForm((p) => ({ ...p, slug: e.target.value }))}
                className="h-12 bg-white dark:bg-[#1a1a1a] border-2 border-[#DDDDDD] dark:border-[#000000]"
                placeholder="e.g. riyadh"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="editIsActive"
                checked={editForm.isActive}
                onChange={(e) => setEditForm((p) => ({ ...p, isActive: e.target.checked }))}
                className="h-5 w-5 rounded border-2 border-[#DDDDDD] dark:border-[#000000]"
                aria-label="Academy active status"
              />
              <Label htmlFor="editIsActive" className="text-[#262626] dark:text-white font-semibold cursor-pointer">
                Active
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              className="h-12 bg-white dark:bg-[#1a1a1a] border-2 border-[#DDDDDD] dark:border-[#000000]"
            >
              {dictionary.common?.cancel || 'Cancel'}
            </Button>
            <Button
              onClick={handleUpdateAcademy}
              disabled={editing}
              className="h-12 bg-blue-600 hover:bg-blue-700 text-white active:scale-95 transition-colors"
            >
              {editing ? (dictionary.common?.loading || 'Loading...') : 'Update Academy'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) {
            setDeletingAcademyId(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[460px] bg-white dark:bg-[#262626] border-2 border-red-500 dark:border-red-400">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600 dark:text-red-400">Delete Academy</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-[#262626] dark:text-white">
              Are you sure you want to delete this academy? This action cannot be undone.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              All associated data including memberships will remain but the academy will be permanently removed.
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="h-12 bg-white dark:bg-[#1a1a1a] border-2 border-[#DDDDDD] dark:border-[#000000]"
            >
              {dictionary.common?.cancel || 'Cancel'}
            </Button>
            <Button
              onClick={handleDeleteAcademy}
              disabled={deleting}
              className="h-12 bg-red-600 hover:bg-red-700 text-white active:scale-95 transition-colors"
            >
              {deleting ? (dictionary.common?.loading || 'Loading...') : 'Delete Academy'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
