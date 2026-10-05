import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  Appointment,
  Branch,
  CurrentUser,
  Customer,
  DemoDataSeedResult,
  DemoDataStatus,
  MassageService,
  Room,
  Sale,
  StaffMember,
  StaffSchedule,
  StaffScheduleException,
  TenantUser,
  WorkShift,
} from './models';

@Injectable({ providedIn: 'root' })
export class MassageApi {
  private readonly tenantKey = 'massage.tenant';
  private readonly tokenKey = 'massage.accessToken';

  constructor(private readonly http: HttpClient) {}

  get tenant(): string {
    return sessionStorage.getItem(this.tenantKey) ?? '';
  }

  get hasSession(): boolean {
    return !!this.tenant && !!sessionStorage.getItem(this.tokenKey);
  }

  async login(tenant: string, email: string, password: string): Promise<void> {
    const normalizedTenant = tenant.trim().toLowerCase();
    const response = await firstValueFrom(
      this.http.post<{ accessToken: string }>('/api/auth/login', { email, password }, {
        headers: new HttpHeaders({ 'X-Tenant': normalizedTenant }),
      }),
    );
    sessionStorage.setItem(this.tenantKey, normalizedTenant);
    sessionStorage.setItem(this.tokenKey, response.accessToken);
  }

  logout(): void {
    sessionStorage.removeItem(this.tenantKey);
    sessionStorage.removeItem(this.tokenKey);
  }

  currentUser(): Promise<CurrentUser> {
    return firstValueFrom(this.http.get<CurrentUser>('/api/auth/me', this.options()));
  }

  users(): Promise<TenantUser[]> {
    return firstValueFrom(this.http.get<TenantUser[]>('/api/users', this.options()));
  }

  createUser(value: { email: string; password: string; role: 'Manager' | 'Staff' }): Promise<TenantUser> {
    return firstValueFrom(this.http.post<TenantUser>('/api/users', value, this.options()));
  }

  setUserActive(id: string, isActive: boolean): Promise<void> {
    return firstValueFrom(this.http.patch<void>(`/api/users/${id}/active`, { isActive }, this.options()));
  }

  branches(): Promise<Branch[]> { return firstValueFrom(this.http.get<Branch[]>('/api/branches', this.options())); }
  services(): Promise<MassageService[]> { return firstValueFrom(this.http.get<MassageService[]>('/api/services', this.options())); }
  staff(): Promise<StaffMember[]> { return firstValueFrom(this.http.get<StaffMember[]>('/api/staff', this.options())); }
  rooms(): Promise<Room[]> { return firstValueFrom(this.http.get<Room[]>('/api/rooms', this.options())); }
  customers(search?: string): Promise<Customer[]> {
    return firstValueFrom(this.http.get<Customer[]>('/api/customers', {
      ...this.options(),
      ...(search ? { params: { search } } : {}),
    }));
  }
  appointments(from: string, to: string, branchId?: string): Promise<Appointment[]> {
    return firstValueFrom(this.http.get<Appointment[]>('/api/appointments', {
      ...this.options(),
      params: { from, to, ...(branchId ? { branchId } : {}) },
    }));
  }
  sales(from: string, to: string, branchId?: string): Promise<Sale[]> {
    return firstValueFrom(this.http.get<Sale[]>('/api/sales', {
      ...this.options(),
      params: { from, to, ...(branchId ? { branchId } : {}) },
    }));
  }

  createSale(value: {
    branchId: string;
    customerId: string | null;
    staffId: string | null;
    roomId: string | null;
    paymentMethod: Sale['paymentMethod'];
    items: { serviceId: string; quantity: number }[];
    appointmentId?: string;
  }): Promise<Sale> {
    return firstValueFrom(this.http.post<Sale>('/api/sales', value, this.options()));
  }

  demoDataStatus(): Promise<DemoDataStatus> {
    return firstValueFrom(this.http.get<DemoDataStatus>('/api/demo-data/status', this.options()));
  }

  seedDemoData(): Promise<DemoDataSeedResult> {
    return firstValueFrom(this.http.post<DemoDataSeedResult>('/api/demo-data', {}, this.options()));
  }

  createBranch(value: { name: string; address: string; timeZone: string }): Promise<Branch> {
    return firstValueFrom(this.http.post<Branch>('/api/branches', value, this.options()));
  }

  updateBranch(id: string, value: { name: string; address: string; timeZone: string }): Promise<Branch> {
    return firstValueFrom(this.http.put<Branch>(`/api/branches/${id}`, value, this.options()));
  }

