import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { dateLabel, statusLabel, timeLabel } from '../../core/format';
import { ICON_PATHS } from '../../core/icons';
import { MassageApi } from '../../core/massage-api';
import { Appointment, Room } from '../../core/models';
import { WorkspaceStore } from '../../core/workspace.store';

@Component({
  // Pages keep async results in their own fields; Eager lets the shell's markForCheck (via store.run) refresh them.
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [DecimalPipe, FormsModule, NgSelectModule],
  selector: 'app-dashboard-page',
  styles: ':host { display: contents; }',
  styleUrl: '../../workspace.scss',
  templateUrl: './dashboard.page.html',
})
export class DashboardPage implements OnInit {
  protected readonly iconPaths = ICON_PATHS;
  protected readonly timeLabel = timeLabel;
  protected readonly statusLabel = statusLabel;
  protected demoSeedMessage = '';

  constructor(
    protected readonly store: WorkspaceStore,
    private readonly api: MassageApi,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    void this.store.loadAppointmentsOnEnter();
  }

  protected get selectedDateLabel(): string {
    return dateLabel(this.store.selectedDate);
  }

  protected get upcomingAppointments(): Appointment[] {
    return [...this.store.selectedAppointments].sort(
      (first, second) => new Date(first.startsAt).getTime() - new Date(second.startsAt).getTime(),
    );
  }

  protected get activeRoomsList(): Room[] {
    return this.store.rooms.filter((room) => room.isActive && this.store.matchesDashboardBranch(room.branchId));
  }

  protected get completedRevenue(): number {
    return this.store.selectedAppointments
      .filter((appointment) => appointment.status === 'Completed')
      .reduce((total, appointment) => total + (this.store.services.find((service) => service.id === appointment.serviceId)?.price ?? 0), 0);
  }

  protected get customerCountToday(): number {
    return new Set(this.store.selectedAppointments.map((appointment) => appointment.customerId)).size;
  }

  protected get activeRoomCount(): number {
    return this.activeRoomsList.length;
  }

  protected get activeServiceCount(): number {
    return this.store.services.filter((service) => service.isActive).length;
  }

  protected get activeStaffCount(): number {
    return this.store.staff.filter((member) => member.isActive && this.store.matchesDashboardBranch(member.branchId)).length;
  }

  protected get pendingAppointments(): number {
    return this.countByStatus('Scheduled');
  }

  protected get completedAppointmentCount(): number {
    return this.countByStatus('Completed');
  }

  protected get cancelledAppointmentCount(): number {
    return this.countByStatus('Cancelled');
  }

  protected loadAppointments(): Promise<void> {
    return this.store.loadAppointments();
  }

  protected dashboardBranchChanged(): Promise<void> {
    return this.store.loadAppointments();
  }

  protected selectSection(section: 'appointments'): void {
    void this.router.navigateByUrl(`/${section}`);
  }

  protected async seedDemoData(): Promise<void> {
    await this.store.run(async () => {
      const result = await this.api.seedDemoData();
      this.demoSeedMessage = result.created
        ? `${result.message} (${result.branches} สาขา · ${result.services} บริการ · ${result.staff} หมอนวด · ${result.rooms} ห้อง · ${result.customers} ลูกค้า · ${result.appointments} นัดหมาย · ${result.sales} รายการขาย)`
        : result.message;
      await this.store.loadWorkspace();
    });
  }

  private countByStatus(status: Appointment['status']): number {
    return this.store.selectedAppointments.filter((appointment) => appointment.status === status).length;
  }
}
