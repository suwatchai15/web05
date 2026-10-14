import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { dayRange, localDateValue } from './format';
import { MassageApi } from './massage-api';
import { Appointment, Branch, Customer, DemoDataStatus, MassageService, Room, StaffMember } from './models';

export type Section = 'overview' | 'pos' | 'booking' | 'orders' | 'rooms' | 'appointments' | 'services' | 'team' | 'customers' | 'branches' | 'users';

const branchStorageKey = 'massage.branchId';

/**
 * Session, reference data and selections shared by every page of the shop workspace.
 * Pages keep their own section-specific state and read/write shared state here.
 */
@Injectable({ providedIn: 'root' })
export class WorkspaceStore {
  isAuthenticated = false;
  /** True once branches, services, staff, rooms and customers have loaded; pages render only after this. */
  workspaceLoaded = false;
  busy = false;
  errorMessage = '';
  activeSection: Section = 'overview';
  tenantSlug = '';
  email = '';
  currentUserId = '';
  currentUserRole = '';
  selectedDate = localDateValue(new Date());
  branches: Branch[] = [];
  services: MassageService[] = [];
  staff: StaffMember[] = [];
  rooms: Room[] = [];
  customers: Customer[] = [];
  /** Appointments on `selectedDate`, for the branch filter of the active section. */
  appointments: Appointment[] = [];
  selectedBranchId = '';
  pendingBranchId = '';
  branchDialogOpen = false;
  branchSelectionRequired = false;
  dashboardBranchId = 'all';
  demoDataStatus: DemoDataStatus | null = null;
  /** Emits the new branch id whenever the working branch changes, so pages can reload branch-scoped data. */
  readonly branchChanged = new Subject<string>();
  private notifyView: () => void = () => {};

  constructor(private readonly api: MassageApi) {}

  /** The app is zoneless: the shell registers its change detector so async results get rendered. */
  connectView(notify: () => void): void {
    this.notifyView = notify;
  }

  get canManage(): boolean {
    return this.currentUserRole === 'Owner' || this.currentUserRole === 'Manager';
  }

  get currentBranchName(): string {
    return this.branches.find((branch) => branch.id === this.selectedBranchId)?.name ?? 'เลือกสาขา';
  }

  get activeBranches(): Branch[] {
    return this.branches.filter((branch) => branch.isActive);
  }

  get selectedAppointments(): Appointment[] {
    return this.appointments.filter((appointment) =>
      localDateValue(new Date(appointment.startsAt)) === this.selectedDate
      && (this.activeSection === 'overview'
        ? this.matchesDashboardBranch(appointment.branchId)
        : appointment.branchId === this.selectedBranchId),
    );
  }

  matchesDashboardBranch(branchId: string): boolean {
    return this.dashboardBranchId === 'all' || branchId === this.dashboardBranchId;
  }

  activeStaffIn(branchId: string): StaffMember[] {
    return this.staff.filter((member) => member.isActive && member.branchId === branchId);
  }

  activeRoomsIn(branchId: string): Room[] {
    return this.rooms.filter((room) => room.isActive && room.branchId === branchId);
  }

  branchName(branchId: string): string {
    return this.branches.find((branch) => branch.id === branchId)?.name ?? 'ไม่พบสาขา';
  }

  serviceName(serviceId: string): string {
    return this.services.find((service) => service.id === serviceId)?.name ?? 'ไม่พบบริการ';
  }

  staffName(staffId: string): string {
    return this.staff.find((member) => member.id === staffId)?.name ?? 'ไม่พบหมอนวด';
  }

  customerName(customerId: string): string {
    return this.customers.find((customer) => customer.id === customerId)?.name ?? 'ไม่พบลูกค้า';
  }

  roomName(roomId: string): string {
    return this.rooms.find((room) => room.id === roomId)?.name ?? 'ไม่พบห้อง';
  }

  async restoreSession(): Promise<void> {
    if (!this.api.hasSession) return;
    this.tenantSlug = this.api.tenant;
    const error = await this.run(async () => {
      await this.loadCurrentUser();
      await this.loadWorkspace();
    });
    if (error instanceof HttpErrorResponse && error.status === 401) this.api.logout();
  }

  async login(tenant: string, email: string, password: string): Promise<void> {
    await this.run(async () => {
      await this.api.login(tenant, email, password);
      this.tenantSlug = tenant.trim().toLowerCase();
      await this.loadCurrentUser();
      await this.loadWorkspace();
    });
    if (!this.isAuthenticated) {
      this.api.logout();
      sessionStorage.removeItem(branchStorageKey);
      this.selectedBranchId = '';
      this.pendingBranchId = '';
      this.dashboardBranchId = 'all';
      this.branchDialogOpen = false;
      this.branchSelectionRequired = false;
    }
  }

