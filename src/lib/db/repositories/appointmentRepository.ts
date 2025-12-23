import { getDatabase, generateId } from '../lmdb';

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Appointment {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  notes?: string;
  locale?: string;
  status: AppointmentStatus;
  createdAt: string;
}

const APPOINTMENT_PREFIX = 'appointments:'; // appointments:{id}

export async function createAppointment(input: Omit<Appointment, 'id' | 'createdAt' | 'status'>): Promise<Appointment> {
  const db = getDatabase();
  const appointment: Appointment = {
    ...input,
    id: generateId(),
    createdAt: new Date().toISOString(),
    status: 'pending',
  };

  await db.put(`${APPOINTMENT_PREFIX}${appointment.id}`, appointment);
  return appointment;
}

export async function getAppointmentById(id: string): Promise<Appointment | null> {
  const db = getDatabase();
  const value = (await db.get(`${APPOINTMENT_PREFIX}${id}`)) as Appointment | undefined;
  return value || null;
}
