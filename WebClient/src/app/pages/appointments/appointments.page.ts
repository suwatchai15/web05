import { ChangeDetectionStrategy, Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { AppointmentForm, appointmentFormFrom, appointmentRequest, defaultAppointmentForm } from '../../core/appointment-form';
import { statusLabel, timeLabel } from '../../core/format';
import { MassageApi } from '../../core/massage-api';
import { Appointment, Room, StaffMember } from '../../core/models';
import { WorkspaceStore } from '../../core/workspace.store';

@Component({
  // Pages keep async results in their own fields; Eager lets the shell's markForCheck (via store.run) refresh them.
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, NgSelectModule],
  selector: 'app-appointments-page',
  styles: ':host { display: contents; }',
  styleUrl: '../../workspace.scss',
  templateUrl: './appointments.page.html',
})
export class AppointmentsPage implements OnInit {
  protected readonly timeLabel = timeLabel;
  protected readonly statusLabel = statusLabel;
  protected editingAppointmentId = '';
  protected appointmentForm: AppointmentForm;

  constructor(
    protected readonly store: WorkspaceStore,
    private readonly api: MassageApi,
    private readonly destroyRef: DestroyRef,
  ) {
    this.appointmentForm = defaultAppointmentForm(store);
  }

  ngOnInit(): void {
    void this.store.loadAppointments();
    this.store.branchChanged.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.editingAppointmentId = '';
      this.appointmentForm = defaultAppointmentForm(this.store);
    });
  }

  protected get activeStaff(): StaffMember[] {
    return this.store.activeStaffIn(this.appointmentForm.branchId);
  }

  protected get activeRooms(): Room[] {
    return this.store.activeRoomsIn(this.appointmentForm.branchId);
  }

  protected loadAppointments(): Promise<void> {
    return this.store.loadAppointments();
  }

  protected async createAppointment(): Promise<void> {
    await this.store.run(async () => {
      const request = appointmentRequest(this.appointmentForm);
      if (this.editingAppointmentId) await this.api.updateAppointment(this.editingAppointmentId, request);
      else await this.api.createAppointment(request);
      const { date, time } = this.appointmentForm;
      this.editingAppointmentId = '';
      this.store.selectedDate = date;
      this.appointmentForm = { ...defaultAppointmentForm(this.store), time };
      await this.store.reloadAppointments();
    });
  }

  protected editAppointment(appointment: Appointment): void {
    this.editingAppointmentId = appointment.id;
    this.appointmentForm = appointmentFormFrom(appointment);
    this.store.selectedDate = this.appointmentForm.date;
    void this.store.loadAppointments();
  }

  protected cancelAppointmentEdit(): void {
    this.editingAppointmentId = '';
    this.appointmentForm.notes = '';
  }

  protected async updateAppointmentStatus(appointment: Appointment, status: 'InProgress' | 'Completed' | 'Cancelled'): Promise<void> {
    await this.store.run(async () => {
      await this.api.setAppointmentStatus(appointment.id, status);
      await this.store.reloadAppointments();
    });
  }
}
