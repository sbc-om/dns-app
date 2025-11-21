'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  getAdminSettingsAction,
  updateAdminSettingsAction,
} from '@/lib/actions/adminSettingsActions';
import type { AdminSettings } from '@/lib/db/repositories/adminSettingsRepository';

interface AdminSettingsClientProps {
  locale: string;
  dict: any;
}

export default function AdminSettingsClient({ locale, dict }: AdminSettingsClientProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<AdminSettings>>({
    fullName: '',
    email: '',
    phoneNumber: '',
    bankName: '',
    bankAccountNumber: '',
    bankAccountHolder: '',
    iban: '',
    swiftCode: '',
    paymentInstructions: '',
    paymentInstructionsAr: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const result = await getAdminSettingsAction();
    if (result.success && result.settings) {
      setFormData(result.settings);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await updateAdminSettingsAction(formData);
    if (result.success) {
      alert(locale === 'ar' ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully');
    } else {
      alert(locale === 'ar' ? 'فشل في حفظ الإعدادات' : 'Failed to save settings');
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="p-6">{locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">
          {locale === 'ar' ? 'إعدادات النظام' : 'System Settings'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {locale === 'ar' ? 'إدارة معلومات الحساب البنكي وتعليمات الدفع' : 'Manage bank account information and payment instructions'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{locale === 'ar' ? 'المعلومات الشخصية' : 'Personal Information'}</CardTitle>
          <CardDescription>
            {locale === 'ar' ? 'معلومات الاتصال الخاصة بك' : 'Your contact information'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">{locale === 'ar' ? 'الاسم الكامل' : 'Full Name'}</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder={locale === 'ar' ? 'أدخل اسمك الكامل' : 'Enter your full name'}
              />
            </div>
            <div>
              <Label htmlFor="email">{locale === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={locale === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="phoneNumber">{locale === 'ar' ? 'رقم الهاتف' : 'Phone Number'}</Label>
            <Input
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              placeholder={locale === 'ar' ? 'أدخل رقم هاتفك' : 'Enter your phone number'}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{locale === 'ar' ? 'معلومات الحساب البنكي' : 'Bank Account Information'}</CardTitle>
          <CardDescription>
            {locale === 'ar' ? 'سيتم عرض هذه المعلومات للآباء عند الدفع' : 'This information will be displayed to parents during payment'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bankName">{locale === 'ar' ? 'اسم البنك' : 'Bank Name'}</Label>
              <Input
                id="bankName"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                placeholder={locale === 'ar' ? 'أدخل اسم البنك' : 'Enter bank name'}
              />
            </div>
            <div>
              <Label htmlFor="bankAccountHolder">{locale === 'ar' ? 'اسم صاحب الحساب' : 'Account Holder Name'}</Label>
              <Input
                id="bankAccountHolder"
                value={formData.bankAccountHolder}
                onChange={(e) => setFormData({ ...formData, bankAccountHolder: e.target.value })}
                placeholder={locale === 'ar' ? 'أدخل اسم صاحب الحساب' : 'Enter account holder name'}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bankAccountNumber">{locale === 'ar' ? 'رقم الحساب' : 'Account Number'}</Label>
              <Input
                id="bankAccountNumber"
                value={formData.bankAccountNumber}
                onChange={(e) => setFormData({ ...formData, bankAccountNumber: e.target.value })}
                placeholder={locale === 'ar' ? 'أدخل رقم الحساب' : 'Enter account number'}
              />
            </div>
            <div>
              <Label htmlFor="iban">{locale === 'ar' ? 'رقم الآيبان (IBAN)' : 'IBAN'}</Label>
              <Input
                id="iban"
                value={formData.iban}
                onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                placeholder={locale === 'ar' ? 'أدخل رقم الآيبان' : 'Enter IBAN'}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="swiftCode">{locale === 'ar' ? 'رمز السويفت (SWIFT)' : 'SWIFT Code'}</Label>
            <Input
              id="swiftCode"
              value={formData.swiftCode}
              onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })}
              placeholder={locale === 'ar' ? 'أدخل رمز السويفت' : 'Enter SWIFT code'}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{locale === 'ar' ? 'تعليمات الدفع' : 'Payment Instructions'}</CardTitle>
          <CardDescription>
            {locale === 'ar' ? 'إرشادات إضافية للآباء حول كيفية الدفع' : 'Additional instructions for parents on how to pay'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="paymentInstructions">{locale === 'ar' ? 'التعليمات (إنجليزي)' : 'Instructions (English)'}</Label>
            <textarea
              id="paymentInstructions"
              className="w-full min-h-[120px] px-3 py-2 border border-input rounded-md bg-background"
              value={formData.paymentInstructions}
              onChange={(e) => setFormData({ ...formData, paymentInstructions: e.target.value })}
              placeholder="Please transfer the amount to the account above and upload the receipt..."
            />
          </div>
          <div>
            <Label htmlFor="paymentInstructionsAr">{locale === 'ar' ? 'التعليمات (عربي)' : 'Instructions (Arabic)'}</Label>
            <textarea
              id="paymentInstructionsAr"
              className="w-full min-h-[120px] px-3 py-2 border border-input rounded-md bg-background"
              value={formData.paymentInstructionsAr}
              onChange={(e) => setFormData({ ...formData, paymentInstructionsAr: e.target.value })}
              placeholder="يرجى تحويل المبلغ إلى الحساب أعلاه ورفع إيصال الدفع..."
              dir="rtl"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? (locale === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (locale === 'ar' ? 'حفظ الإعدادات' : 'Save Settings')}
        </Button>
      </div>
    </div>
  );
}
