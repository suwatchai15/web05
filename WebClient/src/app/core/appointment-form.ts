import { Appointment } from './models';
import { localDateValue } from './format';
import { WorkspaceStore } from './workspace.store';

export interface AppointmentForm {
  branchId: string;
  serviceId: string;
  staffId: string;
  customerId: string;
  roomId: string;
  date: string;
  time: string;
  notes: string;
}

/** A new-appointment form for the working branch, preselecting the first active option of each list. */
export function defaultAppointmentForm(store: WorkspaceStore): AppointmentForm {
  const branchId = store.selectedBranchId;
  return {
    branchId,
    serviceId: store.services.find((service) => service.isActive)?.id ?? '',
    staffId: store.activeStaffIn(branchId)[0]?.id ?? '',
    customerId: store.customers[0]?.id ?? '',
    roomId: store.activeRoomsIn(branchId)[0]?.id ?? '',
    date: store.selectedDate,
    time: '10:00',
    notes: '',
  };
}

export function appointmentFormFrom(appointment: Appointment): AppointmentForm {
  return {
    branchId: appointment.branchId,
    serviceId: appointment.serviceId,
    staffId: appointment.staffId,
    customerId: appointment.customerId,
    roomId: appointment.roomId,
    date: localDateValue(new Date(appointment.startsAt)),
    time: new Date(appointment.startsAt).toTimeString().slice(0, 5),
    notes: appointment.notes ?? '',
  };
}

export function appointmentRequest(form: AppointmentForm) {
  return {
    branchId: form.branchId,
    serviceId: form.serviceId,
    staffId: form.staffId,
    customerId: form.customerId,
    roomId: form.roomId,
    startsAt: new Date(`${form.date}T${form.time}:00`).toISOString(),
    notes: form.notes ?? '',
  };
}
