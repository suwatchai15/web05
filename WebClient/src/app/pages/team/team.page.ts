import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { localDateValue } from '../../core/format';
import { ICON_PATHS } from '../../core/icons';
import { MassageApi } from '../../core/massage-api';
import { Room, StaffMember, StaffScheduleDay, StaffScheduleException, WorkShift } from '../../core/models';
import { WorkspaceStore } from '../../core/workspace.store';
import { RoomFormDialog } from '../../shared/room-form-dialog';

@Component({
  // Pages keep async results in their own fields; Eager lets the shell's markForCheck (via store.run) refresh them.
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [DatePipe, FormsModule, NgSelectModule, RoomFormDialog],
  selector: 'app-team-page',
  styles: ':host { display: contents; }',
  styleUrl: '../../workspace.scss',
  templateUrl: './team.page.html',
})
export class TeamPage implements OnInit {
  protected readonly iconPaths = ICON_PATHS;
  protected teamTab: 'staff' | 'rooms' | 'schedule' = 'staff';
  protected staffSearch = '';
  protected staffForm = { branchId: '', name: '', email: '' };
  protected editingStaffId = '';
  protected staffFormDialogOpen = false;
  protected staffDeleteTarget: StaffMember | null = null;
  protected roomFormDialogOpen = false;
  protected editingRoom: Room | null = null;
  protected roomDeleteTarget: Room | null = null;
  protected scheduleStaffId = '';
  protected scheduleDays: StaffScheduleDay[] = emptyWeek();
  protected scheduleExceptions: StaffScheduleException[] = [];
  protected exceptionForm = { date: localDateValue(new Date()), isDayOff: true, startTime: '09:00', endTime: '18:00' };

