import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MassageApi } from '../../core/massage-api';
import { Appointment } from '../../core/models';
import { WorkspaceStore } from '../../core/workspace.store';
import { BookingPage } from './booking.page';

const date = '2026-10-20';
/** The API returns DateTimeOffset strings, not toISOString()'s `...000Z` form. */
const apiTime = (time: string) => new Date(`${date}T${time}:00`).toISOString().replace('.000Z', '+00:00');

const appointment: Appointment = {
  id: 'appt',
  branchId: 'branch',
  serviceId: 'service',
  staffId: 'staff-a',
  customerId: 'customer',
  roomId: 'room',
  startsAt: apiTime('10:15'),
  endsAt: apiTime('11:15'),
  status: 'Scheduled',
  paidSaleId: null,
  notes: null,
};

describe('BookingPage', () => {
  let api: Record<string, ReturnType<typeof vi.fn>>;
  let page: any;
  let destroy: () => void;

  beforeEach(async () => {
    api = {
      appointments: vi.fn().mockResolvedValue([appointment]),
      updateAppointment: vi.fn().mockResolvedValue(appointment),
    };
    TestBed.configureTestingModule({
      imports: [BookingPage],
      providers: [provideRouter([]), { provide: MassageApi, useValue: api }],
    });
    const store = TestBed.inject(WorkspaceStore);
    store.selectedDate = date;
    store.selectedBranchId = 'branch';
    store.staff = ['staff-a', 'staff-b'].map((id) => ({ id, branchId: 'branch', name: id, email: null, isActive: true }));
    store.services = [{ id: 'service', name: 'นวดไทย', durationMinutes: 60, price: 500, isActive: true }];
    const fixture = TestBed.createComponent(BookingPage);
    page = fixture.componentInstance;
    destroy = () => fixture.destroy();
    page.ngOnInit();
    await fixture.whenStable();
    api['appointments'].mockClear();
  });

  afterEach(() => destroy());

  /** A 26-slot row 260px wide, so one slot is 10px. */
  function row(): HTMLElement {
    const element = document.createElement('div');
    element.getBoundingClientRect = () => ({ left: 0, width: 260 }) as DOMRect;
    let captured = false;
    element.setPointerCapture = () => { captured = true; };
    element.hasPointerCapture = () => captured;
    element.releasePointerCapture = () => { captured = false; };
    return element;
  }

  function drag(startX: number, dropX: number, resourceId: string): Promise<void> {
    page.startBookingDrag({ clientX: startX, dataTransfer: { setData: () => {} }, preventDefault: () => {} }, appointment);
    return page.dropBooking({ clientX: dropX, currentTarget: row(), dataTransfer: null, preventDefault: () => {} }, resourceId);
  }

  it('does not update an appointment dropped back where it was', async () => {
    await drag(70, 72, 'staff-a');
    expect(api['updateAppointment']).not.toHaveBeenCalled();
  });

  it('moves a dropped appointment by the distance dragged, keeping its minutes', async () => {
    await drag(70, 90, 'staff-a');
    expect(api['updateAppointment']).toHaveBeenCalledWith('appt', expect.objectContaining({
      staffId: 'staff-a',
      startsAt: new Date(`${date}T11:15:00`).toISOString(),
    }));
  });

  it('moves an appointment to another therapist at the same time', async () => {
    await drag(70, 70, 'staff-b');
    expect(api['updateAppointment']).toHaveBeenCalledWith('appt', expect.objectContaining({
      staffId: 'staff-b',
      startsAt: new Date(`${date}T10:15:00`).toISOString(),
    }));
  });

  it('ends a leftward range selection at the slot where the drag began', () => {
    const element = row();
    const event = (clientX: number) => ({ button: 0, pointerId: 1, clientX, currentTarget: element });
    page.startRangeSelection(event(105), 'staff-a'); // 14:00
    page.updateRangeSelection(event(45), 'staff-a'); // 11:00
    expect(page.selectionLabel).toBe('12:30–14:30');
  });

  it('keeps an off-slot start time selectable when editing', () => {
    page.editBooking(appointment);
    expect(page.bookingTimeOptions).toContain('10:15');
    expect(page.bookingTimeOptions).not.toContain('22:00');
  });

  it('reloads the shared appointments when the date changes', async () => {
    await page.setBookingDate('2026-10-21');
    expect(api['appointments']).toHaveBeenCalledTimes(2);
  });

  it('groups the selected date by therapist, earliest first', () => {
    const later = { ...appointment, id: 'later', startsAt: apiTime('15:00'), endsAt: apiTime('16:00') };
    page.bookingAppointments = [later, appointment];
    expect(page.bookingAppointmentsForResource('staff-a').map((item: Appointment) => item.id)).toEqual(['appt', 'later']);
    expect(page.bookingAppointmentsForResource('staff-b')).toEqual([]);
  });
});
