import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { AppointmentForm, appointmentFormFrom, appointmentRequest, defaultAppointmentForm } from '../../core/appointment-form';
import { dateLabel, dayRange, localDateValue, statusLabel, timeLabel } from '../../core/format';
import { MassageApi } from '../../core/massage-api';
import { Appointment, Room, StaffMember } from '../../core/models';
import { PosSession } from '../../core/pos-session';
import { WorkspaceStore } from '../../core/workspace.store';

/** Timeline shows 09:00–22:00 in 30-minute slots. */
const openingMinutes = 9 * 60;
const closingMinutes = 22 * 60;
const slotMinutes = 30;
const slotCount = (closingMinutes - openingMinutes) / slotMinutes;
/** A drag on an empty row selects 60–120 minutes, as in the prototype. */
const minSelectionSlots = 2;
const maxSelectionSlots = 4;

type EventTone = 'reserved' | 'waiting' | 'started' | 'done' | 'cancelled';
type RangeSelection = { resourceId: string; anchor: number; start: number; duration: number };

@Component({
  // Pages keep async results in their own fields; Eager lets the shell's markForCheck (via store.run) refresh them.
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, NgSelectModule],
  selector: 'app-booking-page',
  styles: ':host { display: contents; }',
  styleUrls: ['../../workspace.scss', './booking.page.scss'],
  templateUrl: './booking.page.html',
})
export class BookingPage implements OnInit {
  protected readonly timeLabel = timeLabel;
  /** Labels on every half-hour boundary, 09:00 through 22:00. */
  protected readonly bookingTimeSlots = Array.from({ length: slotCount + 1 }, (_, index) => minutesLabel(openingMinutes + index * slotMinutes));
  protected readonly gridSlots = Array.from({ length: slotCount }, (_, index) => index);
  protected bookingAppointments: Appointment[] = [];
  protected bookingLoading = false;
  protected bookingDialogOpen = false;
  protected bookingDraggedAppointmentId = '';
  protected bookingDragOverResourceId = '';
  protected bookingDropZoneActive = false;
  protected dragSelection: RangeSelection | null = null;
  protected editingAppointmentId = '';
  protected appointmentForm: AppointmentForm;
  private now = Date.now();

  constructor(
    protected readonly store: WorkspaceStore,
    private readonly api: MassageApi,
    private readonly pos: PosSession,
    private readonly router: Router,
    private readonly changeDetector: ChangeDetectorRef,
    private readonly destroyRef: DestroyRef,
  ) {
    this.appointmentForm = defaultAppointmentForm(store);
  }

