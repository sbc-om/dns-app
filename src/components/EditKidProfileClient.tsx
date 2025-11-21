'use client';

import { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import { User } from '@/lib/db/repositories/userRepository';
import { updateUserAction } from '@/lib/actions/userActions';
import { useRouter } from 'next/navigation';

interface EditKidProfileClientProps {
  dictionary: Dictionary;
  locale: Locale;
  kid: User;
}

export function EditKidProfileClient({
  dictionary,
  locale,
  kid,
}: EditKidProfileClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: kid.fullName || '',
    email: kid.email || '',
    phoneNumber: kid.phoneNumber || '',
    nationalId: kid.nationalId || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await updateUserAction(kid.id, formData);

    setLoading(false);

    if (result.success) {
      alert(dictionary.users?.profileUpdated || 'Profile updated successfully!');
      router.push(`/${locale}/dashboard/kids/${kid.id}`);
    } else {
      alert(result.error || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    router.push(`/${locale}/dashboard/kids/${kid.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={handleCancel}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-[#1E3A8A]">
            {dictionary.users?.editUser || 'Edit Profile'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Update kid information and details
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card className="border-2 border-[#1E3A8A]/20">
          <CardHeader className="bg-linear-to-r from-[#1E3A8A]/10 to-[#30B2D2]/10">
            <CardTitle className="text-xl font-bold text-[#1E3A8A]">
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* Full Name */}
            <div>
              <Label htmlFor="fullName">{dictionary.common?.fullName || 'Full Name'}</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="Enter full name"
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">{dictionary.common?.email || 'Email'}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={dictionary.auth?.emailPlaceholder || 'Enter email'}
              />
            </div>

            {/* Phone Number */}
            <div>
              <Label htmlFor="phoneNumber">{dictionary.common?.phoneNumber || 'Phone Number'}</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>

            {/* National ID */}
            <div>
              <Label htmlFor="nationalId">{dictionary.users?.nationalId || 'National ID'}</Label>
              <Input
                id="nationalId"
                value={formData.nationalId}
                onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                placeholder={dictionary.users?.nationalIdPlaceholder || 'Enter national ID'}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
            {dictionary.common?.cancel || 'Cancel'}
          </Button>
          <Button
            type="submit"
            className="bg-[#30B2D2] hover:bg-[#1E3A8A] text-white"
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? (dictionary.common?.loading || 'Saving...') : (dictionary.common?.save || 'Save Changes')}
          </Button>
        </div>
      </form>
    </div>
  );
}
