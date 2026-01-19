'use client';

import { useEffect, useMemo, useState } from 'react';
import { Building2, Plus, UserPlus, CheckCircle2, Edit, Trash2, Image as ImageIcon, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { ImageUpload } from '@/components/ImageUpload';
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

  type StatusFilter = 'all' | 'active' | 'inactive';
  type ManagerFilter = 'all' | 'assigned' | 'unassigned';

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [managersByAcademyId, setManagersByAcademyId] = useState<Record<string, AcademyManagerSummary | null>>({});

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [managerFilter, setManagerFilter] = useState<ManagerFilter>('all');

  const [academyForm, setAcademyForm] = useState({ name: '', nameAr: '', slug: '', image: '' });
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createImageUploading, setCreateImageUploading] = useState(false);

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
  const [editImageUploading, setEditImageUploading] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingAcademyId, setDeletingAcademyId] = useState<string | null>(null);

  const t = dictionary.academies || {};
  const title = useMemo(() => dictionary.settings?.academies || t.title || 'Academies', [dictionary, t.title]);

  const fieldLabelClass = 'text-[#262626] dark:text-white font-semibold';
  const inputClass =
    'h-12 bg-white dark:bg-[#111114] border-2 border-[#DDDDDD] dark:border-[#000000] text-[#262626] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500';
  const outlineButtonClass =
    'h-10 border-2 border-[#DDDDDD] dark:border-[#000000] bg-white/80 dark:bg-[#111114] text-[#262626] dark:text-white hover:bg-gray-50 dark:hover:bg-[#1a1a1d]';

  const uploadCroppedImage = async (file: File, croppedImageUrl: string): Promise<string | null> => {
    try {
      const uploadFormData = new FormData();
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      uploadFormData.append('file', blob, file.name);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        const data = await uploadResponse.json().catch(() => null);
        toast.error(data?.error || t.uploadError || 'Failed to upload image');
        return null;
      }

      const data = await uploadResponse.json();
      return (data?.url as string) || null;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(t.uploadError || 'Failed to upload image');
      return null;
    }
  };

  const visibleAcademies = useMemo(() => {
    const q = query.trim().toLowerCase();
    const hasManager = (academyId: string) => Boolean(managersByAcademyId?.[academyId]);

    return academies
      .filter((a) => {
        if (statusFilter === 'active' && !a.isActive) return false;
        if (statusFilter === 'inactive' && a.isActive) return false;
        return true;
      })
      .filter((a) => {
        if (managerFilter === 'assigned' && !hasManager(a.id)) return false;
        if (managerFilter === 'unassigned' && hasManager(a.id)) return false;
        return true;
      })
      .filter((a) => {
        if (!q) return true;
        const hay = `${a.name} ${a.nameAr} ${a.slug}`.toLowerCase();
        return hay.includes(q);
      });
  }, [academies, managersByAcademyId, managerFilter, query, statusFilter]);

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
      toast.error(t.validationRequired || 'Name and Arabic name are required');
      return;
    }

    if (!academyForm.image.trim()) {
      toast.error(t.imageRequired || 'Please upload an academy image');
      return;
    }

    setCreating(true);
    try {
      const result = await createAcademyAction({
        name: academyForm.name.trim(),
        nameAr: academyForm.nameAr.trim(),
        slug: academyForm.slug.trim() || undefined,
        image: academyForm.image.trim(),
      });

      if (result.success) {
        toast.success(t.createSuccess || 'Academy created successfully');
        setAcademyForm({ name: '', nameAr: '', slug: '', image: '' });
        setCreateDialogOpen(false);
        await load();
      } else {
        toast.error(result.error || t.createError || 'Failed to create academy');
      }
    } catch (e) {
      console.error(e);
      toast.error(t.createError || 'Failed to create academy');
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
        toast.error(result.error || t.loadEligibleManagersError || 'Failed to load eligible managers');
      }
    } catch (e) {
      console.error(e);
      toast.error(t.loadEligibleManagersError || 'Failed to load eligible managers');
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
      toast.error(t.selectUserRequired || 'Please select a user');
      return;
    }

    setAssigning(true);
    try {
      const result = await assignExistingAcademyManagerAction({
        academyId: selectedAcademyId,
        userId: selectedManagerUserId,
      });

      if (result.success) {
        toast.success(t.assignManagerSuccess || 'Manager assigned successfully');
        setAssignDialogOpen(false);
        setSelectedAcademyId(null);
        setSelectedManagerUserId('');
        await load();
      } else {
        toast.error(result.error || t.assignManagerError || 'Failed to assign manager');
      }
    } catch (e) {
      console.error(e);
      toast.error(t.assignManagerError || 'Failed to assign manager');
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
      toast.error(t.validationRequired || 'Name and Arabic name are required');
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
        toast.success(t.updateSuccess || 'Academy updated successfully');
        setEditDialogOpen(false);
        setEditingAcademyId(null);
        await load();
      } else {
        toast.error(result.error || t.updateError || 'Failed to update academy');
      }
    } catch (e) {
      console.error(e);
      toast.error(t.updateError || 'Failed to update academy');
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
        toast.success(t.deleteSuccess || 'Academy deleted successfully');
        setDeleteDialogOpen(false);
        setDeletingAcademyId(null);
        await load();
      } else {
        toast.error(result.error || t.deleteError || 'Failed to delete academy');
      }
    } catch (e) {
      console.error(e);
      toast.error(t.deleteError || 'Failed to delete academy');
    }
    setDeleting(false);
  };

  const handleSetCurrent = async (academyId: string) => {
    try {
      const result = await setCurrentAcademyAction(locale, academyId);
      if (result.success) {
        toast.success(t.setCurrentSuccess || 'Current academy updated');
      } else {
        toast.error(result.error || t.setCurrentError || 'Failed to set current academy');
      }
    } catch (e) {
      console.error(e);
      toast.error(t.setCurrentError || 'Failed to set current academy');
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

  const cardShell =
    'bg-white dark:bg-[#262626] border-2 border-[#DDDDDD] dark:border-[#000000] rounded-2xl shadow-lg relative overflow-hidden';
  const subtleText = 'text-gray-600 dark:text-gray-400';

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 240, damping: 22 }}
        className="space-y-6"
      >
        {/* Header (matching Users/Roles vibe) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="relative">
              <motion.div
                className="absolute -inset-4 bg-linear-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-2xl blur-xl"
                animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              <div className="relative">
                <h1 className="text-3xl sm:text-4xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-3">
                  <Building2 className="h-8 w-8 text-purple-600" />
                  {title}
                </h1>
                <p className={`mt-2 ${subtleText}`}>{t.subtitle || 'Manage academies and assign managers'}</p>
              </div>
            </div>

            {/* Quick action (single grouped control) */}
            <div className="w-full lg:w-auto">
              <div className="relative overflow-hidden rounded-2xl border-2 border-[#DDDDDD] dark:border-[#000000] bg-white/80 dark:bg-[#262626]/80 backdrop-blur-xl shadow-lg">
                <motion.div
                  className="absolute inset-0 bg-linear-to-r from-blue-600/8 via-purple-600/8 to-pink-600/8"
                  animate={{ opacity: [0.35, 0.6, 0.35] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                />
                <div className="relative p-2">
                  <div className="flex h-12 w-full items-stretch overflow-hidden rounded-xl border-2 border-black/60 bg-[#0b0b0f] text-white shadow-lg shadow-black/30">
                    <Button
                      onClick={() => setCreateDialogOpen(true)}
                      className="h-full w-full rounded-none border-0 bg-transparent px-4 text-white hover:bg-[#14141a]"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      <span className="font-semibold">{t.createAcademy || 'Create academy'}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filters / Controls */}
        <div className={`${cardShell} p-5 sm:p-6`}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl border-2 border-[#DDDDDD] dark:border-[#000000] bg-linear-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="min-w-0">
                <div className="text-base font-bold text-[#262626] dark:text-white">
                  {t.listTitle || 'Academy list'}
                </div>
                <div className={`text-sm ${subtleText} truncate`}>
                  {(t.showing || 'Showing')} {visibleAcademies.length} / {academies.length}
                </div>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex h-12 w-full items-stretch overflow-hidden rounded-xl border-2 border-[#DDDDDD] dark:border-[#000000] bg-white dark:bg-[#262626]">
                  <div className="shrink-0 min-w-[170px]">
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                      <SelectTrigger className="h-full! w-full rounded-none border-0 bg-transparent px-4 py-0! text-[#262626] dark:text-white hover:bg-gray-50 dark:hover:bg-[#1a1a1a]">
                        <SelectValue placeholder={t.filterStatus || 'Status'} className="leading-none" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-2 border-[#DDDDDD] dark:border-[#000000]">
                        <SelectItem value="all">{t.statusAll || 'All'}</SelectItem>
                        <SelectItem value="active">{t.statusActive || 'Active'}</SelectItem>
                        <SelectItem value="inactive">{t.statusInactive || 'Inactive'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-px bg-[#DDDDDD] dark:bg-[#000000]" />

                  <div className="shrink-0 min-w-[210px]">
                    <Select value={managerFilter} onValueChange={(v) => setManagerFilter(v as ManagerFilter)}>
                      <SelectTrigger className="h-full! w-full rounded-none border-0 bg-transparent px-4 py-0! text-[#262626] dark:text-white hover:bg-gray-50 dark:hover:bg-[#1a1a1a]">
                        <SelectValue placeholder={t.filterManager || 'Manager'} className="leading-none" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-2 border-[#DDDDDD] dark:border-[#000000]">
                        <SelectItem value="all">{t.managerAll || 'All'}</SelectItem>
                        <SelectItem value="assigned">{t.managerAssigned || 'Assigned'}</SelectItem>
                        <SelectItem value="unassigned">{t.managerUnassigned || 'Unassigned'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-px bg-[#DDDDDD] dark:bg-[#000000]" />

                  <div className="flex-1 min-w-0 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={t.searchPlaceholder || 'Search by name or slug...'}
                      className="h-full! rounded-none border-0 bg-transparent pl-11 pr-4 py-0! text-[#262626] dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus-visible:ring-0"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Academies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {visibleAcademies.map((academy) => {
            const manager = managersByAcademyId?.[academy.id] || null;
            return (
              <Card key={academy.id} className={`${cardShell} overflow-hidden`}>
                <div className="relative h-44 bg-gray-100 dark:bg-black/40 overflow-hidden">
                  {academy.image ? (
                    <Image src={academy.image} alt={academy.name} fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Building2 className="h-16 w-16 text-gray-300 dark:text-white/20" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/25 to-transparent" />

                  <div className="absolute top-3 right-3">
                    {academy.isActive ? (
                      <div className="px-3 py-1 bg-green-600/90 backdrop-blur-sm rounded-full text-xs font-bold text-white flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        {t.statusActive || 'Active'}
                      </div>
                    ) : (
                      <div className="px-3 py-1 bg-gray-500/90 backdrop-blur-sm rounded-full text-xs font-bold text-white">
                        {t.statusInactive || 'Inactive'}
                      </div>
                    )}
                  </div>
                </div>

                <CardContent className="p-4 space-y-3">
                  <div className="min-w-0">
                    <div className="font-black text-lg text-[#262626] dark:text-white truncate">{academy.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 truncate">{academy.nameAr}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 truncate">{academy.slug}</div>
                  </div>

                  <div className="p-3 rounded-xl border-2 border-[#DDDDDD] dark:border-[#000000] bg-gray-50 dark:bg-[#1a1a1a]">
                    <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{t.managerLabel || 'Manager'}</div>
                    {manager ? (
                      <div className="text-xs">
                        <div className="font-bold text-[#262626] dark:text-white truncate">
                          {manager.fullName || manager.email}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400 truncate">{manager.email}</div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 dark:text-gray-500">{t.managerNotAssigned || 'Not assigned'}</div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => handleSetCurrent(academy.id)}
                      variant="outline"
                      size="sm"
                      className={outlineButtonClass}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      {t.setCurrent || 'Set current'}
                    </Button>

                    <Button
                      onClick={() => openAssignManager(academy.id)}
                      variant="outline"
                      size="sm"
                      className={outlineButtonClass}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      {t.assignManager || 'Manager'}
                    </Button>

                    <Button
                      onClick={() => openEditDialog(academy)}
                      variant="outline"
                      size="sm"
                      className="h-10 border-2 border-blue-500/40 bg-white/80 dark:bg-[#111114] text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-[#1a1a1d]"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      {t.edit || 'Edit'}
                    </Button>

                    <Button
                      onClick={() => openDeleteDialog(academy.id)}
                      disabled={academy.id === 'default'}
                      variant="outline"
                      size="sm"
                      className="h-10 border-2 border-red-500/40 bg-white/80 dark:bg-[#111114] text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-[#1a1a1d] disabled:opacity-30"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      {t.delete || 'Delete'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {visibleAcademies.length === 0 && (
          <div className={`${cardShell} p-10 text-center`}>
            <Building2 className="w-16 h-16 mx-auto text-gray-300 dark:text-white/20 mb-4" />
            <div className="text-[#262626] dark:text-white font-bold">
              {t.emptyTitle || 'No academies found'}
            </div>
            <div className={`text-sm mt-2 ${subtleText}`}>{t.emptyDescription || 'Try adjusting your filters.'}</div>
          </div>
        )}
      </motion.div>

      {/* Create Academy Dialog */}
      <Dialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) {
            setAcademyForm({ name: '', nameAr: '', slug: '', image: '' });
          }
        }}
      >
        <DialogContent className="sm:max-w-[760px] bg-white dark:bg-[#262626] border-2 border-[#DDDDDD] dark:border-[#000000]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-[#262626] dark:text-white">
              {t.createDialogTitle || 'Create academy'}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className={fieldLabelClass}>{t.fieldNameEn || 'Name (English)'}</Label>
              <Input
                value={academyForm.name}
                onChange={(e) => setAcademyForm((p) => ({ ...p, name: e.target.value }))}
                className={inputClass}
                placeholder={t.placeholderNameEn || 'Academy name'}
              />
            </div>

            <div className="space-y-2">
              <Label className={fieldLabelClass}>{t.fieldNameAr || 'Name (Arabic)'}</Label>
              <Input
                value={academyForm.nameAr}
                onChange={(e) => setAcademyForm((p) => ({ ...p, nameAr: e.target.value }))}
                className={inputClass}
                placeholder={t.placeholderNameAr || 'Academy name (Arabic)'}
              />
            </div>

            <div className="space-y-2">
              <Label className={fieldLabelClass}>{t.fieldSlug || 'Slug'}</Label>
              <Input
                value={academyForm.slug}
                onChange={(e) => setAcademyForm((p) => ({ ...p, slug: e.target.value }))}
                className={inputClass}
                placeholder={t.placeholderSlug || 'academy-slug'}
              />
            </div>

            <div className="space-y-2">
              <Label className={fieldLabelClass}>{t.fieldImageUpload || 'Academy image'}</Label>
              <div className="rounded-2xl border-2 border-[#DDDDDD] dark:border-[#000000] bg-gray-50 dark:bg-[#111114] p-4">
                <ImageUpload
                  currentImage={academyForm.image || undefined}
                  onUpload={async (file, croppedImageUrl) => {
                    setCreateImageUploading(true);
                    const url = await uploadCroppedImage(file, croppedImageUrl);
                    if (url) {
                      setAcademyForm((p) => ({ ...p, image: url }));
                      toast.success(t.uploadSuccess || 'Image uploaded successfully');
                    }
                    setCreateImageUploading(false);
                  }}
                  onError={(message) => toast.error(message)}
                  shape="square"
                  size="md"
                  aspectRatio={16 / 9}
                  hideHint
                  variant="minimal"
                  icon={<ImageIcon className="w-16 h-16 text-gray-400" />}
                />
                <div className={`mt-3 text-xs ${subtleText}`}>{t.imageUploadHint || 'Upload an image (required). Max 5MB.'}</div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)} className="h-12 border-2">
              {t.cancel || 'Cancel'}
            </Button>
            <Button
              onClick={handleCreateAcademy}
              disabled={creating || createImageUploading}
              className="h-12 bg-[#0b0b0f] text-white hover:bg-[#14141a]"
            >
              {creating
                ? (t.creating || 'Creating...')
                : createImageUploading
                  ? (t.uploading || 'Uploading...')
                  : (t.createAcademy || 'Create academy')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
        <DialogContent className="sm:max-w-[640px] bg-white dark:bg-[#262626] border-2 border-[#DDDDDD] dark:border-[#000000]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-[#262626] dark:text-white">{t.assignManagerDialogTitle || 'Assign academy manager'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className={fieldLabelClass}>{t.selectUserLabel || 'Select a user'}</Label>
              <Select value={selectedManagerUserId} onValueChange={setSelectedManagerUserId}>
                <SelectTrigger className={`h-12 w-full ${inputClass}`}>
                  <SelectValue
                    placeholder={
                      eligibleManagersLoading
                        ? (t.loading || 'Loading...')
                        : (t.chooseManagerPlaceholder || 'Choose an admin/manager user')
                    }
                  />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-2 border-[#DDDDDD] dark:border-[#000000]">
                  {eligibleManagers.length === 0 ? (
                    <SelectItem value="__none" disabled>
                      {eligibleManagersLoading
                        ? (t.loading || 'Loading...')
                        : (t.noEligibleUsers || 'No eligible users found')}
                    </SelectItem>
                  ) : (
                    eligibleManagers.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {(u.fullName ? `${u.fullName} · ` : '') + u.email + (u.username ? ` · ${u.username}` : '')}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className={`text-xs ${subtleText}`}>
                {t.assignManagerHint || 'Only admin and manager users can be assigned as academy managers.'}
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setAssignDialogOpen(false)}
              className="h-12 border-2"
            >
              {t.cancel || 'Cancel'}
            </Button>
            <Button
              onClick={handleAssignManager}
              disabled={assigning || !selectedManagerUserId}
              className="h-12 bg-[#0b0b0f] text-white hover:bg-[#14141a]"
            >
              {assigning ? (t.assigning || 'Assigning...') : (t.assignManagerCta || 'Assign manager')}
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
        <DialogContent className="sm:max-w-[760px] bg-white dark:bg-[#262626] border-2 border-[#DDDDDD] dark:border-[#000000]">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-[#262626] dark:text-white">{t.editDialogTitle || 'Edit academy'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className={fieldLabelClass}>{t.fieldNameEn || 'Name (English)'}</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <Label className={fieldLabelClass}>{t.fieldNameAr || 'Name (Arabic)'}</Label>
              <Input
                value={editForm.nameAr}
                onChange={(e) => setEditForm((p) => ({ ...p, nameAr: e.target.value }))}
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <Label className={fieldLabelClass}>{t.fieldSlug || 'Slug'}</Label>
              <Input
                value={editForm.slug}
                onChange={(e) => setEditForm((p) => ({ ...p, slug: e.target.value }))}
                className={inputClass}
              />
            </div>

            <div className="space-y-2">
              <Label className={fieldLabelClass}>{t.fieldImageUpload || 'Academy image'}</Label>
              <div className="rounded-2xl border-2 border-[#DDDDDD] dark:border-[#000000] bg-gray-50 dark:bg-[#111114] p-4">
                <ImageUpload
                  currentImage={editForm.image || undefined}
                  onUpload={async (file, croppedImageUrl) => {
                    setEditImageUploading(true);
                    const url = await uploadCroppedImage(file, croppedImageUrl);
                    if (url) {
                      setEditForm((p) => ({ ...p, image: url }));
                      toast.success(t.uploadSuccess || 'Image uploaded successfully');
                    }
                    setEditImageUploading(false);
                  }}
                  onError={(message) => toast.error(message)}
                  shape="square"
                  size="md"
                  aspectRatio={16 / 9}
                  hideHint
                  variant="minimal"
                  icon={<ImageIcon className="w-16 h-16 text-gray-400" />}
                />
                <div className={`mt-3 text-xs ${subtleText}`}>{t.imageUploadHintOptional || 'Upload a new image to replace the current one.'}</div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 p-4 rounded-xl border-2 border-[#DDDDDD] dark:border-[#000000] bg-gray-50 dark:bg-[#1a1a1a]">
              <div className="min-w-0">
                <Label className="font-semibold">{t.fieldIsActive || 'Academy is active'}</Label>
                <div className={`text-xs mt-1 ${subtleText}`}>{t.fieldIsActiveHint || 'Inactive academies can be hidden from users.'}</div>
              </div>
              <Switch checked={editForm.isActive} onCheckedChange={(checked) => setEditForm((p) => ({ ...p, isActive: checked }))} />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              className="h-12 border-2"
            >
              {t.cancel || 'Cancel'}
            </Button>
            <Button
              onClick={handleUpdateAcademy}
              disabled={editing || editImageUploading}
              className="h-12 bg-[#0b0b0f] text-white hover:bg-[#14141a]"
            >
              {editing
                ? (t.updating || 'Updating...')
                : editImageUploading
                  ? (t.uploading || 'Uploading...')
                  : (t.updateAcademy || 'Update academy')}
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
        <DialogContent className="sm:max-w-[520px] bg-white dark:bg-[#262626] border-2 border-red-500/40">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-red-600 dark:text-red-400">{t.deleteDialogTitle || 'Delete academy'}</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-[#262626] dark:text-white">
              {t.deleteConfirm || 'Are you sure you want to delete this academy? This action cannot be undone.'}
            </p>
            <p className={`text-sm mt-2 ${subtleText}`}>
              {t.deleteHint || 'Associated data may remain, but the academy will be permanently removed.'}
            </p>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="h-12 border-2"
            >
              {t.cancel || 'Cancel'}
            </Button>
            <Button
              onClick={handleDeleteAcademy}
              disabled={deleting}
              className="h-12 bg-red-600 hover:bg-red-500 text-white"
            >
              {deleting ? (t.deleting || 'Deleting...') : (t.deleteAcademy || 'Delete academy')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