  deleteBranch(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`/api/branches/${id}`, this.options()));
  }

  createService(value: { name: string; durationMinutes: number; price: number }): Promise<MassageService> {
    return firstValueFrom(this.http.post<MassageService>('/api/services', value, this.options()));
  }

  updateService(id: string, value: { name: string; durationMinutes: number; price: number }): Promise<MassageService> {
    return firstValueFrom(this.http.put<MassageService>(`/api/services/${id}`, value, this.options()));
  }

  deleteService(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`/api/services/${id}`, this.options()));
  }

  createStaff(value: { branchId: string; name: string; email: string }): Promise<StaffMember> {
    return firstValueFrom(this.http.post<StaffMember>('/api/staff', value, this.options()));
  }

  updateStaff(id: string, value: { branchId: string; name: string; email: string }): Promise<StaffMember> {
    return firstValueFrom(this.http.put<StaffMember>(`/api/staff/${id}`, value, this.options()));
  }

  deactivateStaff(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`/api/staff/${id}`, this.options()));
  }

  createRoom(value: { branchId: string; name: string }): Promise<Room> {
    return firstValueFrom(this.http.post<Room>('/api/rooms', value, this.options()));
  }

  updateRoom(id: string, value: { branchId: string; name: string }): Promise<Room> {
    return firstValueFrom(this.http.put<Room>(`/api/rooms/${id}`, value, this.options()));
  }

  deactivateRoom(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`/api/rooms/${id}`, this.options()));
  }

  createCustomer(value: { name: string; email: string; phone: string; notes: string }): Promise<Customer> {
    return firstValueFrom(this.http.post<Customer>('/api/customers', value, this.options()));
  }

  updateCustomer(id: string, value: { name: string; email: string; phone: string; notes: string }): Promise<Customer> {
    return firstValueFrom(this.http.put<Customer>(`/api/customers/${id}`, value, this.options()));
  }

  deleteCustomer(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`/api/customers/${id}`, this.options()));
  }

  createAppointment(value: {
    branchId: string;
    serviceId: string;
    staffId: string;
    customerId: string;
    roomId: string;
    startsAt: string;
    notes: string;
  }): Promise<Appointment> {
    return firstValueFrom(this.http.post<Appointment>('/api/appointments', value, this.options()));
  }

  updateAppointment(id: string, value: {
    branchId: string;
    serviceId: string;
    staffId: string;
    customerId: string;
    roomId: string;
    startsAt: string;
    notes: string;
  }): Promise<Appointment> {
    return firstValueFrom(this.http.put<Appointment>(`/api/appointments/${id}`, value, this.options()));
  }

  setAppointmentStatus(id: string, status: Appointment['status']): Promise<Appointment> {
    return firstValueFrom(this.http.patch<Appointment>(`/api/appointments/${id}/status`, { status }, this.options()));
  }

  staffSchedule(staffId: string): Promise<StaffSchedule> {
    return firstValueFrom(this.http.get<StaffSchedule>(`/api/staff/${staffId}/schedule`, this.options()));
  }

  saveStaffSchedule(staffId: string, schedule: StaffSchedule): Promise<StaffSchedule> {
    return firstValueFrom(this.http.put<StaffSchedule>(`/api/staff/${staffId}/schedule`, schedule, this.options()));
  }

  staffScheduleExceptions(staffId: string): Promise<StaffScheduleException[]> {
    return firstValueFrom(this.http.get<StaffScheduleException[]>(`/api/staff/${staffId}/schedule/exceptions`, this.options()));
  }

  createStaffScheduleException(
    staffId: string,
    exception: { date: string; isDayOff: boolean; shifts: WorkShift[] },
  ): Promise<StaffScheduleException> {
    return firstValueFrom(this.http.post<StaffScheduleException>(`/api/staff/${staffId}/schedule/exceptions`, exception, this.options()));
  }

  deleteStaffScheduleException(staffId: string, exceptionId: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`/api/staff/${staffId}/schedule/exceptions/${exceptionId}`, this.options()));
  }

  private options(): { headers: HttpHeaders } {
    const tenant = this.tenant;
    const token = sessionStorage.getItem(this.tokenKey);
    if (!tenant || !token) {
      throw new Error('กรุณาเข้าสู่ระบบร้านก่อนใช้งาน');
    }
    return {
      headers: new HttpHeaders({
        'X-Tenant': tenant,
        Authorization: `Bearer ${token}`,
      }),
    };
  }
}
