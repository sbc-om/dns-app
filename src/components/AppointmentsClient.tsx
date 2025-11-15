'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Mail, Phone, User, CheckCircle, XCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dictionary } from '@/lib/i18n/getDictionary';
import { Locale } from '@/config/i18n';
import {
  getAppointmentsAction,
  updateAppointmentAction,
} from '@/lib/actions/appointmentActions';
import { createUserAction } from '@/lib/actions/userActions';
import type { Appointment } from '@/lib/db/repositories/appointmentRepository';

interface AppointmentsClientProps {
  dictionary: Dictionary;
  locale: Locale;
}

export function AppointmentsClient({ dictionary, locale }: AppointmentsClientProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    const result = await getAppointmentsAction();
    if (result.success && result.appointments) {
      setAppointments(result.appointments);
    }
    setLoading(false);
  };

  const handleStatusUpdate = async (id: string, status: Appointment['status']) => {
    await updateAppointmentAction(id, { status });
    loadAppointments();
  };

  const handleRegisterUser = async (appointment: Appointment) => {
    // This would create parent, mother, and child accounts
    // For now, we'll just update the appointment status
    const confirmed = confirm(
      `This will create accounts for:\n- Parent\n- Mother\n- Child\n\nProceed?`
    );
    
    if (!confirmed) return;

    // Create parent account
    const parentResult = await createUserAction({
      email: appointment.email,
      username: appointment.email.split('@')[0] + '_parent',
      fullName: appointment.fullName + ' (Parent)',
      phoneNumber: appointment.mobileNumber,
      password: generateRandomPassword(),
    });

    // Create mother account
    const motherResult = await createUserAction({
      email: appointment.email.replace('@', '_mother@'),
      username: appointment.email.split('@')[0] + '_mother',
      fullName: appointment.fullName + ' (Mother)',
      phoneNumber: appointment.mobileNumber,
      password: generateRandomPassword(),
    });

    // Create child account
    const childResult = await createUserAction({
      email: appointment.email.replace('@', '_child@'),
      username: appointment.email.split('@')[0] + '_child',
      fullName: appointment.fullName + ' (Child)',
      phoneNumber: appointment.mobileNumber,
      password: generateRandomPassword(),
    });

    if (parentResult.success && motherResult.success && childResult.success) {
      await updateAppointmentAction(appointment.id, {
        status: 'completed',
        registeredUserIds: [parentResult.user!.id, motherResult.user!.id, childResult.user!.id],
      });
      loadAppointments();
      alert('Accounts created successfully! Credentials have been sent to the email.');
    } else {
      alert('Failed to create some accounts. Please try again.');
    }
  };

  const generateRandomPassword = () => {
    return Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8).toUpperCase();
  };

  const getStatusBadge = (status: Appointment['status']) => {
    const variants: Record<Appointment['status'], { variant: 'default' | 'secondary' | 'destructive' | 'outline', color: string }> = {
      pending: { variant: 'secondary', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      confirmed: { variant: 'default', color: 'bg-blue-100 text-blue-800 border-blue-300' },
      completed: { variant: 'default', color: 'bg-green-100 text-green-800 border-green-300' },
      cancelled: { variant: 'destructive', color: 'bg-red-100 text-red-800 border-red-300' },
    };

    return (
      <Badge className={`${variants[status].color} border-2 font-semibold`}>
        {dictionary.appointment[status]}
      </Badge>
    );
  };

  const filterAppointments = (status: Appointment['status']) => {
    return appointments.filter(apt => apt.status === status);
  };

  const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
    <Card
      className="border-2 border-purple-200 dark:border-purple-700 rounded-3xl overflow-hidden hover:shadow-xl transition-all cursor-pointer"
      onClick={() => {
        setSelectedAppointment(appointment);
        setDetailsOpen(true);
      }}
    >
      <CardHeader className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/50 dark:to-pink-900/50 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-purple-800 dark:text-purple-200 flex items-center gap-2">
            <User className="h-5 w-5" />
            {appointment.fullName}
          </CardTitle>
          {getStatusBadge(appointment.status)}
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Calendar className="h-4 w-4" />
          {new Date(appointment.appointmentDate).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Clock className="h-4 w-4" />
          {appointment.appointmentTime}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Mail className="h-4 w-4" />
          {appointment.email}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Phone className="h-4 w-4" />
          {appointment.mobileNumber}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          {dictionary.nav.appointments}
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {dictionary.appointment.viewAppointments}
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 rounded-2xl p-1 bg-purple-100 dark:bg-purple-900/30">
          <TabsTrigger value="pending" className="rounded-xl">
            {dictionary.appointment.pending} ({filterAppointments('pending').length})
          </TabsTrigger>
          <TabsTrigger value="confirmed" className="rounded-xl">
            {dictionary.appointment.confirmed} ({filterAppointments('confirmed').length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="rounded-xl">
            {dictionary.appointment.completed} ({filterAppointments('completed').length})
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="rounded-xl">
            {dictionary.appointment.cancelled} ({filterAppointments('cancelled').length})
          </TabsTrigger>
        </TabsList>

        {loading ? (
          <p className="text-center py-8 text-gray-600 dark:text-gray-400">{dictionary.common.loading}</p>
        ) : (
          <>
            <TabsContent value="pending">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filterAppointments('pending').map(apt => (
                  <AppointmentCard key={apt.id} appointment={apt} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="confirmed">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filterAppointments('confirmed').map(apt => (
                  <AppointmentCard key={apt.id} appointment={apt} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="completed">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filterAppointments('completed').map(apt => (
                  <AppointmentCard key={apt.id} appointment={apt} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="cancelled">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filterAppointments('cancelled').map(apt => (
                  <AppointmentCard key={apt.id} appointment={apt} />
                ))}
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-3xl">
          {selectedAppointment && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                  {dictionary.appointment.appointmentDetails}
                </DialogTitle>
                <DialogDescription>
                  {getStatusBadge(selectedAppointment.status)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    {dictionary.appointment.fullName}
                  </p>
                  <p className="text-lg font-bold text-purple-800 dark:text-purple-200">
                    {selectedAppointment.fullName}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                      {dictionary.appointment.email}
                    </p>
                    <p className="text-sm text-purple-800 dark:text-purple-200">
                      {selectedAppointment.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                      {dictionary.appointment.mobileNumber}
                    </p>
                    <p className="text-sm text-purple-800 dark:text-purple-200">
                      {selectedAppointment.mobileNumber}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                      {dictionary.appointment.appointmentDate}
                    </p>
                    <p className="text-sm text-purple-800 dark:text-purple-200">
                      {new Date(selectedAppointment.appointmentDate).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                      {dictionary.appointment.appointmentTime}
                    </p>
                    <p className="text-sm text-purple-800 dark:text-purple-200">
                      {selectedAppointment.appointmentTime}
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter className="flex flex-col gap-2">
                {selectedAppointment.status === 'pending' && (
                  <>
                    <Button
                      onClick={() => {
                        handleStatusUpdate(selectedAppointment.id, 'confirmed');
                        setDetailsOpen(false);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm Appointment
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        handleStatusUpdate(selectedAppointment.id, 'cancelled');
                        setDetailsOpen(false);
                      }}
                      className="w-full rounded-xl"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Appointment
                    </Button>
                  </>
                )}
                {selectedAppointment.status === 'confirmed' && (
                  <Button
                    onClick={() => {
                      handleRegisterUser(selectedAppointment);
                      setDetailsOpen(false);
                    }}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    {dictionary.appointment.createAccounts}
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
