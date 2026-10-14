export interface Branch {
  id: string;
  name: string;
  address: string | null;
  timeZone: string;
  isActive: boolean;
}

export interface MassageService {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  isActive: boolean;
}

export interface StaffMember {
  id: string;
  branchId: string;
  name: string;
  email: string | null;
  isActive: boolean;
}

export type CustomerType = 'VIP' | 'สมาชิก' | 'ลูกค้าใหม่' | 'ทั่วไป';

export interface Customer {
  id: string;
  name: string;
  type: CustomerType;
  email: string | null;
  phone: string | null;
  notes: string | null;
}

export interface Room {
  id: string;
  branchId: string;
  name: string;
  isActive: boolean;
}

export interface Appointment {
  id: string;
  branchId: string;
  serviceId: string;
  staffId: string;
  customerId: string;
  roomId: string;
  startsAt: string;
  endsAt: string;
  status: 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled';
  paidSaleId: string | null;
  notes: string | null;
}

export interface SaleItem {
  id: string;
  serviceId: string | null;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Sale {
  id: string;
  saleNumber: string;
  branchId: string;
  customerId: string | null;
  staffId: string | null;
  roomId: string | null;
  paymentMethod: 'Cash' | 'BankTransfer' | 'Card';
  status: 'Paid';
  subtotal: number;
  discount: number;
  total: number;
  createdAt: string;
  items: SaleItem[];
}

export interface DemoDataStatus {
  enabled: boolean;
  seeded: boolean;
}

export interface DemoDataSeedResult {
  created: boolean;
  message: string;
  branches: number;
  services: number;
  staff: number;
  rooms: number;
  customers: number;
  appointments: number;
  sales: number;
}

export interface CurrentUser {
  id: string;
  email: string;
  role: string;
}

export interface TenantUser {
  id: string;
  email: string;
  role: 'Owner' | 'Manager' | 'Staff';
  isActive: boolean;
}

export interface WorkShift {
  startTime: string;
  endTime: string;
}

export interface StaffScheduleDay {
  dayOfWeek: number;
  shifts: WorkShift[];
}

export interface StaffSchedule {
  days: StaffScheduleDay[];
}

export interface StaffScheduleException {
  id: string;
  date: string;
  isDayOff: boolean;
  shifts: WorkShift[];
}
