'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, UserCircle, Save, Camera, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import { ImageUpload } from '@/components/ImageUpload';
import { updateOwnProfileAction } from '@/lib/actions/userActions';
import { useConfirm } from '@/components/ConfirmDialog';

interface ProfileClientProps {
  dictionary: Dictionary;
  locale: Locale;
  user: {
    id: string;
    email: string;
    username: string;
    fullName?: string;
    phoneNumber?: string;
    profilePicture?: string;
    role: string;
  };
}

export function ProfileClient({ dictionary, locale, user }: ProfileClientProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    phoneNumber: user.phoneNumber || '',
    email: user.email || '',
  });
  const [profilePicture, setProfilePicture] = useState(user.profilePicture || '');
  const [loading, setLoading] = useState(false);
  const { confirm, ConfirmDialog } = useConfirm();

  const displayName = formData.fullName?.trim() || user.username;
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || 'U';

  const handleImageUpload = async (file: File, croppedImageUrl: string) => {
    try {
      const uploadFormData = new FormData();
      
      // Convert cropped image URL to Blob
      const response = await fetch(croppedImageUrl);
      const blob = await response.blob();
      uploadFormData.append('file', blob, file.name);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (uploadResponse.ok) {
        const data = await uploadResponse.json();
        const newImageUrl = data.url;
        
        // Update local state immediately for instant preview
        setProfilePicture(newImageUrl);
        
        // Save immediately to database
        const result = await updateOwnProfileAction({
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          profilePicture: newImageUrl,
        });
        
        if (result.success) {
          // Show success message
          await confirm({
            title: dictionary.common.success || 'Success',
            description: dictionary.users?.profilePictureUpdated || 'Profile picture updated successfully!',
            confirmText: 'OK',
          });
          
          // Refresh to update header and all components
          router.refresh();
        } else {
          await confirm({
            title: dictionary.common.error || 'Error',
            description: result.error || 'Failed to save profile picture',
            confirmText: 'OK',
            variant: 'destructive',
          });
          // Revert to old image on error
          setProfilePicture(user.profilePicture || '');
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      await confirm({
        title: dictionary.common.error || 'Error',
        description: 'Failed to upload image. Please try again.',
        confirmText: 'OK',
        variant: 'destructive',
      });
    }
  };

  const handleImageError = async (message: string) => {
    await confirm({
      title: dictionary.common.error || 'Error',
      description: message,
      confirmText: 'OK',
      variant: 'destructive',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const confirmed = await confirm({
      title: dictionary.users?.updateProfile || 'Update Profile',
      description: dictionary.users?.confirmUpdate || 'Are you sure you want to update your profile?',
      confirmText: dictionary.common.save,
      cancelText: dictionary.common.cancel,
    });

    if (!confirmed) return;

    setLoading(true);

    const result = await updateOwnProfileAction({
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      profilePicture: profilePicture,
    });

    setLoading(false);

    if (result.success) {
      await confirm({
        title: dictionary.common.success || 'Success',
        description: dictionary.users?.profileUpdated || 'Profile updated successfully!',
        confirmText: 'OK',
      });
      router.refresh();
    } else {
      await confirm({
        title: dictionary.common.error || 'Error',
        description: result.error || 'Failed to update profile',
        confirmText: 'OK',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#262626] dark:text-white">
            {dictionary.users?.profile || 'Profile'}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {dictionary.users?.profileDescription || 'Manage your personal information and profile picture.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left column: identity + avatar */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="border-2 border-[#DDDDDD] dark:border-[#000000] bg-white dark:bg-[#262626] overflow-hidden">
                <CardHeader className="border-b-2 border-[#DDDDDD] dark:border-[#000000] bg-white dark:bg-[#262626]">
                  <CardTitle className="text-base font-bold text-[#262626] dark:text-white flex items-center gap-2">
                    <UserCircle className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                    {dictionary.users?.profile || 'Profile'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-[#DDDDDD] dark:border-[#000000] bg-[#262626] dark:bg-[#1a1a1a] flex items-center justify-center shrink-0">
                      {profilePicture ? (
                        <img
                          src={profilePicture}
                          alt={displayName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-bold text-sm">{initials}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-base font-bold text-[#262626] dark:text-white truncate">{displayName}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{user.email}</p>
                      <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-500 truncate">@{user.username}</p>
                    </div>
                  </div>

                  <div className="rounded-lg border-2 border-[#DDDDDD] dark:border-[#000000] bg-gray-50 dark:bg-[#1a1a1a] p-3">
                    <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                      <Shield className="h-4 w-4" />
                      <span className="font-semibold">{dictionary.users?.role || 'Role'}:</span>
                      <span className="font-bold text-[#262626] dark:text-white">{user.role}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Profile picture upload */}
              <Card className="border-2 border-[#DDDDDD] dark:border-[#000000] bg-white dark:bg-[#262626] overflow-hidden">
                <CardHeader className="border-b-2 border-[#DDDDDD] dark:border-[#000000] bg-white dark:bg-[#262626]">
                  <CardTitle className="text-base font-bold text-[#262626] dark:text-white flex items-center gap-2">
                    <Camera className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                    {dictionary.users?.profilePicture || 'Profile picture'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5">
                  <ImageUpload
                    onUpload={handleImageUpload}
                    currentImage={profilePicture}
                    aspectRatio={1}
                    maxSizeMB={5}
                    onError={handleImageError}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right column: editable fields */}
            <div className="lg:col-span-8 space-y-6">
              <Card className="border-2 border-[#DDDDDD] dark:border-[#000000] bg-white dark:bg-[#262626] overflow-hidden">
                <CardHeader className="border-b-2 border-[#DDDDDD] dark:border-[#000000] bg-white dark:bg-[#262626]">
                  <CardTitle className="text-base font-bold text-[#262626] dark:text-white flex items-center gap-2">
                    <User className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                    {dictionary.users?.personalInfo || 'Personal information'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-5 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName" className="text-sm font-semibold text-[#262626] dark:text-white">
                        {dictionary.common.fullName}
                      </Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder={dictionary.common.fullName}
                        className="h-11 border-2 border-[#DDDDDD] dark:border-[#000000] bg-white dark:bg-[#1a1a1a]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber" className="text-sm font-semibold text-[#262626] dark:text-white">
                        {dictionary.common.phoneNumber}
                      </Label>
                      <Input
                        id="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        placeholder={dictionary.common.phoneNumber}
                        className="h-11 border-2 border-[#DDDDDD] dark:border-[#000000] bg-white dark:bg-[#1a1a1a]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold text-[#262626] dark:text-white flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        {dictionary.common.email}
                      </Label>
                      <Input
                        id="email"
                        value={formData.email}
                        disabled
                        className="h-11 border-2 border-[#DDDDDD] dark:border-[#000000] bg-gray-100 dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300"
                      />
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {dictionary.users?.emailNote || 'Email cannot be changed.'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-sm font-semibold text-[#262626] dark:text-white flex items-center gap-2">
                        <UserCircle className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        {dictionary.common.username}
                      </Label>
                      <Input
                        id="username"
                        value={user.username}
                        disabled
                        className="h-11 border-2 border-[#DDDDDD] dark:border-[#000000] bg-gray-100 dark:bg-[#1a1a1a] text-gray-700 dark:text-gray-300"
                      />
                      <p className="text-xs text-gray-600 dark:text-gray-400">&nbsp;</p>
                    </div>
                  </div>

                  <div className="rounded-lg border-2 border-[#DDDDDD] dark:border-[#000000] bg-gray-50 dark:bg-[#1a1a1a] p-4">
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-gray-600 dark:text-gray-300 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-[#262626] dark:text-white">{dictionary.users?.contactInfo || 'Contact info'}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {dictionary.users?.contactInfoHint || 'Keep your phone number up to date so you can receive important notifications.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 px-5 bg-[#262626] hover:bg-[#1f1f1f] dark:bg-white dark:hover:bg-gray-100 text-white dark:text-[#262626] border-2 border-[#262626] dark:border-white"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {loading ? (dictionary.common.loading || 'Loading...') : dictionary.common.save}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <ConfirmDialog />
    </>
  );
}
