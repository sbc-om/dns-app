'use server';

import {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  getScheduleByDate,
  updateSchedule,
  deleteSchedule,
  generateTimeSlots,
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  getAppointmentsByStatus,
  updateAppointment,
  deleteAppointment,
  type AppointmentSchedule,
  type Appointment,
  type TimeSlot,
} from '@/lib/db/repositories/appointmentRepository';

// Schedule Actions
export async function createScheduleAction(date: string, startHour: number, endHour: number) {
  try {
    // Check if schedule already exists for this date
    const existing = getScheduleByDate(date);
    if (existing) {
      return { success: false, error: 'Schedule already exists for this date' };
    }

    const timeSlots = generateTimeSlots(startHour, endHour);
    const schedule = createSchedule(date, timeSlots);
    
    return { success: true, schedule };
  } catch (error) {
    console.error('Error creating schedule:', error);
    return { success: false, error: 'Failed to create schedule' };
  }
}

export async function getSchedulesAction() {
  try {
    const schedules = getAllSchedules();
    return { success: true, schedules };
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return { success: false, error: 'Failed to fetch schedules' };
  }
}

export async function getScheduleByIdAction(id: string) {
  try {
    const schedule = getScheduleById(id);
    if (!schedule) {
      return { success: false, error: 'Schedule not found' };
    }
    return { success: true, schedule };
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return { success: false, error: 'Failed to fetch schedule' };
  }
}

export async function getScheduleByDateAction(date: string) {
  try {
    const schedule = getScheduleByDate(date);
    return { success: true, schedule };
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return { success: false, error: 'Failed to fetch schedule' };
  }
}

export async function updateScheduleAction(id: string, updates: Partial<AppointmentSchedule>) {
  try {
    const schedule = updateSchedule(id, updates);
    if (!schedule) {
      return { success: false, error: 'Schedule not found' };
    }
    return { success: true, schedule };
  } catch (error) {
    console.error('Error updating schedule:', error);
    return { success: false, error: 'Failed to update schedule' };
  }
}

export async function deleteScheduleAction(id: string) {
  try {
    const deleted = await deleteSchedule(id);
    if (!deleted) {
      return { success: false, error: 'Schedule not found' };
    }
    return { success: true };
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return { success: false, error: 'Failed to delete schedule' };
  }
}

// Appointment Actions
export async function createAppointmentAction(data: {
  fullName: string;
  mobileNumber: string;
  email: string;
  appointmentDate: string;
  appointmentTime: string;
}) {
  try {
    const appointment = createAppointment(data);
    if (!appointment) {
      return { success: false, error: 'Time slot is not available or schedule does not exist' };
    }
    return { success: true, appointment };
  } catch (error) {
    console.error('Error creating appointment:', error);
    return { success: false, error: 'Failed to create appointment' };
  }
}

export async function getAppointmentsAction() {
  try {
    const appointments = getAllAppointments();
    return { success: true, appointments };
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return { success: false, error: 'Failed to fetch appointments' };
  }
}

export async function getAppointmentByIdAction(id: string) {
  try {
    const appointment = getAppointmentById(id);
    if (!appointment) {
      return { success: false, error: 'Appointment not found' };
    }
    return { success: true, appointment };
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return { success: false, error: 'Failed to fetch appointment' };
  }
}

export async function getAppointmentsByStatusAction(status: Appointment['status']) {
  try {
    const appointments = getAppointmentsByStatus(status);
    return { success: true, appointments };
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return { success: false, error: 'Failed to fetch appointments' };
  }
}

export async function updateAppointmentAction(id: string, updates: Partial<Appointment>) {
  try {
    const appointment = updateAppointment(id, updates);
    if (!appointment) {
      return { success: false, error: 'Appointment not found' };
    }
    return { success: true, appointment };
  } catch (error) {
    console.error('Error updating appointment:', error);
    return { success: false, error: 'Failed to update appointment' };
  }
}

export async function deleteAppointmentAction(id: string) {
  try {
    const deleted = await deleteAppointment(id);
    if (!deleted) {
      return { success: false, error: 'Appointment not found' };
    }
    return { success: true };
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return { success: false, error: 'Failed to delete appointment' };
  }
}

// Get available dates (dates with schedules)
export async function getAvailableDatesAction() {
  try {
    const schedules = getAllSchedules();
    const availableDates = schedules
      .filter(schedule => schedule.timeSlots.some(slot => slot.isAvailable))
      .map(schedule => schedule.date);
    
    return { success: true, dates: availableDates };
  } catch (error) {
    console.error('Error fetching available dates:', error);
    return { success: false, error: 'Failed to fetch available dates' };
  }
}