  ngOnInit(): void {
    void this.loadBookingAppointments();
    this.store.branchChanged.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.appointmentForm = defaultAppointmentForm(this.store);
      void this.loadBookingAppointments();
    });
    // Keeps the now-line and "due" colouring current while the page stays open.
    const clock = setInterval(() => {
      this.now = Date.now();
      this.changeDetector.markForCheck();
    }, 30_000);
    this.destroyRef.onDestroy(() => clearInterval(clock));
  }

  protected get bookingAgendaDateLabel(): string {
    return dateLabel(this.store.selectedDate);
  }

  protected get bookingWeekdayLabel(): string {
    return new Intl.DateTimeFormat('th-TH', { weekday: 'long' }).format(new Date(`${this.store.selectedDate}T12:00:00`));
  }

  protected get activeStaff(): StaffMember[] {
    return this.store.activeStaffIn(this.appointmentForm.branchId);
  }

  protected get activeRooms(): Room[] {
    return this.store.activeRoomsIn(this.appointmentForm.branchId);
  }

  protected get bookingResourceRows(): { id: string; name: string; detail: string }[] {
    return this.store.activeStaffIn(this.store.selectedBranchId).map((member) => ({
      id: member.id,
      name: member.name,
      detail: this.store.branchName(member.branchId),
    }));
  }

  protected get selectedBookingAppointments(): Appointment[] {
    const dateValue = this.store.selectedDate;
    return this.bookingAppointments
      .filter((appointment) => localDateValue(new Date(appointment.startsAt)) === dateValue)
      .sort((first, second) => new Date(first.startsAt).getTime() - new Date(second.startsAt).getTime());
  }

  protected get statusCounts(): Record<EventTone, number> {
    const counts: Record<EventTone, number> = { reserved: 0, waiting: 0, started: 0, done: 0, cancelled: 0 };
    for (const appointment of this.selectedBookingAppointments) counts[this.eventTone(appointment)] += 1;
    return counts;
  }

  /** Position of the current time, only when viewing today within opening hours. */
  protected get nowLine(): { left: number; label: string } | null {
    const now = new Date(this.now);
    if (localDateValue(now) !== this.store.selectedDate) return null;
    const minutes = now.getHours() * 60 + now.getMinutes();
    if (minutes < openingMinutes || minutes > closingMinutes) return null;
    return { left: this.minutesPercent(minutes - openingMinutes), label: minutesLabel(minutes) };
  }

  protected get selectionLabel(): string {
    if (!this.dragSelection) return '';
    const start = openingMinutes + this.dragSelection.start * slotMinutes;
    return `${minutesLabel(start)}–${minutesLabel(start + this.dragSelection.duration * slotMinutes)}`;
  }

  protected slotPercent(slots: number): number {
    return (slots / slotCount) * 100;
  }

  protected eventLeft(appointment: Appointment): number {
    return this.minutesPercent(this.visibleRange(appointment).start - openingMinutes);
  }

  protected eventWidth(appointment: Appointment): number {
    const { start, end } = this.visibleRange(appointment);
    return this.minutesPercent(Math.max(end - start, slotMinutes / 2));
  }

  /** Scheduled appointments whose start time has passed are shown as due ("ถึงเวลาเริ่ม"). */
  protected eventTone(appointment: Appointment): EventTone {
    if (appointment.status === 'InProgress') return 'started';
    if (appointment.status === 'Completed') return 'done';
    if (appointment.status === 'Cancelled') return 'cancelled';
    return new Date(appointment.startsAt).getTime() <= this.now ? 'waiting' : 'reserved';
  }

  protected eventStatusLabel(appointment: Appointment): string {
    return this.eventTone(appointment) === 'done' ? 'เสร็จแล้ว' : statusLabel(appointment.status);
  }

  protected async setBookingDate(value: string): Promise<void> {
    if (!value) return;
    this.store.selectedDate = value;
    this.appointmentForm.date = value;
    await this.loadBookingAppointments();
  }

  protected openDatePicker(event: MouseEvent): void {
    try {
      (event.target as HTMLInputElement).showPicker();
    } catch {
      // Older browsers fall back to the input's own picker behaviour.
    }
  }

  protected goToBookingToday(): void {
    void this.setBookingDate(localDateValue(new Date()));
  }

  protected async moveBookingDay(offset: number): Promise<void> {
    const date = new Date(`${this.store.selectedDate}T12:00:00`);
    date.setDate(date.getDate() + offset);
    await this.setBookingDate(localDateValue(date));
  }

  protected newBooking(): void {
    this.editingAppointmentId = '';
    this.appointmentForm = defaultAppointmentForm(this.store);
    this.bookingDialogOpen = true;
  }

  protected editBooking(appointment: Appointment): void {
    this.editingAppointmentId = appointment.id;
    this.appointmentForm = appointmentFormFrom(appointment);
    this.bookingDialogOpen = true;
  }

  protected closeBookingDialog(): void {
    this.bookingDialogOpen = false;
    this.editingAppointmentId = '';
  }

  protected async createAppointment(): Promise<void> {
    await this.store.run(async () => {
      const request = appointmentRequest(this.appointmentForm);
      if (this.editingAppointmentId) await this.api.updateAppointment(this.editingAppointmentId, request);
      else await this.api.createAppointment(request);
      this.editingAppointmentId = '';
      this.store.selectedDate = this.appointmentForm.date;
      this.appointmentForm.notes = '';
      this.bookingDialogOpen = false;
      await Promise.all([this.store.reloadAppointments(), this.reloadBookingAppointments()]);
    });
  }

  protected bookingAppointmentsForResource(resourceId: string): Appointment[] {
    return this.selectedBookingAppointments.filter((appointment) => {
      const { start, end } = this.visibleRange(appointment);
      return appointment.staffId === resourceId && end > start;
    });
  }

  protected startRangeSelection(event: PointerEvent, resourceId: string): void {
    if (event.button !== 0) return;
    const row = event.currentTarget as HTMLElement;
    row.setPointerCapture(event.pointerId);
    const slot = this.slotFromPointer(event, row);
    this.dragSelection = { resourceId, anchor: slot, start: Math.min(slotCount - minSelectionSlots, slot), duration: minSelectionSlots };
  }

  protected updateRangeSelection(event: PointerEvent, resourceId: string): void {
    const row = event.currentTarget as HTMLElement;
    if (this.dragSelection?.resourceId !== resourceId || !row.hasPointerCapture(event.pointerId)) return;
    const slot = this.slotFromPointer(event, row);
    const { anchor } = this.dragSelection;
    const duration = Math.max(minSelectionSlots, Math.min(maxSelectionSlots, Math.abs(slot - anchor) + 1));
    const start = Math.min(slotCount - duration, Math.min(anchor, slot));
    this.dragSelection = { resourceId, anchor, start, duration };
  }

  /** Opens the booking dialog for the selected therapist and time, with the service closest to the selected length. */
  protected finishRangeSelection(event: PointerEvent, resourceId: string): void {
    const selection = this.dragSelection;
    if (selection?.resourceId !== resourceId) return;
    const row = event.currentTarget as HTMLElement;
    if (row.hasPointerCapture(event.pointerId)) row.releasePointerCapture(event.pointerId);
    this.dragSelection = null;
    const minutes = selection.duration * slotMinutes;
    const service = this.store.services
      .filter((item) => item.isActive)
      .sort((first, second) => Math.abs(first.durationMinutes - minutes) - Math.abs(second.durationMinutes - minutes))[0];
    this.editingAppointmentId = '';
    this.appointmentForm = {
      ...defaultAppointmentForm(this.store),
      staffId: resourceId,
      time: minutesLabel(openingMinutes + selection.start * slotMinutes),
      serviceId: service?.id ?? '',
    };
    this.bookingDialogOpen = true;
  }

  protected startBookingDrag(event: DragEvent, appointment: Appointment): void {
    if (appointment.status !== 'Scheduled' || !event.dataTransfer) {
      event.preventDefault();
      return;
    }
    this.bookingDraggedAppointmentId = appointment.id;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', appointment.id);
  }

  protected allowBookingDrop(event: DragEvent, resourceId: string): void {
    if (!this.bookingDraggedAppointmentId || !this.bookingResourceRows.some((resource) => resource.id === resourceId)) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    this.bookingDragOverResourceId = resourceId;
  }

  protected async dropBooking(event: DragEvent, resourceId: string): Promise<void> {
    event.preventDefault();
    const appointmentId = event.dataTransfer?.getData('text/plain') || this.bookingDraggedAppointmentId;
    this.bookingDragOverResourceId = '';
    this.bookingDraggedAppointmentId = '';
    if (!appointmentId) return;
    const appointment = this.bookingAppointments.find((item) => item.id === appointmentId);
    if (!appointment || appointment.status !== 'Scheduled') return;

    const row = event.currentTarget;
    if (!(row instanceof HTMLElement)) return;
    const durationSlots = Math.ceil((new Date(appointment.endsAt).getTime() - new Date(appointment.startsAt).getTime()) / (slotMinutes * 60_000));
    const startSlot = Math.max(0, Math.min(slotCount - durationSlots, this.slotFromPointer(event, row)));
    const start = new Date(`${this.store.selectedDate}T${minutesLabel(openingMinutes + startSlot * slotMinutes)}:00`);
    const destinationStaff = this.store.activeStaffIn(this.store.selectedBranchId).find((member) => member.id === resourceId);
    if (!destinationStaff || (destinationStaff.id === appointment.staffId && start.toISOString() === appointment.startsAt)) return;

    await this.store.run(async () => {
      await this.api.updateAppointment(appointment.id, {
        branchId: appointment.branchId,
        serviceId: appointment.serviceId,
        staffId: destinationStaff.id,
        customerId: appointment.customerId,
        roomId: appointment.roomId,
        startsAt: start.toISOString(),
        notes: appointment.notes ?? '',
      });
      await Promise.all([this.reloadBookingAppointments(), this.store.reloadAppointments()]);
    });
  }

  protected endBookingDrag(): void {
    this.bookingDraggedAppointmentId = '';
    this.bookingDragOverResourceId = '';
  }

  protected allowServiceDrop(event: DragEvent): void {
    if (!this.pos.draggedServiceId) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
    this.bookingDropZoneActive = true;
  }

  protected leaveServiceDropZone(): void {
    this.bookingDropZoneActive = false;
  }

  protected dropServiceToBooking(event: DragEvent): void {
    event.preventDefault();
    const serviceId = event.dataTransfer?.getData('text/plain') || this.pos.draggedServiceId;
    this.pos.draggedServiceId = '';
    this.bookingDropZoneActive = false;
    if (!serviceId || !this.store.services.some((service) => service.id === serviceId && service.isActive)) return;
    this.editingAppointmentId = '';
    this.appointmentForm = { ...defaultAppointmentForm(this.store), serviceId };
    this.bookingDialogOpen = true;
  }

  protected async startBooking(appointment: Appointment): Promise<void> {
    if (appointment.status !== 'Scheduled' || this.store.busy) return;
    await this.store.run(async () => {
      const updated = await this.api.setAppointmentStatus(appointment.id, 'InProgress');
      this.bookingAppointments = this.bookingAppointments.map((item) => item.id === updated.id ? updated : item);
      this.store.replaceAppointment(updated);
    });
  }

  protected payBooking(appointment: Appointment): void {
    if (appointment.paidSaleId || !['InProgress', 'Completed'].includes(appointment.status)) return;
    const service = this.store.services.find((item) => item.id === appointment.serviceId && item.isActive);
    if (!service) {
      this.store.errorMessage = 'ไม่พบบริการที่เปิดใช้งานสำหรับนัดหมายนี้';
      return;
    }
    this.store.selectedDate = localDateValue(new Date(appointment.startsAt));
    this.pos.startCheckout(appointment, service);
    void this.router.navigateByUrl('/pos');
  }

  private async loadBookingAppointments(): Promise<void> {
    this.bookingLoading = true;
    await this.store.run(() => this.reloadBookingAppointments());
    this.bookingLoading = false;
  }

  private async reloadBookingAppointments(): Promise<void> {
    const { from, to } = dayRange(this.store.selectedDate);
    this.bookingAppointments = await this.api.appointments(from, to, this.store.selectedBranchId);
  }

  /** Start/end as minutes since midnight, clipped to the visible 09:00–22:00 window. */
  private visibleRange(appointment: Appointment): { start: number; end: number } {
    const start = new Date(appointment.startsAt);
    const end = new Date(appointment.endsAt);
    const clip = (minutes: number) => Math.max(openingMinutes, Math.min(closingMinutes, minutes));
    return {
      start: clip(start.getHours() * 60 + start.getMinutes()),
      end: clip(end.getHours() * 60 + end.getMinutes()),
    };
  }

  private minutesPercent(minutes: number): number {
    return (minutes / (closingMinutes - openingMinutes)) * 100;
  }

  private slotFromPointer(event: MouseEvent, row: HTMLElement): number {
    const bounds = row.getBoundingClientRect();
    return Math.max(0, Math.min(slotCount - 1, Math.floor(((event.clientX - bounds.left) / bounds.width) * slotCount)));
  }
}

function minutesLabel(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
}
