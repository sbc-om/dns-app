import { NextRequest, NextResponse } from 'next/server';
import { createAppointment } from '@/lib/db/repositories/appointmentRepository';
import { getAvailableTimeSlots, isTimeSlotAvailable, bookTimeSlot } from '@/lib/db/repositories/scheduleRepository';

/**
 * POST /api/appointments/public
 * Public endpoint: book an appointment for an available schedule slot.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const fullName = typeof body?.fullName === 'string' ? body.fullName.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const phoneNumber = typeof body?.phoneNumber === 'string' ? body.phoneNumber.trim() : '';
    const date = typeof body?.date === 'string' ? body.date.trim() : '';
    const time = typeof body?.time === 'string' ? body.time.trim() : '';
    const notes = typeof body?.notes === 'string' ? body.notes.trim() : undefined;
    const locale = typeof body?.locale === 'string' ? body.locale.trim() : undefined;

    if (!fullName || !email || !phoneNumber || !date || !time) {
      return NextResponse.json({ success: false, error: 'Validation error' }, { status: 400 });
    }

    // Ensure the requested time exists in the generated schedule slots for that date
    const allSlots = await getAvailableTimeSlots(date);
    const slotExists = allSlots.some((s) => s.time === time);
    if (!slotExists) {
      return NextResponse.json({ success: false, error: 'Time slot not available' }, { status: 409 });
    }

    const available = await isTimeSlotAvailable(date, time);
    if (!available) {
      return NextResponse.json({ success: false, error: 'Time slot already booked' }, { status: 409 });
    }

    const appointment = await createAppointment({
      fullName,
      email,
      phoneNumber,
      date,
      time,
      notes,
      locale,
    });

    await bookTimeSlot(date, time, appointment.id);

    return NextResponse.json({ success: true, appointmentId: appointment.id });
  } catch (error) {
    console.error('Error booking public appointment:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
