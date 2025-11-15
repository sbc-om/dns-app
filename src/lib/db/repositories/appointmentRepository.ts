import { getDatabase } from '../lmdb';
import { nanoid } from 'nanoid';

export interface TimeSlot {
  time: string; // HH:mm format
  isAvailable: boolean;
}

export interface AppointmentSchedule {
  id: string;
  date: string; // YYYY-MM-DD format
  timeSlots: TimeSlot[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  fullName: string;
  mobileNumber: string;
  email: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:mm
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: Date;
  registeredUserIds?: string[]; // IDs of created users (parent, mother, child)
  notes?: string;
}

const SCHEDULES_PREFIX = 'schedule:';
const APPOINTMENTS_PREFIX = 'appointment:';
const SCHEDULE_INDEX_KEY = 'schedules:index';
const APPOINTMENT_INDEX_KEY = 'appointments:index';

// Schedule Management
export function createSchedule(date: string, timeSlots: TimeSlot[]): AppointmentSchedule {
  const db = getDatabase();
  const id = nanoid();
  
  const schedule: AppointmentSchedule = {
    id,
    date,
    timeSlots,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  db.put(`${SCHEDULES_PREFIX}${id}`, schedule);
  
  // Update index
  const scheduleIds = db.get(SCHEDULE_INDEX_KEY) || [];
  if (!scheduleIds.includes(id)) {
    db.put(SCHEDULE_INDEX_KEY, [...scheduleIds, id]);
  }

  return schedule;
}

export function getScheduleByDate(date: string): AppointmentSchedule | null {
  const db = getDatabase();
  const scheduleIds = db.get(SCHEDULE_INDEX_KEY) || [];
  
  for (const id of scheduleIds) {
    const schedule = db.get(`${SCHEDULES_PREFIX}${id}`);
    if (schedule && schedule.date === date) {
      return schedule;
    }
  }
  
  return null;
}

export function getScheduleById(id: string): AppointmentSchedule | null {
  const db = getDatabase();
  return db.get(`${SCHEDULES_PREFIX}${id}`) || null;
}

export function getAllSchedules(): AppointmentSchedule[] {
  const db = getDatabase();
  const scheduleIds = db.get(SCHEDULE_INDEX_KEY) || [];
  
  return scheduleIds
    .map((id: string) => db.get(`${SCHEDULES_PREFIX}${id}`))
    .filter((schedule: AppointmentSchedule | undefined) => schedule !== undefined)
    .sort((a: AppointmentSchedule, b: AppointmentSchedule) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
}

export function updateSchedule(id: string, updates: Partial<AppointmentSchedule>): AppointmentSchedule | null {
  const db = getDatabase();
  const schedule = db.get(`${SCHEDULES_PREFIX}${id}`);
  
  if (!schedule) {
    return null;
  }

  const updatedSchedule = {
    ...schedule,
    ...updates,
    id,
    updatedAt: new Date(),
  };

  db.put(`${SCHEDULES_PREFIX}${id}`, updatedSchedule);
  return updatedSchedule;
}

export async function deleteSchedule(id: string): Promise<boolean> {
  const db = getDatabase();
  
  // Remove from index
  const scheduleIds = db.get(SCHEDULE_INDEX_KEY) || [];
  const filteredIds = scheduleIds.filter((sid: string) => sid !== id);
  db.put(SCHEDULE_INDEX_KEY, filteredIds);
  
  // Delete schedule
  return await db.remove(`${SCHEDULES_PREFIX}${id}`);
}

// Appointment Management
export function createAppointment(data: {
  fullName: string;
  mobileNumber: string;
  email: string;
  appointmentDate: string;
  appointmentTime: string;
}): Appointment | null {
  const db = getDatabase();
  
  // Check if time slot is available
  const schedule = getScheduleByDate(data.appointmentDate);
  if (!schedule) {
    return null;
  }

  const timeSlot = schedule.timeSlots.find(slot => slot.time === data.appointmentTime);
  if (!timeSlot || !timeSlot.isAvailable) {
    return null;
  }

  const id = nanoid();
  const appointment: Appointment = {
    id,
    ...data,
    status: 'pending',
    createdAt: new Date(),
  };

  db.put(`${APPOINTMENTS_PREFIX}${id}`, appointment);
  
  // Update index
  const appointmentIds = db.get(APPOINTMENT_INDEX_KEY) || [];
  db.put(APPOINTMENT_INDEX_KEY, [...appointmentIds, id]);

  // Mark time slot as unavailable
  const updatedTimeSlots = schedule.timeSlots.map(slot =>
    slot.time === data.appointmentTime ? { ...slot, isAvailable: false } : slot
  );
  updateSchedule(schedule.id, { timeSlots: updatedTimeSlots });

  return appointment;
}

export function getAppointmentById(id: string): Appointment | null {
  const db = getDatabase();
  return db.get(`${APPOINTMENTS_PREFIX}${id}`) || null;
}

export function getAllAppointments(): Appointment[] {
  const db = getDatabase();
  const appointmentIds = db.get(APPOINTMENT_INDEX_KEY) || [];
  
  return appointmentIds
    .map((id: string) => db.get(`${APPOINTMENTS_PREFIX}${id}`))
    .filter((appointment: Appointment | undefined) => appointment !== undefined)
    .sort((a: Appointment, b: Appointment) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export function getAppointmentsByStatus(status: Appointment['status']): Appointment[] {
  return getAllAppointments().filter(apt => apt.status === status);
}

export function getAppointmentsByDate(date: string): Appointment[] {
  return getAllAppointments().filter(apt => apt.appointmentDate === date);
}

export function updateAppointment(id: string, updates: Partial<Appointment>): Appointment | null {
  const db = getDatabase();
  const appointment = db.get(`${APPOINTMENTS_PREFIX}${id}`);
  
  if (!appointment) {
    return null;
  }

  const updatedAppointment = {
    ...appointment,
    ...updates,
    id,
  };

  db.put(`${APPOINTMENTS_PREFIX}${id}`, updatedAppointment);
  return updatedAppointment;
}

export async function deleteAppointment(id: string): Promise<boolean> {
  const db = getDatabase();
  const appointment = getAppointmentById(id);
  
  if (appointment) {
    // Free up the time slot
    const schedule = getScheduleByDate(appointment.appointmentDate);
    if (schedule) {
      const updatedTimeSlots = schedule.timeSlots.map(slot =>
        slot.time === appointment.appointmentTime ? { ...slot, isAvailable: true } : slot
      );
      updateSchedule(schedule.id, { timeSlots: updatedTimeSlots });
    }
  }
  
  // Remove from index
  const appointmentIds = db.get(APPOINTMENT_INDEX_KEY) || [];
  const filteredIds = appointmentIds.filter((aid: string) => aid !== id);
  db.put(APPOINTMENT_INDEX_KEY, filteredIds);
  
  // Delete appointment
  return await db.remove(`${APPOINTMENTS_PREFIX}${id}`);
}

// Helper function to generate time slots for a day (10-minute intervals)
export function generateTimeSlots(startHour: number, endHour: number): TimeSlot[] {
  const slots: TimeSlot[] = [];
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 10) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push({ time, isAvailable: true });
    }
  }
  
  return slots;
}
