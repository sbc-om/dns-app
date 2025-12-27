'use client';

import { useEffect, useMemo, useState } from 'react';
import { Building2, Plus, UserPlus, CheckCircle2, Edit, Trash2, Upload, Image as ImageIcon } from 'lucide-react';
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
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Image from 'next/image';
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
        toast.success('Academy created successfully');
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
    await ensureEligibleManagersLoaded();
    setAssignDialogOpen(true);
  };

  const handleAssignManager = async () => {
    if (!selectedAcademyId || !selectedManagerUserId) {
      toast.error('Please select a user');
      return;
    }

    setAssigning(true);
    try {
      const result = await assignExistingAcademyManagerAction({
        academyId: selectedAcademyId,
        userId: selectedManagerUserId,
      });

      if (result.success) {
        toast.success('Manager assigned successfully');
        setAssignDialogOpen(false);
        setSelectedAcademyId(null);
        setSelectedManagerUserId('');
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
        slug: editForm.slug.trim(),
        image: editForm.image.trim() || undefined,
        isActive: editForm.isActive,
      });

      if (result.success) {
        toast.success('Academy updated successfully');
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
        toast.success('Academy deleted successfully');
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
      <div className="flex items-center justify-center py-24">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="h-12 w-12 rounded-full border-4 border-blue-500/30 border-t-blue-500"
        />
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        {/* Header Card */}
        <Card className="border-2 border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden">
          <CardHeader className="border-b border-white/10 bg-white/5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                  className="p-3 bg-blue-600/20 rounded-2xl"
                >
                  <Building2 className="h-6 w-6 text-blue-400" />
                </motion.div>
                {title}
              </CardTitle>
              <div className="text-sm text-white/60">
                {academies.length} {academies.length === 1 ? 'Academy' : 'Academies'}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Create Form */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="p-6 bg-white/5 rounded-2xl border border-white/10"
            >
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-400" />
                Create New Academy
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-white/90 font-semibold text-sm">Name (English)</Label>
                  <Input
                    value={academyForm.name}
                    onChange={(e) => setAcademyForm((p) => ({ ...p, name: e.target.value }))}
                    className="h-12 bg-black/20 border-white/10 text-white placeholder:text-white/35"
                    placeholder="DNA Academy"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/90 font-semibold text-sm">Name (Arabic)</Label>
                  <Input
                    value={academyForm.nameAr}
                    onChange={(e) => setAcademyForm((p) => ({ ...p, nameAr: e.target.value }))}
                    className="h-12 bg-black/20 border-white/10 text-white placeholder:text-white/35"
                    placeholder="أكاديمية DNA"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/90 font-semibold text-sm">Slug (optional)</Label>
                  <Input
                    value={academyForm.slug}
                    onChange={(e) => setAcademyForm((p) => ({ ...p, slug: e.target.value }))}
                    className="h-12 bg-black/20 border-white/10 text-white placeholder:text-white/35"
                    placeholder="dna-riyadh"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/90 font-semibold text-sm">Image URL</Label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/45" />
                    <Input
                      value={academyForm.image}
                      onChange={(e) => setAcademyForm((p) => ({ ...p, image: e.target.value }))}
                      className="h-12 pl-10 bg-black/20 border-white/10 text-white placeholder:text-white/35"
                      placeholder="/uploads/..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleCreateAcademy}
                  disabled={creating}
                  className="h-12 px-8 bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  {creating ? 'Creating...' : 'Create Academy'}
                </Button>
              </div>
            </motion.div>

            {/* Academies Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {academies.map((academy, index) => (
                  <motion.div
                    key={academy.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    className="group relative"
                  >
                    <Card className="h-full border-2 border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden hover:border-blue-500/50 transition-all">
                      {/* Image */}
                      <div className="relative h-48 bg-black/40 overflow-hidden">
                        {academy.image ? (
                          <Image
                            src={academy.image}
                            alt={academy.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Building2 className="h-20 w-20 text-white/20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
                        
                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                          {academy.isActive ? (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="px-3 py-1 bg-green-500/90 backdrop-blur-sm rounded-full text-xs font-bold text-white flex items-center gap-1"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Active
                            </motion.div>
                          ) : (
                            <div className="px-3 py-1 bg-gray-500/90 backdrop-blur-sm rounded-full text-xs font-bold text-white">
                              Inactive
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <CardContent className="p-4 space-y-3">
                        <div>
                          <h3 className="font-black text-lg text-white truncate">{academy.name}</h3>
                          <p className="text-sm text-white/60 truncate">{academy.nameAr}</p>
                          <p className="text-xs text-white/40 truncate">{academy.slug}</p>
                        </div>

                        {/* Manager Info */}
                        <div className="p-3 bg-black/20 rounded-xl border border-white/10">
                          <p className="text-xs font-semibold text-white/50 mb-1">Manager</p>
                          {managersByAcademyId[academy.id] ? (
                            <div className="text-xs text-white/80">
                              <p className="font-bold text-white truncate">
                                {managersByAcademyId[academy.id]?.fullName || managersByAcademyId[academy.id]?.email}
                              </p>
                              <p className="text-white/60 truncate">{managersByAcademyId[academy.id]?.email}</p>
                            </div>
                          ) : (
                            <p className="text-xs text-white/40">Not assigned</p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            onClick={() => handleSetCurrent(academy.id)}
                            variant="outline"
                            size="sm"
                            className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Set Current
                          </Button>
                          <Button
                            onClick={() => openAssignManager(academy.id)}
                            variant="outline"
                            size="sm"
                            className="border-white/20 bg-white/5 text-white hover:bg-white/10"
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Manager
                          </Button>
                          <Button
                            onClick={() => openEditDialog(academy)}
                            variant="outline"
                            size="sm"
                            className="border-blue-500/50 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => openDeleteDialog(academy.id)}
                            disabled={academy.id === 'default'}
                            variant="outline"
                            size="sm"
                            className="border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20 disabled:opacity-30"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {academies.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 bg-white/5 rounded-2xl border border-dashed border-white/20"
              >
                <Building2 className="w-20 h-20 mx-auto text-white/20 mb-4" />
                <p className="text-white/60 font-medium">No academies created yet</p>
                <p className="text-white/40 text-sm mt-2">Create your first academy to get started</p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Assign Manager Dialog */}
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
        <DialogContent className="sm:max-w-[520px] bg-[#0a0a0a] border-2 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white">Assign Academy Manager</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white/90 font-semibold">Select a user</Label>
              <Select value={selectedManagerUserId} onValueChange={setSelectedManagerUserId}>
                <SelectTrigger className="h-12 w-full bg-black/20 border-white/10 text-white">
                  <SelectValue placeholder={eligibleManagersLoading ? 'Loading...' : 'Choose an admin/manager user'} />
                </SelectTrigger>
                <SelectContent className="bg-[#0a0a0a] border-white/10">
                  {eligibleManagers.length === 0 ? (
                    <SelectItem value="__none" disabled>
                      {eligibleManagersLoading ? 'Loading...' : 'No eligible users found'}
                    </SelectItem>
                  ) : (
                    eligibleManagers.map((u) => (
                      <SelectItem key={u.id} value={u.id} className="text-white">
                        {(u.fullName ? `${u.fullName} · ` : '') + u.email + (u.username ? ` · ${u.username}` : '')}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-white/50">
                Only users with role <span className="font-bold text-blue-400">admin</span> or <span className="font-bold text-blue-400">manager</span> can be assigned.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setAssignDialogOpen(false)}
              className="border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignManager}
              disabled={assigning || !selectedManagerUserId}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold"
            >
              {assigning ? 'Assigning...' : 'Assign Manager'}
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
        <DialogContent className="sm:max-w-[560px] bg-[#0a0a0a] border-2 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-white">Edit Academy</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white/90 font-semibold">Name (English)</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                className="h-12 bg-black/20 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/90 font-semibold">Name (Arabic)</Label>
              <Input
                value={editForm.nameAr}
                onChange={(e) => setEditForm((p) => ({ ...p, nameAr: e.target.value }))}
                className="h-12 bg-black/20 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/90 font-semibold">Slug</Label>
              <Input
                value={editForm.slug}
                onChange={(e) => setEditForm((p) => ({ ...p, slug: e.target.value }))}
                className="h-12 bg-black/20 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white/90 font-semibold">Image URL</Label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/45" />
                <Input
                  value={editForm.image}
                  onChange={(e) => setEditForm((p) => ({ ...p, image: e.target.value }))}
                  className="h-12 pl-10 bg-black/20 border-white/10 text-white"
                  placeholder="/uploads/..."
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
              <input
                type="checkbox"
                id="editIsActive"
                checked={editForm.isActive}
                onChange={(e) => setEditForm((p) => ({ ...p, isActive: e.target.checked }))}
                className="h-5 w-5 rounded"
              />
              <Label htmlFor="editIsActive" className="text-white font-semibold cursor-pointer">
                Academy is Active
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              className="border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateAcademy}
              disabled={editing}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold"
            >
              {editing ? 'Updating...' : 'Update Academy'}
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
        <DialogContent className="sm:max-w-[460px] bg-[#0a0a0a] border-2 border-red-500/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-red-400">Delete Academy</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-white">
              Are you sure you want to delete this academy? This action cannot be undone.
            </p>
            <p className="text-sm text-white/60 mt-2">
              All associated data including memberships will remain but the academy will be permanently removed.
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAcademy}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-500 text-white font-bold"
            >
              {deleting ? 'Deleting...' : 'Delete Academy'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