  constructor(
    protected readonly store: WorkspaceStore,
    private readonly api: MassageApi,
    private readonly destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.store.branchChanged.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.clearSchedule());
  }

  protected get staffInSelectedBranch(): StaffMember[] {
    return this.store.staff.filter((member) => member.branchId === this.store.selectedBranchId);
  }

  protected get roomsInSelectedBranch(): Room[] {
    return this.store.rooms.filter((room) => room.branchId === this.store.selectedBranchId);
  }

  protected get selectedBranchActiveStaffCount(): number {
    return this.staffInSelectedBranch.filter((member) => member.isActive).length;
  }

  protected get filteredStaff(): StaffMember[] {
    const query = this.staffSearch.trim().toLocaleLowerCase();
    return this.staffInSelectedBranch.filter((member) =>
      !query || `${member.name} ${member.email ?? ''}`.toLocaleLowerCase().includes(query),
    );
  }

  protected get selectedScheduleStaff(): StaffMember | undefined {
    return this.staffInSelectedBranch.find((member) => member.id === this.scheduleStaffId);
  }

  protected openStaffCreate(): void {
    this.editingStaffId = '';
    this.staffForm = { branchId: this.store.selectedBranchId, name: '', email: '' };
    this.staffFormDialogOpen = true;
  }

  protected editStaff(member: StaffMember): void {
    this.editingStaffId = member.id;
    this.staffForm = { branchId: member.branchId, name: member.name, email: member.email ?? '' };
    this.staffFormDialogOpen = true;
  }

  protected closeStaffForm(): void {
    this.staffFormDialogOpen = false;
    this.editingStaffId = '';
    this.staffForm = { branchId: '', name: '', email: '' };
  }

  protected async createStaff(): Promise<void> {
    await this.store.run(async () => {
      if (this.editingStaffId) await this.api.updateStaff(this.editingStaffId, this.staffForm);
      else await this.api.createStaff(this.staffForm);
      this.closeStaffForm();
      await this.store.loadWorkspace();
    });
  }

  protected cancelStaffDelete(): void {
    this.staffDeleteTarget = null;
  }

  protected async confirmDeactivateStaff(): Promise<void> {
    const member = this.staffDeleteTarget;
    if (!member) return;
    await this.store.run(async () => {
      await this.api.deactivateStaff(member.id);
      if (this.scheduleStaffId === member.id) this.clearSchedule();
      this.staffDeleteTarget = null;
      await this.store.loadWorkspace();
    });
  }

  protected async reactivateStaff(member: StaffMember): Promise<void> {
    await this.store.run(async () => {
      await this.api.setStaffActive(member.id, true);
      await this.store.loadWorkspace();
    });
  }

  protected openRoomCreate(): void {
    this.editingRoom = null;
    this.roomFormDialogOpen = true;
  }

  protected editRoom(room: Room): void {
    this.editingRoom = room;
    this.roomFormDialogOpen = true;
  }

  protected closeRoomForm(): void {
    this.roomFormDialogOpen = false;
    this.editingRoom = null;
  }

  protected cancelRoomDelete(): void {
    this.roomDeleteTarget = null;
  }

  protected async confirmDeactivateRoom(): Promise<void> {
    const room = this.roomDeleteTarget;
    if (!room) return;
    await this.store.run(async () => {
      await this.api.deactivateRoom(room.id);
      this.roomDeleteTarget = null;
      await this.store.loadWorkspace();
    });
  }

  protected async selectScheduleStaff(staffId: string): Promise<void> {
    if (!staffId) {
      this.clearSchedule();
      return;
    }
    this.scheduleStaffId = staffId;
    await this.store.run(async () => {
      const [schedule, exceptions] = await Promise.all([
        this.api.staffSchedule(staffId),
        this.api.staffScheduleExceptions(staffId),
      ]);
      this.scheduleDays = weekFrom(schedule.days);
      this.scheduleExceptions = exceptions;
    });
  }

  protected async saveSchedule(): Promise<void> {
    if (!this.scheduleStaffId) return;
    await this.store.run(async () => {
      const schedule = await this.api.saveStaffSchedule(this.scheduleStaffId, { days: this.scheduleDays });
      this.scheduleDays = weekFrom(schedule.days);
    });
  }

  protected addShift(day: StaffScheduleDay): void {
    day.shifts.push({ startTime: '09:00', endTime: '18:00' });
  }

  protected removeShift(day: StaffScheduleDay, index: number): void {
    day.shifts.splice(index, 1);
  }

  protected async createScheduleException(): Promise<void> {
    if (!this.scheduleStaffId) return;
    await this.store.run(async () => {
      const shifts: WorkShift[] = this.exceptionForm.isDayOff
        ? []
        : [{ startTime: this.exceptionForm.startTime, endTime: this.exceptionForm.endTime }];
      await this.api.createStaffScheduleException(this.scheduleStaffId, {
        date: this.exceptionForm.date,
        isDayOff: this.exceptionForm.isDayOff,
        shifts,
      });
      this.scheduleExceptions = await this.api.staffScheduleExceptions(this.scheduleStaffId);
    });
  }

  protected async deleteScheduleException(exception: StaffScheduleException): Promise<void> {
    await this.store.run(async () => {
      await this.api.deleteStaffScheduleException(this.scheduleStaffId, exception.id);
      this.scheduleExceptions = await this.api.staffScheduleExceptions(this.scheduleStaffId);
    });
  }

  protected dayName(dayOfWeek: number): string {
    return ['', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์'][dayOfWeek] ?? '';
  }

  protected exceptionLabel(exception: StaffScheduleException): string {
    return exception.isDayOff
      ? 'หยุดทั้งวัน'
      : exception.shifts.map((shift) => `${shift.startTime}–${shift.endTime}`).join(', ');
  }

  private clearSchedule(): void {
    this.scheduleStaffId = '';
    this.scheduleDays = emptyWeek();
    this.scheduleExceptions = [];
  }
}

/** Monday (1) to Sunday (7), each with no shifts. */
function emptyWeek(): StaffScheduleDay[] {
  return Array.from({ length: 7 }, (_, index) => ({ dayOfWeek: index + 1, shifts: [] }));
}

function weekFrom(days: StaffScheduleDay[]): StaffScheduleDay[] {
  const savedDays = new Map(days.map((day) => [day.dayOfWeek, day.shifts]));
  return emptyWeek().map((day) => ({ ...day, shifts: savedDays.get(day.dayOfWeek) ?? [] }));
}
