import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import {
  Appointment,
  Branch,
  Customer,
  CustomerType,
  DemoDataStatus,
  MassageApi,
  MassageService,
  Room,
  Sale,
  StaffScheduleDay,
  StaffScheduleException,
  StaffMember,
  TenantUser,
  WorkShift,
} from './massage-api';

type Section = 'overview' | 'pos' | 'booking' | 'orders' | 'rooms' | 'appointments' | 'services' | 'team' | 'customers' | 'branches' | 'users';
type IconName = 'layout-dashboard' | 'shopping-bag' | 'calendar-days' | 'clipboard-list' | 'door-open' | 'calendar-plus' | 'sparkles' | 'users-round' | 'contact-round' | 'map-pinned' | 'user-round' | 'wallet' | 'users';
type PosCategory = 'all' | 'thai' | 'aroma' | 'spa' | 'package';
type PosCartItem = { service: MassageService; quantity: number };
type RoomBoardFilter = 'all' | 'available' | 'busy' | 'booked' | 'disabled';

@Component({
  imports: [CommonModule, FormsModule, NgSelectModule, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App implements OnInit {
  protected readonly sections: { id: Section; label: string; icon: IconName }[] = [
    { id: 'overview', label: 'ภาพรวม', icon: 'layout-dashboard' },
    { id: 'pos', label: 'POS / ขาย', icon: 'shopping-bag' },
    { id: 'booking', label: 'Booking', icon: 'calendar-days' },
    { id: 'orders', label: 'Order', icon: 'clipboard-list' },
    { id: 'rooms', label: 'ห้อง / เตียง', icon: 'door-open' },
    { id: 'appointments', label: 'นัดหมายใหม่', icon: 'calendar-plus' },
    { id: 'services', label: 'บริการ', icon: 'sparkles' },
    { id: 'team', label: 'Therapist / พนักงาน', icon: 'users-round' },
    { id: 'customers', label: 'ลูกค้า', icon: 'contact-round' },
    { id: 'branches', label: 'จัดการสาขา', icon: 'map-pinned' },
    { id: 'users', label: 'บัญชีผู้ใช้', icon: 'user-round' },
  ];
  protected readonly iconPaths: Record<IconName, readonly string[]> = {
    'layout-dashboard': ['M3 3h7v9H3z', 'M14 3h7v5h-7z', 'M14 12h7v9h-7z', 'M3 16h7v5H3z'],
    'shopping-bag': ['M6 7V6a6 6 0 0 1 12 0v1', 'M4 7h16l1 14H3L4 7Z', 'M9 11v2a3 3 0 0 0 6 0v-2'],
    'calendar-days': ['M8 2v4', 'M16 2v4', 'M3 10h18', 'M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z', 'M8 14h.01', 'M12 14h.01', 'M16 14h.01', 'M8 18h.01', 'M12 18h.01'],
    'clipboard-list': ['M9 5h6', 'M9 3h6v4H9z', 'M7 5H5v16h14V5h-2', 'M9 12h6', 'M9 16h6'],
    'door-open': ['M13 4l7-2v20l-7-2', 'M13 4v16', 'M3 12h11', 'm10 9 4 3-4 3', 'M17 12h.01'],
    'calendar-plus': ['M8 2v4', 'M16 2v4', 'M3 10h18', 'M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z', 'M12 14v6', 'M9 17h6'],
    sparkles: ['m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z', 'm19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z', 'm5 2 .8 2.2L8 5l-2.2.8L5 8l-.8-2.2L2 5l2.2-.8L5 2Z'],
    'users-round': ['M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M20 8v6', 'M23 11h-6'],
    'contact-round': ['M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M16 3.1a4 4 0 0 1 0 7.8', 'M20 21v-2a4 4 0 0 0-3-3.9'],
    'map-pinned': ['M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z', 'M12 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z', 'M4 14l-2 1v6l6-3 8 3 6-3v-2'],
    'user-round': ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z'],
    wallet: ['M3 6.5A2.5 2.5 0 0 1 5.5 4H21v16H5a2 2 0 0 1-2-2V6.5Z', 'M3 7h18', 'M16 14h.01'],
    users: ['M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M20 21v-2a4 4 0 0 0-3-3.9', 'M16 3.1a4 4 0 0 1 0 7.8'],
  };

  protected isAuthenticated = false;
  protected busy = false;
  protected errorMessage = '';
  protected activeSection: Section = 'overview';
  protected tenantSlug = '';
  protected email = '';
  protected currentUserId = '';
  protected currentUserRole = '';
  protected password = '';
  protected selectedDate = this.localDateValue(new Date());
  protected branches: Branch[] = [];
  protected selectedBranchId = '';
  protected pendingBranchId = '';
  protected branchDialogOpen = false;
  protected branchSelectionRequired = false;
  protected dashboardBranchId = 'all';
  protected services: MassageService[] = [];
  protected staff: StaffMember[] = [];
  protected scheduleDays: StaffScheduleDay[] = this.emptyWeek();
  protected scheduleExceptions: StaffScheduleException[] = [];
  protected scheduleStaffId = '';
  protected exceptionForm = { date: this.localDateValue(new Date()), isDayOff: true, startTime: '09:00', endTime: '18:00' };
  protected rooms: Room[] = [];
  protected customers: Customer[] = [];
  protected customerSearchResults: Customer[] = [];
  protected users: TenantUser[] = [];
  protected appointments: Appointment[] = [];
  protected bookingAppointments: Appointment[] = [];
  protected roomAppointments: Appointment[] = [];
  protected bookingDialogOpen = false;
  protected bookingLoading = false;
  protected bookingDraggedAppointmentId = '';
  protected bookingDragOverResourceId = '';
<<<<<<< HEAD
  protected draggedServiceId = '';
  protected bookingDropZoneActive = false;
  protected quickAddModalOpen = false;
  protected quickAddStaffId = '';
  protected quickAddTime = '10:00';
=======
>>>>>>> 9df2ca2 (Add massage platform application)
  protected readonly roomBoardFilters: RoomBoardFilter[] = ['all', 'available', 'busy', 'booked', 'disabled'];
  protected readonly roomBoardDate = this.localDateValue(new Date());
  protected roomSearch = '';
  protected roomBoardFilter: RoomBoardFilter = 'all';
  protected roomCreateOpen = false;
  protected customerSearch = '';
  protected customerFilter: 'all' | CustomerType = 'all';
  protected readonly customerTypes: CustomerType[] = ['VIP', 'สมาชิก', 'ลูกค้าใหม่', 'ทั่วไป'];
  private customerSearchSequence = 0;
  protected customerCreateOpen = false;
  protected customerDeleteTarget: Customer | null = null;
  protected readonly posCategories: { id: PosCategory; label: string }[] = [
    { id: 'all', label: 'ทั้งหมด' },
    { id: 'thai', label: 'นวดไทย' },
    { id: 'aroma', label: 'อโรมา' },
    { id: 'spa', label: 'สปา' },
    { id: 'package', label: 'แพ็กเกจ' },
  ];
  protected posCategory: PosCategory = 'all';
  protected posSearch = '';
  protected posCart: PosCartItem[] = [];
  protected posStaffId = '';
  protected posRoomId = '';
  protected posBranchId = '';
  protected posCustomerId = '';
  protected pendingPosAppointmentId = '';
  protected posPaymentMethod: Sale['paymentMethod'] = 'Cash';
  protected paymentDialogOpen = false;
  protected receiptDialogOpen = false;
  protected posSales: Sale[] = [];
  protected orderSales: Sale[] = [];
  protected get orderSalesTotal(): number {
    return this.orderSales.reduce((total, sale) => total + sale.total, 0);
  }
  protected lastPosSale: Sale | null = null;
  protected demoDataStatus: DemoDataStatus | null = null;
  protected demoSeedMessage = '';
  protected loginForm = { tenant: '', email: '', password: '' };
  protected appointmentForm = {
    branchId: '',
    serviceId: '',
    staffId: '',
    customerId: '',
    roomId: '',
    date: this.localDateValue(new Date()),
    time: '10:00',
    notes: '',
  };
  protected editingAppointmentId = '';
  protected branchForm = { name: '', address: '', timeZone: 'Asia/Bangkok' };
  protected serviceForm = { name: '', durationMinutes: 60, price: 0 };
  protected staffForm = { branchId: '', name: '', email: '' };
  protected roomForm = { branchId: '', name: '' };
  protected customerForm = { name: '', email: '', phone: '', notes: '', type: 'ลูกค้าใหม่' as CustomerType };
  protected userForm: { email: string; password: string; role: 'Owner' | 'Manager' | 'Staff' } = {
    email: '',
    password: '',
    role: 'Staff',
  };
  protected userDialogOpen = false;
  protected userDeleteTarget: TenantUser | null = null;
  protected editingBranchId = '';
  protected branchFormDialogOpen = false;
  protected branchDeleteTarget: Branch | null = null;
  protected editingServiceId = '';
  protected serviceFormDialogOpen = false;
  protected serviceDeleteTarget: MassageService | null = null;
  protected editingStaffId = '';
  protected staffFormDialogOpen = false;
  protected staffDeleteTarget: StaffMember | null = null;
  protected teamTab: 'staff' | 'rooms' | 'schedule' = 'staff';
  protected staffSearch = '';
  protected roomFormDialogOpen = false;
  protected roomDeleteTarget: Room | null = null;
  protected editingRoomId = '';
  protected editingCustomerId = '';
  protected editingUserId = '';

  constructor(
    private readonly api: MassageApi,
    private readonly router: Router,
    private readonly changeDetector: ChangeDetectorRef,
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.syncSectionFromRoute();
        this.changeDetector.markForCheck();
      }
    });
  }

  protected get canManage(): boolean {
    return this.currentUserRole === 'Owner' || this.currentUserRole === 'Manager';
  }

  async ngOnInit(): Promise<void> {
    if (this.api.hasSession) {
      this.tenantSlug = this.api.tenant;
      const error = await this.run(async () => {
        const user = await this.api.currentUser();
        this.email = user.email;
        this.currentUserId = user.id;
        this.currentUserRole = user.role;
        this.isAuthenticated = true;
        this.changeDetector.markForCheck();
        await this.loadWorkspace();
      });
      if (error instanceof HttpErrorResponse && error.status === 401) this.api.logout();
      if (this.isAuthenticated) {
        this.syncSectionFromRoute(false);
        this.refreshSectionData(this.activeSection);
      }
    }
  }

  protected get filteredCustomers(): Customer[] {
    const query = this.customerSearch.trim().toLocaleLowerCase();
    const results = query ? this.customerSearchResults : this.customers;
    return results.filter((customer) => {
      return this.customerFilter === 'all' || customer.type === this.customerFilter;
    });
  }

  protected get customersWithPhone(): number {
    return this.customers.filter((customer) => !!customer.phone?.trim()).length;
  }

  protected get customerMemberCount(): number {
    return this.customers.filter((customer) => customer.type === 'สมาชิก' || customer.type === 'VIP').length;
  }

  protected get customersToday(): number {
    return new Set(this.selectedAppointments.map((appointment) => appointment.customerId)).size;
  }

  protected get todayLabel(): string {
    return new Intl.DateTimeFormat('th-TH', {
      day: 'numeric',
      month: 'long',
      weekday: 'long',
      year: 'numeric',
    }).format(new Date());
  }

  protected get selectedDateLabel(): string {
    return new Intl.DateTimeFormat('th-TH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(`${this.selectedDate}T12:00:00`));
  }

  protected get selectedAppointments(): Appointment[] {
    return this.appointments.filter((appointment) =>
      this.localDateValue(new Date(appointment.startsAt)) === this.selectedDate
      && (this.activeSection === 'overview'
        ? this.dashboardBranchId === 'all' || appointment.branchId === this.dashboardBranchId
        : appointment.branchId === this.selectedBranchId),
    );
  }

  protected get upcomingAppointments(): Appointment[] {
    return [...this.selectedAppointments].sort(
      (first, second) => new Date(first.startsAt).getTime() - new Date(second.startsAt).getTime(),
    );
  }

  protected get activeRoomsList(): Room[] {
    return this.rooms.filter((room) => room.isActive && this.matchesDashboardBranch(room.branchId));
  }

  protected get activeStaff(): StaffMember[] {
    return this.staff.filter((member) => member.isActive && member.branchId === this.appointmentForm.branchId);
  }

  protected get activeRooms(): Room[] {
    return this.rooms.filter((room) => room.isActive && room.branchId === this.appointmentForm.branchId);
  }

  protected get posServices(): MassageService[] {
    const query = this.posSearch.trim().toLocaleLowerCase();
    return this.services.filter((service) =>
      service.isActive &&
      (this.posCategory === 'all' || this.posServiceCategory(service) === this.posCategory) &&
      (!query || service.name.toLocaleLowerCase().includes(query)),
    );
  }

  protected get posStaff(): StaffMember[] {
    return this.staff.filter((member) => member.isActive && member.branchId === this.posBranchId);
  }

  protected get posRooms(): Room[] {
    return this.rooms.filter((room) => room.isActive && room.branchId === this.posBranchId);
  }

  protected get posItemCount(): number {
    return this.posCart.reduce((count, item) => count + item.quantity, 0);
  }

  protected get posSubtotal(): number {
    return this.posCart.reduce((total, item) => total + item.service.price * item.quantity, 0);
  }

  protected paymentMethodLabel(method: Sale['paymentMethod']): string {
    return { Cash: 'เงินสด', BankTransfer: 'QR พร้อมเพย์', Card: 'บัตรเครดิต' }[method];
  }

  protected get bookingAgendaDateLabel(): string {
    return new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })
      .format(new Date(`${this.selectedDate}T12:00:00`));
  }

  protected get bookingRangeStart(): Date {
    return new Date(`${this.selectedDate}T00:00:00`);
  }

  protected get bookingRangeEnd(): Date {
    const end = new Date(this.bookingRangeStart);
    end.setDate(end.getDate() + 1);
    return end;
  }

  protected get bookingTimeSlots(): string[] {
    return Array.from({ length: 27 }, (_, index) => {
      const minutes = 9 * 60 + index * 30;
      return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
    });
  }

  protected get bookingResourceRows(): { id: string; name: string; detail: string }[] {
    return this.staff.filter((member) => member.isActive && member.branchId === this.selectedBranchId).map((member) => ({
      id: member.id,
      name: member.name,
      detail: this.branchName(member.branchId),
    }));
  }

  protected get selectedBookingAppointments(): Appointment[] {
    return this.bookingAppointmentsFor(new Date(`${this.selectedDate}T12:00:00`));
  }

  protected get bookingScheduledCount(): number {
    return this.selectedBookingAppointments.filter((appointment) => appointment.status === 'Scheduled').length;
  }

  protected get bookingCompletedCount(): number {
    return this.selectedBookingAppointments.filter((appointment) => appointment.status === 'Completed').length;
  }

  protected get bookingInProgressCount(): number {
    return this.selectedBookingAppointments.filter((appointment) => appointment.status === 'InProgress').length;
  }

  protected get bookingCancelledCount(): number {
    return this.selectedBookingAppointments.filter((appointment) => appointment.status === 'Cancelled').length;
  }

  protected get filteredRooms(): Room[] {
    const query = this.roomSearch.trim().toLocaleLowerCase();
    return this.roomsInSelectedBranch.filter((room) => {
      const status = this.roomStatus(room);
      const matchesFilter = this.roomBoardFilter === 'all' || status === this.roomBoardFilter;
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

  protected get completedRevenue(): number {
    return this.selectedAppointments
      .filter((appointment) => appointment.status === 'Completed')
      .reduce((total, appointment) => total + (this.services.find((service) => service.id === appointment.serviceId)?.price ?? 0), 0);
  }

  protected get customerCountToday(): number {
    return new Set(this.selectedAppointments.map((appointment) => appointment.customerId)).size;
  }

  protected get activeRoomCount(): number {
    return this.activeRoomsList.length;
  }

  protected get activeServiceCount(): number {
    return this.services.filter((service) => service.isActive).length;
  }

  protected get pendingAppointments(): number {
    return this.selectedAppointments.filter((appointment) => appointment.status === 'Scheduled').length;
  }

  protected get completedAppointmentCount(): number {
    return this.selectedAppointments.filter((appointment) => appointment.status === 'Completed').length;
  }

  protected get cancelledAppointmentCount(): number {
    return this.selectedAppointments.filter((appointment) => appointment.status === 'Cancelled').length;
  }

  protected get activeStaffCount(): number {
    return this.staff.filter((member) => member.isActive && this.matchesDashboardBranch(member.branchId)).length;
  }

  protected get roomsInSelectedBranch(): Room[] {
    return this.rooms.filter((room) => room.branchId === this.selectedBranchId);
  }


  protected get filteredStaff(): StaffMember[] {
    const query = this.staffSearch.trim().toLocaleLowerCase();
    return this.staffInSelectedBranch.filter((member) =>
      !query || `${member.name} ${member.email ?? ''}`.toLocaleLowerCase().includes(query),
    );
  }
  protected get staffInSelectedBranch(): StaffMember[] {
    return this.staff.filter((member) => member.branchId === this.selectedBranchId);
  }

  protected get selectedBranchActiveStaffCount(): number {
    return this.staffInSelectedBranch.filter((member) => member.isActive).length;
  }

  protected get currentBranchName(): string {
    return this.branches.find((branch) => branch.id === this.selectedBranchId)?.name ?? 'เลือกสาขา';
  }

  protected matchesDashboardBranch(branchId: string): boolean {
    return this.dashboardBranchId === 'all' || branchId === this.dashboardBranchId;
  }

  protected openBranchDialog(): void {
    this.pendingBranchId = this.selectedBranchId;
    this.branchSelectionRequired = false;
    this.branchDialogOpen = true;
  }

  protected closeBranchDialog(): void {
    if (!this.branchSelectionRequired) this.branchDialogOpen = false;
  }

  protected async changeBranch(): Promise<void> {
    const branch = this.branches.find((item) => item.id === this.pendingBranchId && item.isActive);
    if (!branch) return;
    const changed = branch.id !== this.selectedBranchId;
    this.selectedBranchId = branch.id;
    sessionStorage.setItem('massage.branchId', branch.id);
    this.appointmentForm.branchId = branch.id;
    this.posBranchId = branch.id;
    this.staffForm.branchId = branch.id;
    this.roomForm.branchId = branch.id;
    this.branchDialogOpen = false;
    this.branchSelectionRequired = false;
    this.branchChanged();
    this.posBranchChanged();
    this.scheduleStaffId = '';
    this.scheduleDays = this.emptyWeek();
    this.scheduleExceptions = [];
    if (changed) {
      await this.run(async () => {
        await Promise.all([
          this.loadAppointmentsForCurrentView(),
          this.reloadBookingAppointments(),
          this.reloadRoomAppointments(),
        ]);
      });
      if (this.activeSection === 'pos') await this.loadPosSales();
      if (this.activeSection === 'orders') await this.loadOrders();
    }
  }

  protected async dashboardBranchChanged(): Promise<void> {
    if (this.activeSection === 'overview') await this.loadAppointments();
  }

  protected selectSection(section: Section): void {
    this.activeSection = section;
    this.errorMessage = '';
    void this.router.navigateByUrl(section === 'overview' ? '/' : `/${section}`);
    this.refreshSectionData(section);
  }

  protected async searchCustomers(query: string): Promise<void> {
    this.customerSearch = query;
    const sequence = ++this.customerSearchSequence;
    if (!query.trim()) {
      this.customerSearchResults = [];
      return;
    }
    await this.run(async () => {
      const results = await this.api.customers(query.trim());
      if (sequence === this.customerSearchSequence) this.customerSearchResults = results;
    });
  }

  protected openUserCreate(): void {
    this.errorMessage = '';
    this.editingUserId = '';
    this.userForm = { email: '', password: '', role: 'Staff' };
    this.userDialogOpen = true;
  }

  protected editUser(user: TenantUser): void {
    this.errorMessage = '';
    this.editingUserId = user.id;
    this.userForm = { email: user.email, password: '', role: user.role };
    this.userDialogOpen = true;
  }

  protected closeUserDialog(): void {
    this.errorMessage = '';
    this.userDialogOpen = false;
    this.editingUserId = '';
    this.userForm = { email: '', password: '', role: 'Staff' };
  }

  protected async saveUser(): Promise<void> {
    await this.run(async () => {
      if (this.editingUserId) {
        const update = { email: this.userForm.email, role: this.userForm.role, ...(this.userForm.password ? { password: this.userForm.password } : {}) };
        await this.api.updateUser(this.editingUserId, update);
      } else {
        await this.api.createUser({ ...this.userForm, role: this.userForm.role as 'Manager' | 'Staff' });
      }
      this.users = await this.api.users();
      this.closeUserDialog();
    });
  }

  protected async toggleUserActive(user: TenantUser): Promise<void> {
    await this.run(async () => {
      await this.api.setUserActive(user.id, !user.isActive);
      this.users = await this.api.users();
    });
  }

  protected openUserDeleteConfirm(user: TenantUser): void {
    this.errorMessage = '';
    this.userDeleteTarget = user;
  }

  protected cancelUserDelete(): void {
    if (!this.busy) this.userDeleteTarget = null;
  }

  protected async confirmDeleteUser(): Promise<void> {
    const user = this.userDeleteTarget;
    if (!user || user.role === 'Owner' || user.id === this.currentUserId) return;
    const error = await this.run(async () => {
      await this.api.deleteUser(user.id);
      this.users = await this.api.users();
    });
    if (error === null) this.userDeleteTarget = null;
  }

  protected async setBookingDate(value: string): Promise<void> {
    if (!value) return;
    this.selectedDate = value;
    this.appointmentForm.date = value;
    await this.loadBookingAppointments();
  }

  protected goToBookingToday(): void {
    void this.setBookingDate(this.localDateValue(new Date()));
  }

  protected bookingAppointmentsFor(date: Date): Appointment[] {
    const dateValue = this.localDateValue(date);
    return this.bookingAppointments
      .filter((appointment) => this.localDateValue(new Date(appointment.startsAt)) === dateValue)
      .sort((first, second) => new Date(first.startsAt).getTime() - new Date(second.startsAt).getTime());
  }

  protected newBooking(): void {
    this.editingAppointmentId = '';
    this.appointmentForm.date = this.selectedDate;
    this.appointmentForm.branchId = this.branches.find((branch) => branch.isActive)?.id ?? '';
    this.appointmentForm.serviceId = this.services.find((service) => service.isActive)?.id ?? '';
    this.appointmentForm.staffId = this.activeStaff[0]?.id ?? '';
    this.appointmentForm.roomId = this.activeRooms[0]?.id ?? '';
    this.appointmentForm.customerId = this.customers[0]?.id ?? '';
    this.appointmentForm.notes = '';
    this.bookingDialogOpen = true;
  }

  protected bookingAppointmentsForResource(resourceId: string): Appointment[] {
    const visibleStart = new Date(`${this.selectedDate}T09:00:00`).getTime();
    const visibleEnd = new Date(`${this.selectedDate}T22:00:00`).getTime();
    return this.selectedBookingAppointments.filter((appointment) =>
      appointment.staffId === resourceId
      && new Date(appointment.endsAt).getTime() > visibleStart
      && new Date(appointment.startsAt).getTime() < visibleEnd,
    );
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
    const minutesFromOpening = Math.floor(
      (event.clientX - row.getBoundingClientRect().left - 190 + (row.parentElement?.parentElement?.scrollLeft ?? 0)) / 72,
    ) * 30;
    const startMinutes = Math.min(21 * 60 + 30, Math.max(9 * 60, 9 * 60 + minutesFromOpening));
    const start = new Date(`${this.selectedDate}T${String(Math.floor(startMinutes / 60)).padStart(2, '0')}:${String(startMinutes % 60).padStart(2, '0')}:00`);
    const destinationStaff = this.staff.find((member) => member.id === resourceId && member.isActive && member.branchId === this.selectedBranchId);
    if (!destinationStaff || (destinationStaff.id === appointment.staffId && start.toISOString() === appointment.startsAt)) return;

    await this.run(async () => {
      await this.api.updateAppointment(appointment.id, {
        branchId: appointment.branchId,
        serviceId: appointment.serviceId,
        staffId: destinationStaff.id,
        customerId: appointment.customerId,
        roomId: appointment.roomId,
        startsAt: start.toISOString(),
        notes: appointment.notes ?? '',
      });
      await Promise.all([
        this.reloadBookingAppointments(),
        this.loadAppointmentsForCurrentView(),
        this.reloadRoomAppointments(),
      ]);
    });
  }

  protected endBookingDrag(): void {
    this.bookingDraggedAppointmentId = '';
    this.bookingDragOverResourceId = '';
  }

  protected async startBooking(appointment: Appointment): Promise<void> {
    if (appointment.status !== 'Scheduled' || this.busy) return;
    await this.run(async () => {
      const updated = await this.api.setAppointmentStatus(appointment.id, 'InProgress');
      this.bookingAppointments = this.bookingAppointments.map((item) => item.id === updated.id ? updated : item);
      this.appointments = this.appointments.map((item) => item.id === updated.id ? updated : item);
      this.roomAppointments = this.roomAppointments.map((item) => item.id === updated.id ? updated : item);
    });
  }

  protected payBooking(appointment: Appointment): void {
    if (appointment.paidSaleId || !['InProgress', 'Completed'].includes(appointment.status)) return;
    const service = this.services.find((item) => item.id === appointment.serviceId && item.isActive);
    if (!service) {
      this.errorMessage = 'ไม่พบบริการที่เปิดใช้งานสำหรับนัดหมายนี้';
      return;
    }
    this.selectedDate = this.localDateValue(new Date(appointment.startsAt));
    this.posBranchId = appointment.branchId;
    this.posCustomerId = appointment.customerId;
    this.posStaffId = appointment.staffId;
    this.posRoomId = appointment.roomId;
    this.posCart = [{ service, quantity: 1 }];
    this.pendingPosAppointmentId = appointment.id;
    this.lastPosSale = null;
    this.paymentDialogOpen = false;
    this.receiptDialogOpen = false;
    this.selectSection('pos');
  }

  protected bookingAppointmentGridColumn(appointment: Appointment): string {
    const start = new Date(appointment.startsAt);
    const end = new Date(appointment.endsAt);
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    const firstColumn = Math.max(2, Math.floor((startMinutes - 9 * 60) / 30) + 2);
    const lastColumn = Math.min(29, Math.ceil((endMinutes - 9 * 60) / 30) + 2);
    const span = Math.max(1, lastColumn - firstColumn);
    return `${firstColumn} / span ${span}`;
  }

  protected bookingAppointmentTone(appointment: Appointment): string {
    if (appointment.status === 'Completed') return 'completed';
    if (appointment.status === 'Cancelled') return 'cancelled';
    if (appointment.status === 'InProgress') return 'green';
    const tones = ['blue', 'green', 'orange'];
    const staffIndex = this.staff.findIndex((member) => member.id === appointment.staffId);
    return tones[Math.max(0, staffIndex) % tones.length];
  }

  protected editBooking(appointment: Appointment): void {
    this.editingAppointmentId = appointment.id;
    this.appointmentForm = {
      branchId: appointment.branchId,
      serviceId: appointment.serviceId,
      staffId: appointment.staffId,
      customerId: appointment.customerId,
      roomId: appointment.roomId,
      date: this.localDateValue(new Date(appointment.startsAt)),
      time: new Date(appointment.startsAt).toTimeString().slice(0, 5),
      notes: appointment.notes ?? '',
    };
    this.bookingDialogOpen = true;
  }

  protected async moveBookingDay(offset: number): Promise<void> {
    const date = new Date(`${this.selectedDate}T12:00:00`);
    date.setDate(date.getDate() + offset);
    await this.setBookingDate(this.localDateValue(date));
  }

  protected closeBookingDialog(): void {
    this.bookingDialogOpen = false;
    this.editingAppointmentId = '';
  }

<<<<<<< HEAD
  protected startServiceDrag(event: DragEvent, serviceId: string): void {
    if (!event.dataTransfer) {
      event.preventDefault();
      return;
    }
    this.draggedServiceId = serviceId;
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('text/plain', serviceId);
  }

  protected allowServiceDrop(event: DragEvent): void {
    if (!this.draggedServiceId) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
    this.bookingDropZoneActive = true;
  }

  protected leaveServiceDropZone(): void {
    this.bookingDropZoneActive = false;
  }

  protected async dropServiceToBooking(event: DragEvent): Promise<void> {
    event.preventDefault();
    const serviceId = event.dataTransfer?.getData('text/plain') || this.draggedServiceId;
    this.draggedServiceId = '';
    this.bookingDropZoneActive = false;

    if (!serviceId) return;

    const service = this.services.find((s) => s.id === serviceId && s.isActive);
    if (!service) return;

    // Open booking modal with dragged service pre-selected
    this.editingAppointmentId = '';
    this.appointmentForm.serviceId = serviceId;
    this.appointmentForm.date = this.selectedDate;
    this.appointmentForm.branchId = this.selectedBranchId || this.branches.find((branch) => branch.isActive)?.id ?? '';
    this.appointmentForm.customerId = this.customers[0]?.id ?? '';
    this.appointmentForm.staffId = this.activeStaff[0]?.id ?? '';
    this.appointmentForm.roomId = this.activeRooms[0]?.id ?? '';
    this.appointmentForm.time = '10:00';
    this.appointmentForm.notes = '';
    this.bookingDialogOpen = true;
  }

  protected endServiceDrag(): void {
    this.draggedServiceId = '';
    this.bookingDropZoneActive = false;
  }

  protected openQuickAddModal(staffId: string, timeSlot: string): void {
    this.quickAddStaffId = staffId;
    this.quickAddTime = timeSlot;
    this.appointmentForm.staffId = staffId;
    this.appointmentForm.time = timeSlot;
    this.appointmentForm.customerId = this.customers[0]?.id ?? '';
    this.appointmentForm.serviceId = '';
    this.appointmentForm.roomId = this.activeRooms[0]?.id ?? '';
    this.quickAddModalOpen = true;
  }

  protected closeQuickAddModal(): void {
    this.quickAddModalOpen = false;
    this.quickAddStaffId = '';
    this.quickAddTime = '10:00';
  }

  protected async submitQuickAdd(): Promise<void> {
    if (!this.appointmentForm.customerId || !this.appointmentForm.serviceId || !this.appointmentForm.staffId || !this.appointmentForm.roomId) {
      return;
    }

    const service = this.services.find((s) => s.id === this.appointmentForm.serviceId && s.isActive);
    if (!service) return;

    const startTime = new Date(`${this.appointmentForm.date}T${this.appointmentForm.time}:00`);
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + service.durationMinutes);

    await this.run(async () => {
      await this.api.createAppointment({
        branchId: this.appointmentForm.branchId,
        serviceId: this.appointmentForm.serviceId,
        staffId: this.appointmentForm.staffId,
        customerId: this.appointmentForm.customerId,
        roomId: this.appointmentForm.roomId,
        startsAt: startTime.toISOString(),
        notes: this.appointmentForm.notes ?? '',
      });
      this.closeQuickAddModal();
      await Promise.all([
        this.reloadBookingAppointments(),
        this.loadAppointmentsForCurrentView(),
        this.reloadRoomAppointments(),
      ]);
    });
  }

=======
>>>>>>> 9df2ca2 (Add massage platform application)
  protected roomStatus(room: Room): Exclude<RoomBoardFilter, 'all'> {
    if (!room.isActive) return 'disabled';
    const now = Date.now();
    const roomAppointments = this.roomAppointments
      .filter((appointment) => appointment.roomId === room.id && (appointment.status === 'Scheduled' || appointment.status === 'InProgress'))
      .sort((first, second) => new Date(first.startsAt).getTime() - new Date(second.startsAt).getTime());
    if (roomAppointments.some((appointment) => new Date(appointment.startsAt).getTime() <= now && new Date(appointment.endsAt).getTime() > now)) {
      return 'busy';
    }
    if (roomAppointments.some((appointment) => new Date(appointment.startsAt).getTime() > now)) return 'booked';
    return 'available';
  }

  protected roomStatusLabel(room: Room): string {
    const labels: Record<Exclude<RoomBoardFilter, 'all'>, string> = {
      available: 'ว่าง',
      busy: 'กำลังให้บริการ',
      booked: 'จองแล้ว',
      disabled: 'ปิดใช้งาน',
    };
    return labels[this.roomStatus(room)];
  }

  protected roomTimeRemaining(appointment: Appointment): string {
    const now = Date.now();
    const startsAt = new Date(appointment.startsAt).getTime();
    if (startsAt > now) return `${this.timeLabel(appointment.startsAt)} น.`;
    const minutes = Math.max(0, Math.ceil((new Date(appointment.endsAt).getTime() - now) / 60_000));
    if (minutes < 1) return 'ใกล้เสร็จ';
    return `เหลือ ${minutes} นาที`;
  }

  protected roomCurrentAppointment(room: Room): Appointment | undefined {
    const now = Date.now();
    return this.roomAppointments
      .filter((appointment) => appointment.roomId === room.id && (appointment.status === 'Scheduled' || appointment.status === 'InProgress'))
      .sort((first, second) => new Date(first.startsAt).getTime() - new Date(second.startsAt).getTime())
      .find((appointment) => new Date(appointment.endsAt).getTime() > now);
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

  protected async loadRoomBoardAppointments(): Promise<void> {
    await this.loadRoomAppointments();
  }

  protected addPosService(service: MassageService): void {
    this.lastPosSale = null;
    const item = this.posCart.find((cartItem) => cartItem.service.id === service.id);
    if (item) {
      item.quantity = Math.min(99, item.quantity + 1);
      return;
    }
    this.posCart = [...this.posCart, { service, quantity: 1 }];
  }

  protected changePosQuantity(serviceId: string, change: number): void {
    const item = this.posCart.find((cartItem) => cartItem.service.id === serviceId);
    if (!item) return;
    if (item.quantity + change <= 0) {
      this.removePosService(serviceId);
      return;
    }
    item.quantity += change;
  }

  protected removePosService(serviceId: string): void {
    this.posCart = this.posCart.filter((item) => item.service.id !== serviceId);
  }

  protected posBranchChanged(): void {
    this.posStaffId = this.posStaff[0]?.id ?? '';
    this.posRoomId = this.posRooms[0]?.id ?? '';
  }

  protected async submitPosSale(): Promise<void> {
    if (!this.posBranchId || !this.posCart.length || this.busy) return;
    await this.run(async () => {
      const sale = await this.api.createSale({
        branchId: this.posBranchId,
        customerId: this.posCustomerId || null,
        staffId: this.posStaffId || null,
        roomId: this.posRoomId || null,
        paymentMethod: this.posPaymentMethod,
        items: this.posCart.map(({ service, quantity }) => ({ serviceId: service.id, quantity })),
        ...(this.pendingPosAppointmentId ? { appointmentId: this.pendingPosAppointmentId } : {}),
      });
      this.lastPosSale = sale;
      this.posSales = [sale, ...this.posSales.filter((item) => item.id !== sale.id)].slice(0, 5);
      this.posCart = [];
      const paidAppointmentId = this.pendingPosAppointmentId;
      this.pendingPosAppointmentId = '';
      this.paymentDialogOpen = false;
      this.receiptDialogOpen = true;
      if (paidAppointmentId) {
        await Promise.all([
          this.reloadBookingAppointments(),
          this.loadAppointmentsForCurrentView(),
          this.reloadRoomAppointments(),
        ]);
      }

    });
  }

  protected get pendingPosAppointment(): Appointment | undefined {
    return this.bookingAppointments.find((appointment) => appointment.id === this.pendingPosAppointmentId);
  }

  protected printReceipt(): void {
    window.print();
  }

  protected async seedDemoData(): Promise<void> {
    await this.run(async () => {
      const result = await this.api.seedDemoData();
      this.demoSeedMessage = result.created
        ? `${result.message} (${result.branches} สาขา · ${result.services} บริการ · ${result.staff} หมอนวด · ${result.rooms} ห้อง · ${result.customers} ลูกค้า · ${result.appointments} นัดหมาย · ${result.sales} รายการขาย)`
        : result.message;
      await this.loadWorkspace();
    });
  }

  protected async loadPosSales(): Promise<void> {
    const today = this.localDateValue(new Date());
    const from = new Date(`${today}T00:00:00`);
    const to = new Date(from);
    to.setDate(to.getDate() + 1);
    await this.run(async () => {
      this.posSales = await this.api.sales(from.toISOString(), to.toISOString(), this.selectedBranchId);
    });
  }

  protected async loadOrdersForDate(date: string): Promise<void> {
    if (!date) return;
    this.selectedDate = date;
    await this.loadOrders();
  }

  protected async loadOrders(): Promise<void> {
    const from = new Date(`${this.selectedDate}T00:00:00`);
    const to = new Date(from);
    to.setDate(to.getDate() + 1);
    await this.run(async () => {
      this.orderSales = await this.api.sales(from.toISOString(), to.toISOString(), this.selectedBranchId);
    });
  }

  protected posServiceCategory(service: MassageService): PosCategory {
    const name = service.name.toLocaleLowerCase();
    if (/แพ็กเกจ|package|course/.test(name)) return 'package';
    if (/อโรม|aroma|น้ำมัน/.test(name)) return 'aroma';
    if (/สปา|ฝ่าเท้า|นวดเท้า|สครับ|ประคบ|spa|scrub|foot/.test(name)) return 'spa';
    return 'thai';
  }

  protected posServiceTone(service: MassageService): string {
    const tones: Record<PosCategory, string> = {
      all: 'sage',
      thai: 'sage',
      aroma: 'rose',
      spa: 'sand',
      package: 'amber',
    };
    return tones[this.posServiceCategory(service)];
  }

  protected async login(): Promise<void> {
    await this.run(async () => {
      await this.api.login(this.loginForm.tenant, this.loginForm.email, this.loginForm.password);
      this.tenantSlug = this.loginForm.tenant.trim().toLowerCase();
      const user = await this.api.currentUser();
      this.email = user.email;
      this.currentUserId = user.id;
      this.currentUserRole = user.role;
      this.isAuthenticated = true;
      this.changeDetector.markForCheck();
      this.syncSectionFromRoute(false);
      await this.loadWorkspace();
    });
    if (this.isAuthenticated) {
      this.refreshSectionData(this.activeSection);
    } else {
      this.api.logout();
      sessionStorage.removeItem('massage.branchId');
      this.selectedBranchId = '';
      this.pendingBranchId = '';
      this.dashboardBranchId = 'all';
      this.branchDialogOpen = false;
      this.branchSelectionRequired = false;
    }
  }

  protected logout(): void {
    this.api.logout();
    this.isAuthenticated = false;
    this.tenantSlug = '';
    this.currentUserId = '';
    this.currentUserRole = '';
    this.demoDataStatus = null;
    this.demoSeedMessage = '';
    this.branches = [];
    this.services = [];
    this.staff = [];
    this.rooms = [];
    this.customers = [];
    this.customerSearchResults = [];
    this.users = [];
    this.customerSearch = '';
    this.posSales = [];
    this.lastPosSale = null;
    this.posCustomerId = '';
    this.pendingPosAppointmentId = '';
    this.posCart = [];
    this.appointments = [];
    this.scheduleStaffId = '';
    this.scheduleDays = this.emptyWeek();
    this.scheduleExceptions = [];
    this.errorMessage = '';
  }

  protected async loadAppointments(): Promise<void> {
    await this.run(async () => {
      const day = new Date(`${this.selectedDate}T00:00:00`);
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      await this.reloadAppointments(day, nextDay, this.appointmentBranchFilter());
    });
  }

  protected async loadBookingAppointments(): Promise<void> {
    this.bookingLoading = true;
    await this.run(async () => this.reloadBookingAppointments());
    this.bookingLoading = false;
  }

  protected async loadRoomAppointments(): Promise<void> {
    await this.run(async () => this.reloadRoomAppointments());
  }

  protected async createAppointment(): Promise<void> {
    const fromBookingDialog = this.bookingDialogOpen;
    await this.run(async () => {
      const startsAt = new Date(`${this.appointmentForm.date}T${this.appointmentForm.time}:00`);
      const request = {
        branchId: this.appointmentForm.branchId,
        serviceId: this.appointmentForm.serviceId,
        staffId: this.appointmentForm.staffId,
        customerId: this.appointmentForm.customerId,
        roomId: this.appointmentForm.roomId,
        startsAt: startsAt.toISOString(),
        notes: this.appointmentForm.notes,
      };
      if (this.editingAppointmentId) await this.api.updateAppointment(this.editingAppointmentId, request);
      else await this.api.createAppointment(request);
      this.editingAppointmentId = '';
      this.selectedDate = this.appointmentForm.date;
      this.appointmentForm.notes = '';
      if (fromBookingDialog) this.bookingDialogOpen = false;
      await this.loadWorkspace();
      await this.reloadBookingAppointments();
      if (!fromBookingDialog) {
        this.activeSection = 'appointments';
      }
    });
  }

  protected editAppointment(appointment: Appointment): void {
    this.editingAppointmentId = appointment.id;
    this.appointmentForm = {
      branchId: appointment.branchId,
      serviceId: appointment.serviceId,
      staffId: appointment.staffId,
      customerId: appointment.customerId,
      roomId: appointment.roomId,
      date: this.localDateValue(new Date(appointment.startsAt)),
      time: new Date(appointment.startsAt).toTimeString().slice(0, 5),
      notes: appointment.notes ?? '',
    };
    this.selectedDate = this.appointmentForm.date;
    this.selectSection('appointments');
  }

  protected cancelAppointmentEdit(): void {
    this.editingAppointmentId = '';
    this.appointmentForm.notes = '';
  }

  protected async updateAppointmentStatus(appointment: Appointment, status: 'InProgress' | 'Completed' | 'Cancelled'): Promise<void> {
    await this.run(async () => {
      const updated = await this.api.setAppointmentStatus(appointment.id, status);
      const day = new Date(`${this.selectedDate}T00:00:00`);
      const nextDay = new Date(day);
      nextDay.setDate(nextDay.getDate() + 1);
      await this.reloadAppointments(day, nextDay, this.appointmentBranchFilter());
      this.bookingAppointments = this.bookingAppointments.map((item) => item.id === updated.id ? updated : item);
      this.roomAppointments = this.roomAppointments.map((item) => item.id === updated.id ? updated : item);
    });
  }

  protected async createBranch(): Promise<void> {
    await this.run(async () => {
      const createdBranch = this.editingBranchId ? null : await this.api.createBranch(this.branchForm);
      if (this.editingBranchId) await this.api.updateBranch(this.editingBranchId, this.branchForm);
      this.branchForm = { name: '', address: '', timeZone: 'Asia/Bangkok' };
      this.editingBranchId = '';
      this.branchFormDialogOpen = false;
      await this.loadWorkspace();
      if (createdBranch) {
        this.pendingBranchId = createdBranch.id;
        this.branchSelectionRequired = false;
        this.branchDialogOpen = true;
      }
    });
  }

  protected editBranch(branch: Branch): void {
    this.editingBranchId = branch.id;
    this.branchForm = { name: branch.name, address: branch.address ?? '', timeZone: branch.timeZone };
    this.branchFormDialogOpen = true;
  }

  protected openBranchCreate(): void {
    this.errorMessage = '';
    this.editingBranchId = '';
    this.branchForm = { name: '', address: '', timeZone: 'Asia/Bangkok' };
    this.branchFormDialogOpen = true;
  }

  protected closeBranchForm(): void {
    this.branchFormDialogOpen = false;
    this.editingBranchId = '';
    this.branchForm = { name: '', address: '', timeZone: 'Asia/Bangkok' };
    this.errorMessage = '';
  }

  protected openBranchDeleteConfirm(branch: Branch): void {
    this.errorMessage = '';
    this.branchDeleteTarget = branch;
  }

  protected cancelBranchDelete(): void {
    if (!this.busy) this.branchDeleteTarget = null;
  }

  protected async confirmDeleteBranch(): Promise<void> {
    const branch = this.branchDeleteTarget;
    if (!branch) return;
    const error = await this.run(async () => {
      await this.api.deleteBranch(branch.id);
      if (this.posBranchId === branch.id) this.posBranchId = '';
      await this.loadWorkspace();
    });
    if (error === null) this.branchDeleteTarget = null;
  }

  protected cancelBranchEdit(): void {
    this.closeBranchForm();
  }

  protected branchChanged(): void {
    this.appointmentForm.staffId = this.activeStaff[0]?.id ?? '';
    this.appointmentForm.roomId = this.activeRooms[0]?.id ?? '';
  }

  protected get activeSectionLabel(): string {
    return this.sections.find((section) => section.id === this.activeSection)?.label ?? 'ภาพรวม';
  }

  protected async createService(): Promise<void> {
    await this.run(async () => {
      if (this.editingServiceId) await this.api.updateService(this.editingServiceId, this.serviceForm);
      else await this.api.createService(this.serviceForm);
      this.serviceForm = { name: '', durationMinutes: 60, price: 0 };
      this.editingServiceId = '';
      this.serviceFormDialogOpen = false;
      await this.loadWorkspace();
    });
  }

  protected openServiceCreate(): void {
    this.cancelServiceEdit();
    this.serviceFormDialogOpen = true;
  }

  protected editService(service: MassageService): void {
    this.editingServiceId = service.id;
    this.serviceForm = { name: service.name, durationMinutes: service.durationMinutes, price: service.price };
    this.serviceFormDialogOpen = true;
  }

  protected closeServiceForm(): void {
    this.serviceFormDialogOpen = false;
    this.cancelServiceEdit();
  }

  protected cancelServiceDelete(): void {
    this.serviceDeleteTarget = null;
  }

  protected async confirmDeleteService(): Promise<void> {
    const service = this.serviceDeleteTarget;
    if (!service) return;
    await this.run(async () => {
      await this.api.deleteService(service.id);
      this.serviceDeleteTarget = null;
      await this.loadWorkspace();
    });
  }

  protected cancelServiceEdit(): void {
    this.editingServiceId = '';
    this.serviceForm = { name: '', durationMinutes: 60, price: 0 };
  }

  protected async createStaff(): Promise<void> {
    const error = await this.run(async () => {
      if (this.editingStaffId) await this.api.updateStaff(this.editingStaffId, this.staffForm);
      else await this.api.createStaff(this.staffForm);
      this.staffForm = { branchId: '', name: '', email: '' };
      this.editingStaffId = '';
      this.staffFormDialogOpen = false;
      await this.loadWorkspace();
    });
  }

  protected openStaffCreate(): void {
    this.cancelStaffEdit();
    this.staffForm.branchId = this.selectedBranchId;
    this.staffFormDialogOpen = true;
  }

  protected editStaff(member: StaffMember): void {
    this.editingStaffId = member.id;
    this.staffForm = { branchId: member.branchId, name: member.name, email: member.email ?? '' };
    this.staffFormDialogOpen = true;
  }

  protected closeStaffForm(): void {
    this.staffFormDialogOpen = false;
    this.cancelStaffEdit();
  }

  protected cancelStaffDelete(): void {
    this.staffDeleteTarget = null;
  }

  protected async confirmDeactivateStaff(): Promise<void> {
    const member = this.staffDeleteTarget;
    if (!member) return;
    const error = await this.run(async () => {
      await this.api.deactivateStaff(member.id);
      if (this.scheduleStaffId === member.id) await this.selectScheduleStaff('');
      this.staffDeleteTarget = null;
      await this.loadWorkspace();
    });
  }

  protected async reactivateStaff(member: StaffMember): Promise<void> {
    await this.run(async () => {
      await this.api.setStaffActive(member.id, true);
      await this.loadWorkspace();
    });
  }

  protected cancelStaffEdit(): void {
    this.editingStaffId = '';
    this.staffForm = { branchId: '', name: '', email: '' };
  }

  protected async selectScheduleStaff(staffId: string): Promise<void> {
    this.scheduleStaffId = staffId;
    if (!staffId) {
      this.scheduleDays = this.emptyWeek();
      this.scheduleExceptions = [];
      return;
    }
    await this.run(async () => {
      const [schedule, exceptions] = await Promise.all([
        this.api.staffSchedule(staffId),
        this.api.staffScheduleExceptions(staffId),
      ]);
      const savedDays = new Map(schedule.days.map((day) => [day.dayOfWeek, day.shifts]));
      this.scheduleDays = this.emptyWeek().map((day) => ({ ...day, shifts: savedDays.get(day.dayOfWeek) ?? [] }));
      this.scheduleExceptions = exceptions;
    });
  }

  protected async saveSchedule(): Promise<void> {
    if (!this.scheduleStaffId) return;
    await this.run(async () => {
      const schedule = await this.api.saveStaffSchedule(this.scheduleStaffId, { days: this.scheduleDays });
      const savedDays = new Map(schedule.days.map((day) => [day.dayOfWeek, day.shifts]));
      this.scheduleDays = this.emptyWeek().map((day) => ({ ...day, shifts: savedDays.get(day.dayOfWeek) ?? [] }));
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
    await this.run(async () => {
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
    await this.run(async () => {
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

  protected get selectedScheduleStaff(): StaffMember | undefined {
    return this.staff.find((member) => member.id === this.scheduleStaffId && member.branchId === this.selectedBranchId);
  }

  protected get exceptionShifts(): WorkShift[] {
    return this.exceptionForm.isDayOff ? [] : [{ startTime: this.exceptionForm.startTime, endTime: this.exceptionForm.endTime }];
  }

  protected async createRoom(): Promise<void> {
    await this.run(async () => {
      if (this.editingRoomId) await this.api.updateRoom(this.editingRoomId, this.roomForm);
      else await this.api.createRoom(this.roomForm);
      this.roomForm = { branchId: '', name: '' };
      this.editingRoomId = '';
      this.roomFormDialogOpen = false;
      this.roomCreateOpen = false;
      await this.loadWorkspace();
      await this.reloadRoomAppointments();
    });
  }

  protected openRoomCreate(): void {
    this.cancelRoomEdit();
    this.roomForm.branchId = this.selectedBranchId;
    this.roomFormDialogOpen = true;
  }

  protected editRoom(room: Room): void {
    this.editingRoomId = room.id;
    this.roomForm = { branchId: room.branchId, name: room.name };
    this.roomFormDialogOpen = true;
  }

  protected closeRoomForm(): void {
    this.roomFormDialogOpen = false;
    this.cancelRoomEdit();
  }

  protected cancelRoomDelete(): void {
    this.roomDeleteTarget = null;
  }

  protected async confirmDeactivateRoom(): Promise<void> {
    const room = this.roomDeleteTarget;
    if (!room) return;
    await this.run(async () => {
      await this.api.deactivateRoom(room.id);
      this.roomDeleteTarget = null;
      await this.loadWorkspace();
      await this.reloadRoomAppointments();
    });
  }

  protected cancelRoomEdit(): void {
    this.editingRoomId = '';
    this.roomForm = { branchId: '', name: '' };
  }

  protected async createCustomer(): Promise<void> {
    await this.run(async () => {
      if (this.editingCustomerId) await this.api.updateCustomer(this.editingCustomerId, this.customerForm);
      else await this.api.createCustomer(this.customerForm);
      this.customerForm = { name: '', email: '', phone: '', notes: '', type: 'ลูกค้าใหม่' };
      this.editingCustomerId = '';
      await this.loadWorkspace();
      this.customerCreateOpen = false;
    });
  }

  protected editCustomer(customer: Customer): void {
    this.errorMessage = '';
    this.editingCustomerId = customer.id;
    this.customerForm = {
      name: customer.name,
      email: customer.email ?? '',
      phone: customer.phone ?? '',
      notes: customer.notes ?? '',
      type: customer.type ?? 'ทั่วไป',
    };
    this.customerCreateOpen = true;
  }

  protected openCustomerCreate(): void {
    this.errorMessage = '';
    this.editingCustomerId = '';
    this.customerForm = { name: '', email: '', phone: '', notes: '', type: 'ลูกค้าใหม่' };
    this.customerCreateOpen = true;
  }

  protected closeCustomerForm(): void {
    this.customerCreateOpen = false;
    this.editingCustomerId = '';
    this.customerForm = { name: '', email: '', phone: '', notes: '', type: 'ลูกค้าใหม่' };
    this.errorMessage = '';
  }

  protected openCustomerDeleteConfirm(customer: Customer): void {
    this.errorMessage = '';
    this.customerDeleteTarget = customer;
  }

  protected cancelCustomerDelete(): void {
    if (!this.busy) this.customerDeleteTarget = null;
  }

  protected async confirmDeleteCustomer(): Promise<void> {
    const customer = this.customerDeleteTarget;
    if (!customer) return;
    const error = await this.run(async () => {
      await this.api.deleteCustomer(customer.id);
      await this.loadWorkspace();
    });
    if (error === null) this.customerDeleteTarget = null;
  }

  protected cancelCustomerEdit(): void {
    this.closeCustomerForm();
  }

  protected branchName(branchId: string): string {
    return this.branches.find((branch) => branch.id === branchId)?.name ?? 'ไม่พบสาขา';
  }

  protected serviceName(serviceId: string): string {
    return this.services.find((service) => service.id === serviceId)?.name ?? 'ไม่พบบริการ';
  }

  protected staffName(staffId: string): string {
    return this.staff.find((member) => member.id === staffId)?.name ?? 'ไม่พบหมอนวด';
  }

  protected customerName(customerId: string): string {
    return this.customers.find((customer) => customer.id === customerId)?.name ?? 'ไม่พบลูกค้า';
  }

  protected customerAppointmentCount(customerId: string): number {
    return this.selectedAppointments.filter((appointment) => appointment.customerId === customerId).length;
  }

  protected customerInitial(name: string): string {
    return name.trim().slice(0, 1) || 'ล';
  }

  protected roomName(roomId: string): string {
    return this.rooms.find((room) => room.id === roomId)?.name ?? 'ไม่พบห้อง';
  }

  protected timeLabel(value: string): string {
    return new Intl.DateTimeFormat('th-TH', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));
  }

  protected statusLabel(status: Appointment['status']): string {
    return status === 'Scheduled' ? 'นัดหมายแล้ว'
      : status === 'InProgress' ? 'กำลังให้บริการ'
        : status === 'Completed' ? 'เสร็จสิ้น' : 'ยกเลิก';
  }

  private async loadWorkspace(): Promise<void> {
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
    this.customerSearchResults = [];
    this.customerSearchSequence += 1;
    this.posCustomerId = '';
    this.lastPosSale = null;
    const activeBranches = this.branches.filter((branch) => branch.isActive);
    const savedBranchId = sessionStorage.getItem('massage.branchId');
    const hasSavedBranch = activeBranches.some((branch) => branch.id === savedBranchId);
    const branchId = hasSavedBranch ? savedBranchId! : activeBranches[0]?.id ?? '';
    this.selectedBranchId = branchId;
    this.pendingBranchId = branchId;
    this.branchSelectionRequired = activeBranches.length > 1 && !hasSavedBranch;
    this.branchDialogOpen = this.branchSelectionRequired;
    if (activeBranches.length === 1) sessionStorage.setItem('massage.branchId', branchId);
    this.appointmentForm.branchId = branchId;
    this.posBranchId = branchId;
    this.staffForm.branchId = branchId;
    this.roomForm.branchId = branchId;
    this.appointmentForm.serviceId = this.services.find((service) => service.isActive)?.id ?? '';
    this.appointmentForm.staffId = this.staff.find((member) => member.isActive && member.branchId === branchId)?.id ?? '';
    this.appointmentForm.roomId = this.rooms.find((room) => room.isActive && room.branchId === branchId)?.id ?? '';
    this.posStaffId = this.staff.find((member) => member.isActive && member.branchId === branchId)?.id ?? '';
    this.posRoomId = this.rooms.find((room) => room.isActive && room.branchId === branchId)?.id ?? '';
    this.appointmentForm.customerId = this.customers[0]?.id ?? '';
    const day = new Date(`${this.selectedDate}T00:00:00`);
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);
    await this.reloadAppointments(day, nextDay, this.appointmentBranchFilter());
    this.posSales = [];
    this.demoDataStatus = this.currentUserRole === 'Owner' || this.currentUserRole === 'Manager'
      ? await this.api.demoDataStatus()
      : null;
  }

  private async reloadAppointments(from: Date, to: Date, branchId?: string): Promise<void> {
    this.appointments = await this.api.appointments(from.toISOString(), to.toISOString(), branchId);
  }

  private async reloadBookingAppointments(): Promise<void> {
    this.bookingAppointments = await this.api.appointments(
      this.bookingRangeStart.toISOString(),
      this.bookingRangeEnd.toISOString(),
      this.selectedBranchId,
    );
  }

  private async reloadRoomAppointments(): Promise<void> {
    const day = new Date(`${this.roomBoardDate}T00:00:00`);
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);
    this.roomAppointments = await this.api.appointments(day.toISOString(), nextDay.toISOString(), this.selectedBranchId);
  }

  private appointmentBranchFilter(): string | undefined {
    if (this.activeSection === 'overview') return this.dashboardBranchId === 'all' ? undefined : this.dashboardBranchId;
    return this.selectedBranchId || undefined;
  }

  private async loadAppointmentsForCurrentView(): Promise<void> {
    const day = new Date(`${this.selectedDate}T00:00:00`);
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);
    await this.reloadAppointments(day, nextDay, this.appointmentBranchFilter());
  }

  private syncSectionFromRoute(refresh = true): void {
    const section = this.router.routerState.snapshot.root.firstChild?.data['section'];
    if (!this.isSection(section) || section === this.activeSection) return;
    this.activeSection = section;
    this.errorMessage = '';
    if (refresh) this.refreshSectionData(section);
  }

  private isSection(value: unknown): value is Section {
    return typeof value === 'string' && this.sections.some((section) => section.id === value);
  }

  private refreshSectionData(section: Section): void {
    if (!this.api.hasSession) return;
    if (section === 'overview' || section === 'appointments') void this.loadAppointments();
    if (section === 'booking') void this.loadBookingAppointments();
    if (section === 'orders') void this.loadOrders();
    if (section === 'rooms') void this.loadRoomAppointments();
    if (section === 'pos') void this.loadPosSales();
    if (section === 'users') void this.loadUsers();
  }

  private async loadUsers(): Promise<void> {
    if (!this.canManage) {
      this.users = [];
      return;
    }
    await this.run(async () => {
      this.users = await this.api.users();
    });
  }

  private async run(action: () => Promise<void>): Promise<unknown | null> {
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
      this.changeDetector.markForCheck();
    }
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

  private localDateValue(date: Date): string {
    const offset = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - offset).toISOString().slice(0, 10);
  }

  private emptyWeek(): StaffScheduleDay[] {
    return Array.from({ length: 7 }, (_, index) => ({ dayOfWeek: index + 1, shifts: [] }));
  }
}
