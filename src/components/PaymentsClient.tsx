'use client';

import { useState, useEffect } from 'react';
import { Upload, CheckCircle, XCircle, Clock, DollarSign, Calendar, User as UserIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import { getMyEnrollmentsAction, uploadPaymentProofAction } from '@/lib/actions/enrollmentActions';
import { getAdminSettingsAction } from '@/lib/actions/adminSettingsActions';
import type { Enrollment } from '@/lib/db/repositories/enrollmentRepository';
import type { AdminSettings } from '@/lib/db/repositories/adminSettingsRepository';
import type { Course } from '@/lib/db/repositories/courseRepository';
import type { User } from '@/lib/db/repositories/userRepository';
import { ImageUpload } from './ImageUpload';

interface EnrollmentWithDetails extends Enrollment {
  course?: Course;
  student?: User;
}

interface PaymentsClientProps {
  locale: string;
  dict: any;
  currentUser: User;
}

export default function PaymentsClient({ locale, dict, currentUser }: PaymentsClientProps) {
  const [enrollments, setEnrollments] = useState<EnrollmentWithDetails[]>([]);
  const [adminSettings, setAdminSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEnrollment, setSelectedEnrollment] = useState<EnrollmentWithDetails | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [uploadingProof, setUploadingProof] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    // Load enrollments
    const enrollmentsResult = await getMyEnrollmentsAction();
    if (enrollmentsResult.success && enrollmentsResult.enrollments) {
      setEnrollments(enrollmentsResult.enrollments);
    }
    
    // Load admin settings
    const settingsResult = await getAdminSettingsAction();
    if (settingsResult.success && settingsResult.settings) {
      setAdminSettings(settingsResult.settings);
    }
    
    setLoading(false);
  };

  const handlePaymentClick = (enrollment: EnrollmentWithDetails) => {
    setSelectedEnrollment(enrollment);
    setIsPaymentDialogOpen(true);
  };

  const handleImageUpload = async (file: File, croppedImageUrl: string) => {
    if (!selectedEnrollment) return;
    
    setUploadingProof(true);
    const result = await uploadPaymentProofAction(selectedEnrollment.id, croppedImageUrl);
    
    if (result.success) {
      setIsPaymentDialogOpen(false);
      setSelectedEnrollment(null);
      loadData();
    } else {
      alert(locale === 'ar' ? 'فشل في رفع إثبات الدفع' : 'Failed to upload payment proof');
    }
    setUploadingProof(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-4 h-4 mr-1" />
            {locale === 'ar' ? 'مدفوع' : 'Paid'}
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="w-4 h-4 mr-1" />
            {locale === 'ar' ? 'قيد المراجعة' : 'Pending Review'}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="w-4 h-4 mr-1" />
            {locale === 'ar' ? 'مرفوض' : 'Rejected'}
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="p-6">{locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {locale === 'ar' ? 'المدفوعات' : 'Payments'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {locale === 'ar' ? 'إدارة مدفوعات الدورات التدريبية' : 'Manage course payments'}
        </p>
      </div>

      {enrollments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {locale === 'ar' ? 'لا توجد تسجيلات' : 'No enrollments found'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enrollments.map((enrollment) => (
            <Card key={enrollment.id} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {locale === 'ar' ? enrollment.course?.nameAr : enrollment.course?.name}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      <div className="flex items-center gap-2 mt-2">
                        <UserIcon className="w-4 h-4" />
                        {enrollment.student?.fullName}
                      </div>
                    </CardDescription>
                  </div>
                  {getStatusBadge(enrollment.paymentStatus)}
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      {locale === 'ar' ? 'السعر' : 'Price'}
                    </span>
                    <span className="font-semibold">
                      {enrollment.course?.price} {enrollment.course?.currency}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {locale === 'ar' ? 'المدة' : 'Duration'}
                    </span>
                    <span className="font-semibold">
                      {enrollment.course?.duration} {locale === 'ar' ? 'شهر' : 'months'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {locale === 'ar' ? 'تاريخ التسجيل' : 'Enrollment Date'}
                    </span>
                    <span className="font-semibold">
                      {new Date(enrollment.enrollmentDate).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                    </span>
                  </div>
                </div>

                {enrollment.paymentStatus === 'pending' && enrollment.paymentProofUrl && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg text-sm">
                    <p className="text-yellow-800 dark:text-yellow-200">
                      {locale === 'ar' ? 'تم رفع إثبات الدفع وهو قيد المراجعة' : 'Payment proof uploaded and under review'}
                    </p>
                  </div>
                )}

                {enrollment.paymentStatus === 'rejected' && (
                  <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg text-sm">
                    <p className="text-red-800 dark:text-red-200">
                      {locale === 'ar' ? 'تم رفض إثبات الدفع. يرجى رفع إثبات جديد' : 'Payment proof rejected. Please upload a new proof'}
                    </p>
                    {enrollment.notes && (
                      <p className="mt-1 text-red-700 dark:text-red-300">
                        {locale === 'ar' ? 'ملاحظة: ' : 'Note: '}{enrollment.notes}
                      </p>
                    )}
                  </div>
                )}

                {(enrollment.paymentStatus === 'pending' && !enrollment.paymentProofUrl) || enrollment.paymentStatus === 'rejected' ? (
                  <Button 
                    onClick={() => handlePaymentClick(enrollment)}
                    className="w-full"
                    variant="default"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {locale === 'ar' ? 'رفع إثبات الدفع' : 'Upload Payment Proof'}
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {locale === 'ar' ? 'رفع إثبات الدفع' : 'Upload Payment Proof'}
            </DialogTitle>
            <DialogDescription>
              {locale === 'ar' 
                ? 'قم بتحويل المبلغ إلى الحساب أدناه ثم ارفع صورة إثبات الدفع' 
                : 'Transfer the amount to the account below and upload the payment proof'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Admin Payment Info */}
            {adminSettings && (
              <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-lg">
                    {locale === 'ar' ? 'معلومات الحساب البنكي' : 'Bank Account Information'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {adminSettings.fullName && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="font-semibold">{locale === 'ar' ? 'الاسم:' : 'Name:'}</span>
                      <span className="col-span-2">{adminSettings.fullName}</span>
                    </div>
                  )}
                  {adminSettings.phoneNumber && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="font-semibold">{locale === 'ar' ? 'الهاتف:' : 'Phone:'}</span>
                      <span className="col-span-2" dir="ltr">{adminSettings.phoneNumber}</span>
                    </div>
                  )}
                  {adminSettings.bankName && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="font-semibold">{locale === 'ar' ? 'البنك:' : 'Bank:'}</span>
                      <span className="col-span-2">{adminSettings.bankName}</span>
                    </div>
                  )}
                  {adminSettings.bankAccountNumber && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="font-semibold">{locale === 'ar' ? 'رقم الحساب:' : 'Account Number:'}</span>
                      <span className="col-span-2 font-mono" dir="ltr">{adminSettings.bankAccountNumber}</span>
                    </div>
                  )}
                  {adminSettings.bankAccountHolder && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="font-semibold">{locale === 'ar' ? 'اسم صاحب الحساب:' : 'Account Holder:'}</span>
                      <span className="col-span-2">{adminSettings.bankAccountHolder}</span>
                    </div>
                  )}
                  {adminSettings.iban && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="font-semibold">{locale === 'ar' ? 'IBAN:' : 'IBAN:'}</span>
                      <span className="col-span-2 font-mono text-sm" dir="ltr">{adminSettings.iban}</span>
                    </div>
                  )}
                  {adminSettings.swiftCode && (
                    <div className="grid grid-cols-3 gap-2">
                      <span className="font-semibold">{locale === 'ar' ? 'Swift Code:' : 'Swift Code:'}</span>
                      <span className="col-span-2 font-mono" dir="ltr">{adminSettings.swiftCode}</span>
                    </div>
                  )}
                  {(locale === 'ar' ? adminSettings.paymentInstructionsAr : adminSettings.paymentInstructions) && (
                    <div className="pt-2 border-t border-blue-200 dark:border-blue-800">
                      <p className="text-sm whitespace-pre-wrap">
                        {locale === 'ar' ? adminSettings.paymentInstructionsAr : adminSettings.paymentInstructions}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Course and Amount Info */}
            {selectedEnrollment && (
              <Card className="border-2 border-primary">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">{locale === 'ar' ? 'الدورة:' : 'Course:'}</span>
                      <span className="font-semibold">
                        {locale === 'ar' ? selectedEnrollment.course?.nameAr : selectedEnrollment.course?.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">{locale === 'ar' ? 'الطالب:' : 'Student:'}</span>
                      <span className="font-semibold">{selectedEnrollment.student?.fullName}</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold border-t pt-2 mt-2">
                      <span>{locale === 'ar' ? 'المبلغ المطلوب:' : 'Amount Due:'}</span>
                      <span className="text-primary">
                        {selectedEnrollment.course?.price} {selectedEnrollment.course?.currency}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Image Upload */}
            <div>
              <Label className="text-base font-semibold mb-4 block">
                {locale === 'ar' ? 'إثبات الدفع' : 'Payment Proof'}
              </Label>
              <ImageUpload
                onUpload={handleImageUpload}
                currentImage={selectedEnrollment?.paymentProofUrl}
                aspectRatio={16 / 9}
                maxSizeMB={5}
              />
            </div>

            {uploadingProof && (
              <div className="text-center text-sm text-muted-foreground">
                {locale === 'ar' ? 'جاري الرفع...' : 'Uploading...'}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
