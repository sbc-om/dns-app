'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Clock, DollarSign, Calendar, 
  User as UserIcon, Eye, FileText, MoreVertical, 
  Check, X, AlertCircle, RefreshCw, Search,
  TrendingUp, TrendingDown, Minus, Download
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import toast from 'react-hot-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { getMyEnrollmentsAction, getAllEnrollmentsAction, updatePaymentStatusAction } from '@/lib/actions/enrollmentActions';
import type { Enrollment } from '@/lib/db/repositories/enrollmentRepository';
import type { Course } from '@/lib/db/repositories/courseRepository';
import type { User } from '@/lib/db/repositories/userRepository';

interface EnrollmentWithDetails extends Enrollment {
  course?: Course | null;
  student?: User | null;
}

interface PaymentsClientProps {
  locale: string;
  dict: any;
  currentUser: {
    id: string;
    email: string;
    role: string;
    fullName?: string;
  };
}

export default function PaymentsClient({ locale, dict, currentUser }: PaymentsClientProps) {
  const [enrollments, setEnrollments] = useState<EnrollmentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<EnrollmentWithDetails | null>(null);
  const [newStatus, setNewStatus] = useState<'pending' | 'paid' | 'rejected'>('paid');
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    const enrollmentsResult = currentUser.role === 'admin' 
      ? await getAllEnrollmentsAction()
      : await getMyEnrollmentsAction();
      
    if (enrollmentsResult.success && enrollmentsResult.enrollments) {
      setEnrollments(enrollmentsResult.enrollments);
    }
    
    setLoading(false);
  };

  const handleStatusUpdate = async () => {
    if (!selectedEnrollment) return;

    setUpdating(true);
    try {
      const result = await updatePaymentStatusAction(
        selectedEnrollment.id,
        newStatus,
        notes || undefined
      );

      if (result.success) {
        setEnrollments(prevEnrollments => 
          prevEnrollments.map(enr => 
            enr.id === selectedEnrollment.id 
              ? { ...enr, paymentStatus: newStatus, paymentDate: newStatus === 'paid' ? new Date().toISOString() : enr.paymentDate }
              : enr
          )
        );

        const statusText = newStatus === 'paid' 
          ? (locale === 'ar' ? 'مدفوع' : 'Paid')
          : newStatus === 'pending' 
          ? (locale === 'ar' ? 'قيد الانتظار' : 'Pending')
          : (locale === 'ar' ? 'مرفوض' : 'Rejected');

        toast.success(
          locale === 'ar' 
            ? `✅ تم تغيير حالة الدفع إلى "${statusText}"`
            : `✅ Payment status changed to "${statusText}"`,
          {
            duration: 3000,
            position: 'top-center',
            style: {
              background: '#10b981',
              color: '#fff',
              fontWeight: '600',
              padding: '16px',
              borderRadius: '12px',
            },
          }
        );

        setStatusDialogOpen(false);
        setSelectedEnrollment(null);
        setNotes('');
      } else {
        toast.error(
          result.error || (locale === 'ar' ? '❌ حدث خطأ أثناء التحديث' : '❌ An error occurred'),
          {
            duration: 4000,
            position: 'top-center',
            style: {
              background: '#ef4444',
              color: '#fff',
              fontWeight: '600',
              padding: '16px',
              borderRadius: '12px',
            },
          }
        );
      }
    } catch (error) {
      console.error('Failed to update payment status:', error);
      toast.error(
        locale === 'ar' ? '❌ حدث خطأ غير متوقع' : '❌ An unexpected error occurred',
        {
          duration: 4000,
          position: 'top-center',
          style: {
            background: '#ef4444',
            color: '#fff',
            fontWeight: '600',
            padding: '16px',
            borderRadius: '12px',
          },
        }
      );
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <Badge className="bg-linear-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg">
            <CheckCircle className="w-3.5 h-3.5 mr-1" />
            {locale === 'ar' ? 'مدفوع' : 'Paid'}
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-linear-to-r from-orange-500 to-yellow-500 text-white border-0 shadow-lg">
            <Clock className="w-3.5 h-3.5 mr-1" />
            {locale === 'ar' ? 'قيد المراجعة' : 'Pending'}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-linear-to-r from-red-500 to-rose-500 text-white border-0 shadow-lg">
            <XCircle className="w-3.5 h-3.5 mr-1" />
            {locale === 'ar' ? 'مرفوض' : 'Rejected'}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="border-gray-300">
            <Minus className="w-3.5 h-3.5 mr-1" />
            {locale === 'ar' ? 'غير مدفوع' : 'Unpaid'}
          </Badge>
        );
    }
  };

  // Filter enrollments
  const filteredEnrollments = enrollments.filter(enr => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      enr.student?.fullName?.toLowerCase().includes(query) ||
      enr.course?.name?.toLowerCase().includes(query) ||
      enr.course?.nameAr?.includes(query)
    );
  });

  const pendingEnrollments = filteredEnrollments.filter(e => e.paymentStatus === 'pending');
  const paidEnrollments = filteredEnrollments.filter(e => e.paymentStatus === 'paid');
  const unpaidEnrollments = filteredEnrollments.filter(e => !e.paymentStatus);
  const rejectedEnrollments = filteredEnrollments.filter(e => e.paymentStatus === 'rejected');

  // Calculate statistics
  const totalAmount = enrollments.reduce((sum, e) => sum + (e.course?.price || 0), 0);
  const paidAmount = paidEnrollments.reduce((sum, e) => sum + (e.course?.price || 0), 0);
  const pendingAmount = pendingEnrollments.reduce((sum, e) => sum + (e.course?.price || 0), 0);
  const unpaidAmount = unpaidEnrollments.reduce((sum, e) => sum + (e.course?.price || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-12 h-12 animate-spin text-[#30B2D2]" />
          <p className="text-muted-foreground text-lg">
            {locale === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // Admin View
  if (currentUser.role === 'admin') {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto pb-24 md:pb-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-[#30B2D2] to-[#1E3A8A] bg-clip-text text-transparent">
              {locale === 'ar' ? '💰 إدارة المدفوعات' : '💰 Payment Management'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {locale === 'ar' ? 'مراجعة وإدارة مدفوعات الطلاب' : 'Review and manage student payments'}
            </p>
          </div>
          <Button 
            onClick={loadData} 
            variant="outline"
            className="flex items-center gap-2 hover:bg-gray-100 active:scale-95 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            {locale === 'ar' ? 'تحديث' : 'Refresh'}
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-lg bg-linear-to-br from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">
                    {locale === 'ar' ? 'المدفوعات' : 'Paid'}
                  </p>
                  <p className="text-2xl font-bold text-green-900 mt-2">
                    {paidAmount.toLocaleString()} {locale === 'ar' ? 'ر.ع' : 'OMR'}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {paidEnrollments.length} {locale === 'ar' ? 'معاملة' : 'transactions'}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-green-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-linear-to-br from-orange-50 to-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">
                    {locale === 'ar' ? 'قيد المراجعة' : 'Pending'}
                  </p>
                  <p className="text-2xl font-bold text-orange-900 mt-2">
                    {pendingAmount.toLocaleString()} {locale === 'ar' ? 'ر.ع' : 'OMR'}
                  </p>
                  <p className="text-xs text-orange-600 mt-1">
                    {pendingEnrollments.length} {locale === 'ar' ? 'معاملة' : 'transactions'}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-2xl">
                  <Clock className="w-6 h-6 text-orange-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-linear-to-br from-red-50 to-rose-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700">
                    {locale === 'ar' ? 'غير مدفوع' : 'Unpaid'}
                  </p>
                  <p className="text-2xl font-bold text-red-900 mt-2">
                    {unpaidAmount.toLocaleString()} {locale === 'ar' ? 'ر.ع' : 'OMR'}
                  </p>
                  <p className="text-xs text-red-600 mt-1">
                    {unpaidEnrollments.length} {locale === 'ar' ? 'معاملة' : 'transactions'}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-2xl">
                  <TrendingDown className="w-6 h-6 text-red-700" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-linear-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">
                    {locale === 'ar' ? 'الإجمالي' : 'Total'}
                  </p>
                  <p className="text-2xl font-bold text-blue-900 mt-2">
                    {totalAmount.toLocaleString()} {locale === 'ar' ? 'ر.ع' : 'OMR'}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {enrollments.length} {locale === 'ar' ? 'معاملة' : 'transactions'}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-2xl">
                  <DollarSign className="w-6 h-6 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder={locale === 'ar' ? 'بحث عن طالب أو دورة...' : 'Search for student or course...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 border-2 focus:border-[#30B2D2] transition-colors"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-xl">
            <TabsTrigger 
              value="pending" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-lg transition-all"
            >
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">{locale === 'ar' ? 'قيد المراجعة' : 'Pending'}</span>
              <Badge variant="secondary" className="ml-1">{pendingEnrollments.length}</Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="paid" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-lg transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">{locale === 'ar' ? 'مدفوع' : 'Paid'}</span>
              <Badge variant="secondary" className="ml-1">{paidEnrollments.length}</Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="unpaid" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-lg transition-all"
            >
              <XCircle className="w-4 h-4" />
              <span className="hidden sm:inline">{locale === 'ar' ? 'غير مدفوع' : 'Unpaid'}</span>
              <Badge variant="secondary" className="ml-1">{unpaidEnrollments.length}</Badge>
            </TabsTrigger>
            <TabsTrigger 
              value="rejected" 
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-lg rounded-lg transition-all"
            >
              <AlertCircle className="w-4 h-4" />
              <span className="hidden sm:inline">{locale === 'ar' ? 'مرفوض' : 'Rejected'}</span>
              <Badge variant="secondary" className="ml-1">{rejectedEnrollments.length}</Badge>
            </TabsTrigger>
          </TabsList>

          {/* Pending Tab */}
          <TabsContent value="pending" className="space-y-4">
            {pendingEnrollments.length === 0 ? (
              <Card className="border-2 border-dashed">
                <CardContent className="p-12 text-center">
                  <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground text-lg">
                    {locale === 'ar' ? 'لا توجد مدفوعات قيد المراجعة' : 'No pending payments'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {pendingEnrollments.map((enrollment) => (
                  <Card key={enrollment.id} className="overflow-hidden border-2 border-orange-200 hover:shadow-xl transition-shadow">
                    <CardHeader className="bg-linear-to-r from-orange-50 to-yellow-50 pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg line-clamp-1">
                            {locale === 'ar' ? enrollment.course?.nameAr : enrollment.course?.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <UserIcon className="w-4 h-4 shrink-0" />
                            <span className="line-clamp-1">{enrollment.student?.fullName}</span>
                          </div>
                        </div>
                        {getStatusBadge(enrollment.paymentStatus)}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{locale === 'ar' ? 'المبلغ' : 'Amount'}</span>
                          <span className="font-bold text-lg bg-linear-to-r from-[#30B2D2] to-[#1E3A8A] bg-clip-text text-transparent">
                            {enrollment.course?.price} {enrollment.course?.currency}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{locale === 'ar' ? 'تاريخ التسجيل' : 'Enrollment Date'}</span>
                          <span className="font-medium">
                            {new Date(enrollment.enrollmentDate).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                          </span>
                        </div>
                        {enrollment.paymentProofUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedImage(enrollment.paymentProofUrl || null);
                              setImageDialogOpen(true);
                            }}
                            className="w-full mt-2 hover:bg-blue-50"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            {locale === 'ar' ? 'عرض إثبات الدفع' : 'View Payment Proof'}
                          </Button>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button 
                          onClick={() => {
                            setSelectedEnrollment(enrollment);
                            setNewStatus('paid');
                            setNotes('');
                            setStatusDialogOpen(true);
                          }}
                          className="flex-1 bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg active:scale-95 transition-all"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          {locale === 'ar' ? 'موافقة' : 'Approve'}
                        </Button>
                        <Button 
                          onClick={() => {
                            setSelectedEnrollment(enrollment);
                            setNewStatus('rejected');
                            setNotes('');
                            setStatusDialogOpen(true);
                          }}
                          variant="destructive"
                          className="flex-1 shadow-lg active:scale-95 transition-all"
                        >
                          <X className="w-4 h-4 mr-2" />
                          {locale === 'ar' ? 'رفض' : 'Reject'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Paid Tab */}
          <TabsContent value="paid" className="space-y-4">
            {paidEnrollments.length === 0 ? (
              <Card className="border-2 border-dashed">
                <CardContent className="p-12 text-center">
                  <CheckCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground text-lg">
                    {locale === 'ar' ? 'لا توجد مدفوعات مكتملة' : 'No completed payments'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {paidEnrollments.map((enrollment) => (
                  <Card key={enrollment.id} className="overflow-hidden border-2 border-green-200 hover:shadow-xl transition-shadow">
                    <CardHeader className="bg-linear-to-r from-green-50 to-emerald-50 pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg line-clamp-1">
                            {locale === 'ar' ? enrollment.course?.nameAr : enrollment.course?.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <UserIcon className="w-4 h-4 shrink-0" />
                            <span className="line-clamp-1">{enrollment.student?.fullName}</span>
                          </div>
                        </div>
                        {getStatusBadge(enrollment.paymentStatus)}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{locale === 'ar' ? 'المبلغ' : 'Amount'}</span>
                          <span className="font-bold text-lg text-green-700">
                            {enrollment.course?.price} {enrollment.course?.currency}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{locale === 'ar' ? 'تاريخ الدفع' : 'Payment Date'}</span>
                          <span className="font-medium">
                            {enrollment.paymentDate ? new Date(enrollment.paymentDate).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US') : '-'}
                          </span>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="outline"
                            size="sm"
                            className="w-full hover:bg-gray-100 active:scale-95 transition-all"
                          >
                            <MoreVertical className="w-4 h-4 mr-2" />
                            {locale === 'ar' ? 'تغيير الحالة' : 'Change Status'}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>{locale === 'ar' ? 'تحديث حالة الدفع' : 'Update Payment Status'}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedEnrollment(enrollment);
                              setNewStatus('pending');
                              setNotes('');
                              setStatusDialogOpen(true);
                            }}
                            className="cursor-pointer"
                          >
                            <AlertCircle className="w-4 h-4 mr-2 text-orange-600" />
                            <span>{locale === 'ar' ? 'قيد الانتظار' : 'Mark as Pending'}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedEnrollment(enrollment);
                              setNewStatus('rejected');
                              setNotes('');
                              setStatusDialogOpen(true);
                            }}
                            className="cursor-pointer"
                          >
                            <X className="w-4 h-4 mr-2 text-red-600" />
                            <span>{locale === 'ar' ? 'رفض' : 'Mark as Rejected'}</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Unpaid Tab */}
          <TabsContent value="unpaid" className="space-y-4">
            {unpaidEnrollments.length === 0 ? (
              <Card className="border-2 border-dashed">
                <CardContent className="p-12 text-center">
                  <DollarSign className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground text-lg">
                    {locale === 'ar' ? 'جميع الطلاب دفعوا' : 'All students have paid'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {unpaidEnrollments.map((enrollment) => (
                  <Card key={enrollment.id} className="overflow-hidden border-2 border-red-200 hover:shadow-xl transition-shadow">
                    <CardHeader className="bg-linear-to-r from-red-50 to-rose-50 pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg line-clamp-1">
                            {locale === 'ar' ? enrollment.course?.nameAr : enrollment.course?.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <UserIcon className="w-4 h-4 shrink-0" />
                            <span className="line-clamp-1">{enrollment.student?.fullName}</span>
                          </div>
                        </div>
                        {getStatusBadge(enrollment.paymentStatus)}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{locale === 'ar' ? 'المبلغ المطلوب' : 'Amount Due'}</span>
                          <span className="font-bold text-lg text-red-700">
                            {enrollment.course?.price} {enrollment.course?.currency}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{locale === 'ar' ? 'تاريخ التسجيل' : 'Enrollment Date'}</span>
                          <span className="font-medium">
                            {new Date(enrollment.enrollmentDate).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                          </span>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            className="w-full bg-linear-to-r from-[#30B2D2] to-[#1E3A8A] hover:from-[#1E3A8A] hover:to-[#30B2D2] text-white shadow-lg active:scale-95 transition-all"
                          >
                            <MoreVertical className="w-4 h-4 mr-2" />
                            {locale === 'ar' ? 'تغيير الحالة' : 'Change Status'}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>{locale === 'ar' ? 'تحديث حالة الدفع' : 'Update Payment Status'}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedEnrollment(enrollment);
                              setNewStatus('paid');
                              setNotes('');
                              setStatusDialogOpen(true);
                            }}
                            className="cursor-pointer"
                          >
                            <Check className="w-4 h-4 mr-2 text-green-600" />
                            <span>{locale === 'ar' ? 'تم الدفع نقداً' : 'Mark as Paid (Cash)'}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedEnrollment(enrollment);
                              setNewStatus('rejected');
                              setNotes('');
                              setStatusDialogOpen(true);
                            }}
                            className="cursor-pointer"
                          >
                            <X className="w-4 h-4 mr-2 text-red-600" />
                            <span>{locale === 'ar' ? 'رفض' : 'Mark as Rejected'}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedEnrollment(enrollment);
                              setNewStatus('pending');
                              setNotes('');
                              setStatusDialogOpen(true);
                            }}
                            className="cursor-pointer"
                          >
                            <AlertCircle className="w-4 h-4 mr-2 text-orange-600" />
                            <span>{locale === 'ar' ? 'قيد الانتظار' : 'Mark as Pending'}</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Rejected Tab */}
          <TabsContent value="rejected" className="space-y-4">
            {rejectedEnrollments.length === 0 ? (
              <Card className="border-2 border-dashed">
                <CardContent className="p-12 text-center">
                  <XCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground text-lg">
                    {locale === 'ar' ? 'لا توجد مدفوعات مرفوضة' : 'No rejected payments'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {rejectedEnrollments.map((enrollment) => (
                  <Card key={enrollment.id} className="overflow-hidden border-2 border-red-300 hover:shadow-xl transition-shadow">
                    <CardHeader className="bg-linear-to-r from-red-50 to-rose-50 pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg line-clamp-1">
                            {locale === 'ar' ? enrollment.course?.nameAr : enrollment.course?.name}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <UserIcon className="w-4 h-4 shrink-0" />
                            <span className="line-clamp-1">{enrollment.student?.fullName}</span>
                          </div>
                        </div>
                        {getStatusBadge(enrollment.paymentStatus)}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">{locale === 'ar' ? 'المبلغ' : 'Amount'}</span>
                          <span className="font-bold text-lg text-red-700">
                            {enrollment.course?.price} {enrollment.course?.currency}
                          </span>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="outline"
                            size="sm"
                            className="w-full hover:bg-gray-100 active:scale-95 transition-all"
                          >
                            <MoreVertical className="w-4 h-4 mr-2" />
                            {locale === 'ar' ? 'تغيير الحالة' : 'Change Status'}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuLabel>{locale === 'ar' ? 'تحديث حالة الدفع' : 'Update Payment Status'}</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedEnrollment(enrollment);
                              setNewStatus('paid');
                              setNotes('');
                              setStatusDialogOpen(true);
                            }}
                            className="cursor-pointer"
                          >
                            <Check className="w-4 h-4 mr-2 text-green-600" />
                            <span>{locale === 'ar' ? 'موافقة' : 'Approve'}</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              setSelectedEnrollment(enrollment);
                              setNewStatus('pending');
                              setNotes('');
                              setStatusDialogOpen(true);
                            }}
                            className="cursor-pointer"
                          >
                            <AlertCircle className="w-4 h-4 mr-2 text-orange-600" />
                            <span>{locale === 'ar' ? 'قيد الانتظار' : 'Mark as Pending'}</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Status Change Dialog */}
        <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${
                  newStatus === 'paid' 
                    ? 'bg-linear-to-br from-green-100 to-emerald-100 text-green-700' 
                    : newStatus === 'rejected'
                    ? 'bg-linear-to-br from-red-100 to-rose-100 text-red-700'
                    : 'bg-linear-to-br from-orange-100 to-yellow-100 text-orange-700'
                }`}>
                  {newStatus === 'paid' && <Check className="w-6 h-6" />}
                  {newStatus === 'rejected' && <X className="w-6 h-6" />}
                  {newStatus === 'pending' && <AlertCircle className="w-6 h-6" />}
                </div>
                <div>
                  <DialogTitle className="text-xl">
                    {locale === 'ar' ? 'تغيير حالة الدفع' : 'Change Payment Status'}
                  </DialogTitle>
                  <DialogDescription className="mt-1">
                    {locale === 'ar' 
                      ? `تحويل الحالة إلى "${newStatus === 'paid' ? 'مدفوع' : newStatus === 'pending' ? 'قيد الانتظار' : 'مرفوض'}"`
                      : `Update status to "${newStatus === 'paid' ? 'Paid' : newStatus === 'pending' ? 'Pending' : 'Rejected'}"`
                    }
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {selectedEnrollment && (
                <div className="space-y-3 p-4 bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium">{locale === 'ar' ? 'الدورة' : 'Course'}:</span>
                    <span className="font-semibold">
                      {locale === 'ar' ? selectedEnrollment.course?.nameAr : selectedEnrollment.course?.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium">{locale === 'ar' ? 'الطالب' : 'Student'}:</span>
                    <span className="font-semibold">{selectedEnrollment.student?.fullName}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground font-medium">{locale === 'ar' ? 'المبلغ' : 'Amount'}:</span>
                    <span className="font-bold text-lg bg-linear-to-r from-[#30B2D2] to-[#1E3A8A] bg-clip-text text-transparent">
                      {selectedEnrollment.course?.price} {selectedEnrollment.course?.currency}
                    </span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-semibold">
                  {locale === 'ar' ? 'ملاحظات (اختياري)' : 'Notes (Optional)'}
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={locale === 'ar' ? 'أضف ملاحظات أو سبب التغيير...' : 'Add notes or reason for change...'}
                  className="h-24 resize-none border-2 focus:border-[#30B2D2] transition-colors"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setStatusDialogOpen(false)}
                disabled={updating}
                className="hover:bg-gray-100 active:scale-95 transition-all"
              >
                {locale === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                onClick={handleStatusUpdate}
                disabled={updating}
                className={`shadow-lg active:scale-95 transition-all ${
                  newStatus === 'paid'
                    ? 'bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                    : newStatus === 'rejected'
                    ? 'bg-linear-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white'
                    : 'bg-linear-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white'
                }`}
              >
                {updating ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    {locale === 'ar' ? 'جارٍ التحديث...' : 'Updating...'}
                  </span>
                ) : (
                  <>
                    {newStatus === 'paid' && <Check className="w-4 h-4 mr-2" />}
                    {newStatus === 'rejected' && <X className="w-4 h-4 mr-2" />}
                    {newStatus === 'pending' && <AlertCircle className="w-4 h-4 mr-2" />}
                    {locale === 'ar' ? 'تأكيد التغيير' : 'Confirm Change'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Image Preview Dialog */}
        <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle>{locale === 'ar' ? 'إثبات الدفع' : 'Payment Proof'}</DialogTitle>
            </DialogHeader>
            {selectedImage && (
              <div className="relative w-full h-[500px] bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={selectedImage}
                  alt="Payment Proof"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setImageDialogOpen(false)}>
                {locale === 'ar' ? 'إغلاق' : 'Close'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Parent View - Simple view for parents
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto pb-24 md:pb-6">
      <div>
        <h1 className="text-3xl font-bold bg-linear-to-r from-[#30B2D2] to-[#1E3A8A] bg-clip-text text-transparent">
          {locale === 'ar' ? 'المدفوعات' : 'Payments'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {locale === 'ar' ? 'إدارة مدفوعات الدورات التدريبية' : 'Manage course payments'}
        </p>
      </div>

      {enrollments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <DollarSign className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground text-lg">
              {locale === 'ar' ? 'لا توجد مدفوعات' : 'No payments found'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enrollments.map((enrollment) => (
            <Card key={enrollment.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="bg-linear-to-r from-blue-50 to-cyan-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      {locale === 'ar' ? enrollment.course?.nameAr : enrollment.course?.name}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {enrollment.course?.price} {enrollment.course?.currency}
                    </CardDescription>
                  </div>
                  {getStatusBadge(enrollment.paymentStatus)}
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{locale === 'ar' ? 'تاريخ التسجيل' : 'Enrollment Date'}:</span>
                    <span className="font-medium">
                      {new Date(enrollment.enrollmentDate).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                    </span>
                  </div>
                  {enrollment.paymentDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{locale === 'ar' ? 'تاريخ الدفع' : 'Payment Date'}:</span>
                      <span className="font-medium">
                        {new Date(enrollment.paymentDate).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
