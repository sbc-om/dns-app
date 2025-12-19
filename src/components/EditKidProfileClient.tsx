'use client';

import { useState } from 'react';
import { ArrowLeft, Save, User as UserIcon, Mail, Phone, IdCard, Sparkles, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import type { User } from '@/lib/db/repositories/userRepository';
import type { Academy } from '@/lib/db/repositories/academyRepository';
import { updateUserAction } from '@/lib/actions/userActions';
import { addUserToAcademy, removeUserFromAcademy } from '@/lib/db/repositories/academyMembershipRepository';
import { useRouter } from 'next/navigation';
import { Checkbox } from '@/components/ui/checkbox';

interface EditKidProfileClientProps {
  dictionary: Dictionary;
  locale: Locale;
  kid: User;
  academies: Academy[];
  currentAcademyIds: string[];
}

export function EditKidProfileClient({
  dictionary,
  locale,
  kid,
  academies,
  currentAcademyIds,
}: EditKidProfileClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: kid.fullName || '',
    email: kid.email || '',
    phoneNumber: kid.phoneNumber || '',
    nationalId: kid.nationalId || '',
  });
  const [selectedAcademyIds, setSelectedAcademyIds] = useState<string[]>(currentAcademyIds);

  const handleAcademyToggle = (academyId: string) => {
    setSelectedAcademyIds(prev => {
      if (prev.includes(academyId)) {
        return prev.filter(id => id !== academyId);
      } else {
        return [...prev, academyId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update user profile
      const result = await updateUserAction(kid.id, formData);

      if (!result.success) {
        alert(result.error || 'Failed to update profile');
        setLoading(false);
        return;
      }

      // Update academy memberships
      const academiesToAdd = selectedAcademyIds.filter(id => !currentAcademyIds.includes(id));
      const academiesToRemove = currentAcademyIds.filter(id => !selectedAcademyIds.includes(id));

      // Add to new academies
      for (const academyId of academiesToAdd) {
        await addUserToAcademy({
          academyId,
          userId: kid.id,
          role: 'kid',
          createdBy: 'admin'
        });
      }

      // Remove from old academies
      for (const academyId of academiesToRemove) {
        await removeUserFromAcademy(academyId, kid.id);
      }

      alert(dictionary.users?.profileUpdated || 'Profile updated successfully!');
      router.push(`/${locale}/dashboard/kids/${kid.id}`);
      router.refresh();
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/${locale}/dashboard/kids/${kid.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="space-y-6 animate-fade-in">
        {/* Header with back button */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleCancel}
            className="bg-white dark:bg-[#262626] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] border-2 border-[#DDDDDD] dark:border-[#000000] transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-200" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-black/5 dark:bg-white/5 rounded-xl">
                <Sparkles className="h-6 w-6 text-gray-700 dark:text-gray-200" />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-[#262626] dark:text-white">
                  {dictionary.users?.editUser || 'Edit Profile'}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {locale === 'ar' ? 'تحديث معلومات وتفاصيل الطفل' : 'Update kid information and details'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="bg-white dark:bg-[#262626] border-2 border-[#DDDDDD] dark:border-[#000000] overflow-hidden">
            <CardHeader className="bg-gray-50 dark:bg-[#1a1a1a] border-b-2 border-[#DDDDDD] dark:border-[#000000]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-black/5 dark:bg-white/5 rounded-lg">
                  <UserIcon className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-[#262626] dark:text-white">
                    {locale === 'ar' ? 'المعلومات الأساسية' : 'Basic Information'}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    {locale === 'ar' ? 'قم بتحديث البيانات الشخصية للطفل' : 'Update the personal details of the kid'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label 
                  htmlFor="fullName" 
                  className="text-sm font-semibold text-[#262626] dark:text-white flex items-center gap-2"
                >
                  <UserIcon className="h-4 w-4 text-gray-700 dark:text-gray-200" />
                  {dictionary.common?.fullName || 'Full Name'}
                </Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder={locale === 'ar' ? 'أدخل الاسم الكامل' : 'Enter full name'}
                  className="bg-white dark:bg-[#1a1a1a] border-2 border-[#DDDDDD] dark:border-[#000000] focus:border-gray-400 dark:focus:border-gray-600 text-[#262626] dark:text-white h-12 text-base transition-colors"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label 
                  htmlFor="email" 
                  className="text-sm font-semibold text-[#262626] dark:text-white flex items-center gap-2"
                >
                  <Mail className="h-4 w-4 text-gray-700 dark:text-gray-200" />
                  {dictionary.common?.email || 'Email'}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={dictionary.auth?.emailPlaceholder || 'Enter email'}
                  className="bg-white dark:bg-[#1a1a1a] border-2 border-[#DDDDDD] dark:border-[#000000] focus:border-gray-400 dark:focus:border-gray-600 text-[#262626] dark:text-white h-12 text-base transition-colors"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label 
                  htmlFor="phoneNumber" 
                  className="text-sm font-semibold text-[#262626] dark:text-white flex items-center gap-2"
                >
                  <Phone className="h-4 w-4 text-gray-700 dark:text-gray-200" />
                  {dictionary.common?.phoneNumber || 'Phone Number'}
                </Label>
                <Input
                  id="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder={locale === 'ar' ? 'أدخل رقم الهاتف' : 'Enter phone number'}
                  className="bg-white dark:bg-[#1a1a1a] border-2 border-[#DDDDDD] dark:border-[#000000] focus:border-gray-400 dark:focus:border-gray-600 text-[#262626] dark:text-white h-12 text-base transition-colors"
                />
              </div>

              {/* National ID */}
              <div className="space-y-2">
                <Label 
                  htmlFor="nationalId" 
                  className="text-sm font-semibold text-[#262626] dark:text-white flex items-center gap-2"
                >
                  <IdCard className="h-4 w-4 text-gray-700 dark:text-gray-200" />
                  {dictionary.users?.nationalId || 'National ID'}
                </Label>
                <Input
                  id="nationalId"
                  value={formData.nationalId}
                  onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                  placeholder={dictionary.users?.nationalIdPlaceholder || 'Enter national ID'}
                  className="bg-white dark:bg-[#1a1a1a] border-2 border-[#DDDDDD] dark:border-[#000000] focus:border-gray-400 dark:focus:border-gray-600 text-[#262626] dark:text-white h-12 text-base transition-colors"
                />
              </div>
            </CardContent>
          </Card>

          {/* Academy Selection */}
          <Card className="bg-white dark:bg-[#262626] border-2 border-[#DDDDDD] dark:border-[#000000] overflow-hidden">
            <CardHeader className="bg-gray-50 dark:bg-[#1a1a1a] border-b-2 border-[#DDDDDD] dark:border-[#000000]">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-black/5 dark:bg-white/5 rounded-lg">
                  <Building2 className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-[#262626] dark:text-white">
                    {locale === 'ar' ? 'الأكاديميات' : 'Academies'}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    {locale === 'ar' ? 'حدد الأكاديميات التي ينتمي إليها هذا الطفل' : 'Select the academies this kid belongs to'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {academies.length === 0 ? (
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center py-4">
                  {locale === 'ar' ? 'لا توجد أكاديميات متاحة' : 'No academies available'}
                </p>
              ) : (
                <div className="space-y-3">
                  {academies.map((academy) => (
                    <div 
                      key={academy.id}
                      className="flex items-center gap-3 p-3 rounded-lg border-2 border-[#DDDDDD] dark:border-[#000000] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] transition-colors"
                    >
                      <Checkbox
                        id={`academy-${academy.id}`}
                        checked={selectedAcademyIds.includes(academy.id)}
                        onCheckedChange={() => handleAcademyToggle(academy.id)}
                        className="h-5 w-5"
                      />
                      <Label
                        htmlFor={`academy-${academy.id}`}
                        className="flex-1 cursor-pointer text-sm font-medium text-[#262626] dark:text-white"
                      >
                        {locale === 'ar' ? academy.nameAr : academy.name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleCancel} 
              disabled={loading}
              className="bg-white dark:bg-[#262626] hover:bg-gray-50 dark:hover:bg-[#1a1a1a] border-2 border-[#DDDDDD] dark:border-[#000000] text-[#262626] dark:text-white h-12 px-8 font-semibold transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {dictionary.common?.cancel || 'Cancel'}
            </Button>
            <Button
              type="submit"
              className="bg-[#262626] hover:bg-black text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black h-12 px-8 font-semibold transition-colors disabled:opacity-50"
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? (dictionary.common?.loading || 'Saving...') : (dictionary.common?.save || 'Save Changes')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
