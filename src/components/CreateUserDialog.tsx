'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Shield, GraduationCap } from 'lucide-react';
import type { User } from '@/lib/db/repositories/userRepository';
import { ROLES, UserRole } from '@/config/roles';
import { Dictionary } from '@/lib/i18n/getDictionary';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createUserAction } from '@/lib/actions/userActions';
import { getAcademyUiContextAction } from '@/lib/actions/academyActions';
import { getActiveCoursesAction } from '@/lib/actions/courseActions';
import { createEnrollmentAction } from '@/lib/actions/enrollmentActions';
import type { Course } from '@/lib/db/repositories/courseRepository';
import type { Academy } from '@/lib/db/repositories/academyRepository';

export interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dictionary: Dictionary;
  onUserCreated: (user: User) => void;
  parents?: User[];
  locale: string;
}

export function CreateUserDialog({
  open,
  onOpenChange,
  dictionary,
  onUserCreated,
  parents = [],
  locale,
}: CreateUserDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<UserRole | null>(null);
  const [academyId, setAcademyId] = useState<string>('');
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    role: ROLES.KID as UserRole,
    parentId: '',
    courseId: '',
  });

  useEffect(() => {
    if (open) {
      loadCourses();
      loadAcademyContext();
    }
  }, [open]);

  const loadCourses = async () => {
    const result = await getActiveCoursesAction();
    if (result.success && result.courses) {
      setCourses(result.courses);
    }
  };

  const loadAcademyContext = async () => {
    const result = await getAcademyUiContextAction(locale);
    if (result.success) {
      setAcademies(result.academies);
      setCurrentUserRole(result.userRole as UserRole);
      setAcademyId(result.currentAcademyId);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const canPickAcademy = currentUserRole === ROLES.ADMIN;

    // Create user
    const result = await createUserAction({
      email: formData.email,
      username: formData.username,
      password: formData.password,
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      role: formData.role,
      parentId: formData.role === ROLES.KID && formData.parentId ? formData.parentId : undefined,
    }, {
      locale,
      academyId: canPickAcademy ? academyId : undefined,
    });

    if (result.success && result.user) {
      // If kid with course selected, create enrollment
      if (formData.role === ROLES.KID && formData.courseId && formData.parentId) {
        await createEnrollmentAction({
          studentId: result.user.id,
          courseId: formData.courseId,
          parentId: formData.parentId,
        });
      }

      onUserCreated(result.user);
      onOpenChange(false);
      setFormData({
        email: '',
        username: '',
        password: '',
        fullName: '',
        phoneNumber: '',
        role: ROLES.KID,
        parentId: '',
        courseId: '',
      });
    } else {
      alert(result.error || 'Failed to create user');
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px] p-0 overflow-hidden rounded-3xl border-2 border-[#DDDDDD] bg-white shadow-2xl dark:border-[#000000] dark:bg-[#0a0a0a]">
        <AnimatePresence mode="wait">
          {open && (
            <motion.div
              key="create-user-dialog"
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.35, type: 'spring', stiffness: 260, damping: 22 }}
              className="relative"
            >
              {/* Glow stays inside the dialog card */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <motion.div
                  className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-linear-to-br from-[#FF5F02]/25 via-purple-500/10 to-transparent blur-3xl"
                  animate={{ scale: [1, 1.06, 1], opacity: [0.6, 0.85, 0.6] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                  className="absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-linear-to-tr from-blue-500/15 via-[#FF5F02]/10 to-transparent blur-3xl"
                  animate={{ scale: [1, 1.04, 1], opacity: [0.55, 0.75, 0.55] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>

              <form onSubmit={handleSubmit} className="relative">
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-black/10 dark:border-white/10">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <motion.div
                        className="h-12 w-12 rounded-2xl border-2 border-[#DDDDDD] bg-white/70 backdrop-blur-sm flex items-center justify-center shadow-sm dark:border-[#000000] dark:bg-white/5"
                        whileHover={{ rotate: -2, scale: 1.02 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 18 }}
                      >
                        <UserPlus className="h-6 w-6 text-[#262626] dark:text-white" />
                      </motion.div>
                      <div>
                        <DialogTitle className="text-xl font-black tracking-tight text-[#262626] dark:text-white">
                          {dictionary.users.createUser}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
                          {dictionary.users.userDetails}
                        </DialogDescription>
                      </div>
                    </div>

                    <motion.div
                      className="hidden sm:flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1.5 text-xs font-semibold text-[#262626] backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:text-white"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Shield className="h-4 w-4" />
                      {dictionary.users.role}
                    </motion.div>
                  </div>
                </DialogHeader>

                <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
                  <div className="grid gap-6">
                    {(academies.length > 0 || academyId) && (
                      <div className="grid gap-2">
                        <Label htmlFor="academy" className="text-sm font-semibold text-[#262626] dark:text-white">
                          {dictionary.users.academy}
                        </Label>
                        {currentUserRole === ROLES.ADMIN ? (
                          <Select value={academyId} onValueChange={setAcademyId}>
                            <SelectTrigger className="h-12 rounded-xl border-2 border-[#DDDDDD] bg-white/80 dark:border-[#000000] dark:bg-white/5">
                              <SelectValue placeholder={dictionary.users.selectAcademy} />
                            </SelectTrigger>
                            <SelectContent>
                              {academies.map((academy) => (
                                <SelectItem key={academy.id} value={academy.id}>
                                  {locale === 'ar' ? academy.nameAr : academy.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id="academy"
                            value={
                              academies.find((a) => a.id === academyId)
                                ? locale === 'ar'
                                  ? academies.find((a) => a.id === academyId)!.nameAr
                                  : academies.find((a) => a.id === academyId)!.name
                                : academyId
                            }
                            disabled
                            className="h-12 rounded-xl border-2 border-[#DDDDDD] bg-white/60 dark:border-[#000000] dark:bg-white/5"
                          />
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="email" className="text-sm font-semibold text-[#262626] dark:text-white">
                          {dictionary.common.email}
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="h-12 rounded-xl border-2 border-[#DDDDDD] bg-white/80 dark:border-[#000000] dark:bg-white/5"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="username" className="text-sm font-semibold text-[#262626] dark:text-white">
                          {dictionary.common.username}
                        </Label>
                        <Input
                          id="username"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          required
                          className="h-12 rounded-xl border-2 border-[#DDDDDD] bg-white/80 dark:border-[#000000] dark:bg-white/5"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="password" className="text-sm font-semibold text-[#262626] dark:text-white">
                          {dictionary.common.password}
                        </Label>
                        <Input
                          id="password"
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                          className="h-12 rounded-xl border-2 border-[#DDDDDD] bg-white/80 dark:border-[#000000] dark:bg-white/5"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="role" className="text-sm font-semibold text-[#262626] dark:text-white">
                          {dictionary.users.role}
                        </Label>
                        <Select
                          value={formData.role}
                          onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
                        >
                          <SelectTrigger className="h-12 rounded-xl border-2 border-[#DDDDDD] bg-white/80 dark:border-[#000000] dark:bg-white/5">
                            <SelectValue placeholder={dictionary.users.role} />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(ROLES).map(([key, value]) => (
                              <SelectItem key={value} value={value}>
                                {key}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="fullName" className="text-sm font-semibold text-[#262626] dark:text-white">
                          {dictionary.common.fullName}
                        </Label>
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className="h-12 rounded-xl border-2 border-[#DDDDDD] bg-white/80 dark:border-[#000000] dark:bg-white/5"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="phoneNumber" className="text-sm font-semibold text-[#262626] dark:text-white">
                          {dictionary.common.phoneNumber}
                        </Label>
                        <Input
                          id="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                          className="h-12 rounded-xl border-2 border-[#DDDDDD] bg-white/80 dark:border-[#000000] dark:bg-white/5"
                        />
                      </div>
                    </div>

                    {(formData.role === ROLES.KID && (parents.length > 0 || courses.length > 0)) && (
                      <div className="rounded-2xl border border-black/10 bg-white/60 p-4 backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                        <div className="flex items-center gap-2 text-sm font-bold text-[#262626] dark:text-white mb-4">
                          <GraduationCap className="h-4 w-4" />
                          {dictionary.users.course}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Parent selection (kids) */}
                          {parents.length > 0 && (
                            <div className="grid gap-2">
                              <Label htmlFor="parentId" className="text-sm font-semibold text-[#262626] dark:text-white">
                                {dictionary.users.parent}
                              </Label>
                              <Select
                                value={formData.parentId}
                                onValueChange={(value) => setFormData({ ...formData, parentId: value })}
                              >
                                <SelectTrigger className="h-12 rounded-xl border-2 border-[#DDDDDD] bg-white/80 dark:border-[#000000] dark:bg-white/5">
                                  <SelectValue placeholder={dictionary.users.selectParent} />
                                </SelectTrigger>
                                <SelectContent>
                                  {parents.map((parent) => (
                                    <SelectItem key={parent.id} value={parent.id}>
                                      {parent.fullName} ({parent.email})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}

                          {/* Course selection (kids) */}
                          {courses.length > 0 && (
                            <div className="grid gap-2">
                              <Label htmlFor="courseId" className="text-sm font-semibold text-[#262626] dark:text-white">
                                {dictionary.users.course}
                              </Label>
                              <Select
                                value={formData.courseId || undefined}
                                onValueChange={(value) => setFormData({ ...formData, courseId: value })}
                              >
                                <SelectTrigger className="h-12 rounded-xl border-2 border-[#DDDDDD] bg-white/80 dark:border-[#000000] dark:bg-white/5">
                                  <SelectValue placeholder={dictionary.users.selectCourseOptional} />
                                </SelectTrigger>
                                <SelectContent>
                                  {courses.map((course) => (
                                    <SelectItem key={course.id} value={course.id}>
                                      {locale === 'ar' ? course.nameAr : course.name} - {course.price} {course.currency}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter className="px-6 py-5 border-t border-black/10 dark:border-white/10">
                  <Button asChild type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="rounded-xl">
                      {dictionary.common.cancel}
                    </motion.button>
                  </Button>
                  <Button asChild type="submit" disabled={isSubmitting} className="rounded-xl bg-[#262626] text-white hover:bg-black dark:bg-white dark:text-[#262626] dark:hover:bg-gray-100">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      {isSubmitting ? dictionary.common.loading : dictionary.common.create}
                    </motion.button>
                  </Button>
                </DialogFooter>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
