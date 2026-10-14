import { ChangeDetectionStrategy, Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { dayRange, localDateValue, timeLabel } from '../../core/format';
import { MassageApi } from '../../core/massage-api';
import { Appointment, Room } from '../../core/models';
import { WorkspaceStore } from '../../core/workspace.store';
import { RoomFormDialog } from '../../shared/room-form-dialog';

type RoomBoardFilter = 'all' | 'available' | 'busy' | 'booked' | 'disabled';
type RoomStatus = Exclude<RoomBoardFilter, 'all'>;

@Component({
  // Pages keep async results in their own fields; Eager lets the shell's markForCheck (via store.run) refresh them.
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, RoomFormDialog],
  selector: 'app-rooms-page',
  styles: ':host { display: contents; }',
  styleUrl: '../../workspace.scss',
  templateUrl: './rooms.page.html',
})
export class RoomsPage implements OnInit {
  protected readonly roomBoardFilters: RoomBoardFilter[] = ['all', 'available', 'busy', 'booked', 'disabled'];
  protected roomSearch = '';
  protected roomBoardFilter: RoomBoardFilter = 'all';
  protected roomFormDialogOpen = false;
  protected editingRoom: Room | null = null;
  private roomAppointments: Appointment[] = [];

  constructor(
    protected readonly store: WorkspaceStore,
    private readonly api: MassageApi,
    private readonly destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    void this.loadRoomBoardAppointments();
    this.store.branchChanged.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => void this.loadRoomBoardAppointments());
  }

  protected get roomsInSelectedBranch(): Room[] {
    return this.store.rooms.filter((room) => room.branchId === this.store.selectedBranchId);
  }

  protected get filteredRooms(): Room[] {
    const query = this.roomSearch.trim().toLocaleLowerCase();
    return this.roomsInSelectedBranch.filter((room) => {
      const matchesFilter = this.roomBoardFilter === 'all' || this.roomStatus(room) === this.roomBoardFilter;
      const matchesSearch = !query || room.name.toLocaleLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  }

  protected get roomStatusCounts(): Record<RoomBoardFilter, number> {
    const branchRooms = this.roomsInSelectedBranch;
    const counts: Record<RoomBoardFilter, number> = { all: branchRooms.length, available: 0, busy: 0, booked: 0, disabled: 0 };
    for (const room of branchRooms) counts[this.roomStatus(room)] += 1;
    return counts;
  }

  protected roomStatus(room: Room): RoomStatus {
    if (!room.isActive) return 'disabled';
    const now = Date.now();
    const appointments = this.openAppointmentsFor(room);
    if (appointments.some((appointment) => new Date(appointment.startsAt).getTime() <= now && new Date(appointment.endsAt).getTime() > now)) {
      return 'busy';
    }
    if (appointments.some((appointment) => new Date(appointment.startsAt).getTime() > now)) return 'booked';
    return 'available';
  }

  protected roomStatusLabel(room: Room): string {
    const labels: Record<RoomStatus, string> = {
      available: 'ว่าง',
      busy: 'กำลังให้บริการ',
      booked: 'จองแล้ว',
      disabled: 'ปิดใช้งาน',
    };
    return labels[this.roomStatus(room)];
  }

  protected roomFilterLabel(filter: RoomBoardFilter): string {
    const labels: Record<RoomBoardFilter, string> = {
      all: 'Room Board',
      available: 'ห้องว่าง',
      busy: 'กำลังให้บริการ',
      booked: 'จองแล้ว',
      disabled: 'ปิดใช้งาน',
    };
    return labels[filter];
  }

  protected roomCurrentAppointment(room: Room): Appointment | undefined {
    const now = Date.now();
    return this.openAppointmentsFor(room).find((appointment) => new Date(appointment.endsAt).getTime() > now);
  }

  protected roomTimeRemaining(appointment: Appointment): string {
    const now = Date.now();
    const startsAt = new Date(appointment.startsAt).getTime();
    if (startsAt > now) return `${timeLabel(appointment.startsAt)} น.`;
    const minutes = Math.max(0, Math.ceil((new Date(appointment.endsAt).getTime() - now) / 60_000));
    if (minutes < 1) return 'ใกล้เสร็จ';
    return `เหลือ ${minutes} นาที`;
  }

  protected async loadRoomBoardAppointments(): Promise<void> {
    const { from, to } = dayRange(localDateValue(new Date()));
    await this.store.run(async () => {
      this.roomAppointments = await this.api.appointments(from, to, this.store.selectedBranchId);
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

  protected async roomSaved(): Promise<void> {
    this.closeRoomForm();
    await this.loadRoomBoardAppointments();
  }

  /** Scheduled or in-progress appointments in the room today, earliest first. */
  private openAppointmentsFor(room: Room): Appointment[] {
    return this.roomAppointments
      .filter((appointment) => appointment.roomId === room.id && (appointment.status === 'Scheduled' || appointment.status === 'InProgress'))
      .sort((first, second) => new Date(first.startsAt).getTime() - new Date(second.startsAt).getTime());
  }
}