  logout(): void {
    this.api.logout();
    this.isAuthenticated = false;
    this.workspaceLoaded = false;
    this.tenantSlug = '';
    this.email = '';
    this.currentUserId = '';
    this.currentUserRole = '';
    this.demoDataStatus = null;
    this.branches = [];
    this.services = [];
    this.staff = [];
    this.rooms = [];
    this.customers = [];
    this.appointments = [];
    this.errorMessage = '';
  }

  openBranchDialog(pendingBranchId = this.selectedBranchId): void {
    this.pendingBranchId = pendingBranchId;
    this.branchSelectionRequired = false;
    this.branchDialogOpen = true;
  }

  closeBranchDialog(): void {
    if (!this.branchSelectionRequired) this.branchDialogOpen = false;
  }

  async changeBranch(): Promise<void> {
    const branch = this.branches.find((item) => item.id === this.pendingBranchId && item.isActive);
    if (!branch) return;
    const changed = branch.id !== this.selectedBranchId;
    this.selectedBranchId = branch.id;
    sessionStorage.setItem(branchStorageKey, branch.id);
    this.branchDialogOpen = false;
    this.branchSelectionRequired = false;
    if (changed) {
      await this.run(() => this.reloadAppointments());
      this.branchChanged.next(branch.id);
    }
  }

  /** Reloads `appointments` for `selectedDate`, reporting errors in the banner. */
  async loadAppointments(): Promise<void> {
    await this.run(() => this.reloadAppointments());
  }

  /** Reloads `appointments` for `selectedDate`; for use inside a `run` block. */
  async reloadAppointments(): Promise<void> {
    const { from, to } = dayRange(this.selectedDate);
    this.appointments = await this.api.appointments(from, to, this.appointmentBranchFilter());
  }

  replaceAppointment(updated: Appointment): void {
    this.appointments = this.appointments.map((item) => item.id === updated.id ? updated : item);
  }

  async loadWorkspace(): Promise<void> {
    const [branches, services, staff, rooms, customers] = await Promise.all([
      this.api.branches(),
      this.api.services(),
      this.api.staff(),
      this.api.rooms(),
      this.api.customers(),
    ]);
    this.branches = branches;
    if (this.dashboardBranchId !== 'all' && !branches.some((branch) => branch.id === this.dashboardBranchId && branch.isActive)) {
      this.dashboardBranchId = 'all';
    }
    this.services = services;
    this.staff = staff;
    this.rooms = rooms;
    this.customers = customers;
    const activeBranches = this.activeBranches;
    const savedBranchId = sessionStorage.getItem(branchStorageKey);
    const hasSavedBranch = activeBranches.some((branch) => branch.id === savedBranchId);
    const branchId = hasSavedBranch ? savedBranchId! : activeBranches[0]?.id ?? '';
    const changed = this.workspaceLoaded && branchId !== this.selectedBranchId;
    this.selectedBranchId = branchId;
    this.pendingBranchId = branchId;
    this.branchSelectionRequired = activeBranches.length > 1 && !hasSavedBranch;
    this.branchDialogOpen = this.branchSelectionRequired;
    if (activeBranches.length === 1) sessionStorage.setItem(branchStorageKey, branchId);
    await this.reloadAppointments();
    this.demoDataStatus = this.canManage ? await this.api.demoDataStatus() : null;
    this.workspaceLoaded = true;
    if (changed) this.branchChanged.next(branchId);
  }

  async run(action: () => Promise<void>): Promise<unknown | null> {
    this.busy = true;
    this.errorMessage = '';
    try {
      await action();
      return null;
    } catch (error) {
      this.errorMessage = this.errorText(error);
      return error;
    } finally {
      this.busy = false;
      this.notifyView();
    }
  }

  private async loadCurrentUser(): Promise<void> {
    const user = await this.api.currentUser();
    this.email = user.email;
    this.currentUserId = user.id;
    this.currentUserRole = user.role;
    this.isAuthenticated = true;
    this.notifyView();
  }

  private appointmentBranchFilter(): string | undefined {
    if (this.activeSection === 'overview') return this.dashboardBranchId === 'all' ? undefined : this.dashboardBranchId;
    return this.selectedBranchId || undefined;
  }

  private errorText(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const message = typeof error.error?.error === 'string' ? error.error.error : '';
      if (message) return message;
      if (error.status === 0) return 'เชื่อมต่อ API ไม่ได้ ตรวจสอบว่า API ทำงานอยู่ที่พอร์ต 5080';
      if (error.status === 401) return 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบ tenant, อีเมล และรหัสผ่าน';
      if (error.status === 409) return 'เวลานี้มีคิวนัดซ้อนกัน กรุณาเลือกเวลา ห้อง หรือหมอนวดอื่น';
      return `คำขอไม่สำเร็จ (HTTP ${error.status})`;
    }
    return error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
  }
}
