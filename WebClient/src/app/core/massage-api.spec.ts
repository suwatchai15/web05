import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MassageApi } from './massage-api';

describe('MassageApi', () => {
  let api: MassageApi;
  let http: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [MassageApi, provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(MassageApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends tenant slug when logging in and stores the returned token', async () => {
    const login = api.login('  baan-sabai ', 'owner@example.com', 'correct-horse-battery');
    const request = http.expectOne('/api/auth/login');
    expect(request.request.headers.get('X-Tenant')).toBe('baan-sabai');
    expect(request.request.body).toEqual({ email: 'owner@example.com', password: 'correct-horse-battery' });
    request.flush({ accessToken: 'tenant-token' });
    await login;
    expect(api.tenant).toBe('baan-sabai');
    expect(api.hasSession).toBe(true);
  });

  it('sends tenant and bearer credentials when creating an appointment', async () => {
    sessionStorage.setItem('massage.tenant', 'baan-sabai');
    sessionStorage.setItem('massage.accessToken', 'tenant-token');
    const appointment = {
      branchId: 'branch',
      serviceId: 'service',
      staffId: 'staff',
      customerId: 'customer',
      roomId: 'room',
      startsAt: '2026-10-02T03:00:00.000Z',
      notes: '',
    };
    const create = api.createAppointment(appointment);
    const request = http.expectOne('/api/appointments');
    expect(request.request.headers.get('X-Tenant')).toBe('baan-sabai');
    expect(request.request.headers.get('Authorization')).toBe('Bearer tenant-token');
    expect(request.request.body).toEqual(appointment);
    request.flush({ id: 'appointment', ...appointment, endsAt: '2026-10-02T04:00:00.000Z', status: 'Scheduled', paidSaleId: null });
    await create;
  });

  it('filters appointment and sales lists by branch when requested', async () => {
    sessionStorage.setItem('massage.tenant', 'baan-sabai');
    sessionStorage.setItem('massage.accessToken', 'tenant-token');

    const appointments = api.appointments('2026-10-02T00:00:00.000Z', '2026-10-03T00:00:00.000Z', 'branch-id');
    const appointmentRequest = http.expectOne((request) =>
      request.url === '/api/appointments' && request.params.get('branchId') === 'branch-id',
    );
    appointmentRequest.flush([]);
    await expect(appointments).resolves.toEqual([]);

    const sales = api.sales('2026-10-02T00:00:00.000Z', '2026-10-03T00:00:00.000Z', 'branch-id');
    const salesRequest = http.expectOne((request) =>
      request.url === '/api/sales' && request.params.get('branchId') === 'branch-id',
    );
    salesRequest.flush([]);
    await expect(sales).resolves.toEqual([]);
  });

  it('reads and replaces a therapist weekly schedule', async () => {
    sessionStorage.setItem('massage.tenant', 'baan-sabai');
    sessionStorage.setItem('massage.accessToken', 'tenant-token');
    const schedule = {
      days: [
        { dayOfWeek: 1, shifts: [{ startTime: '09:00', endTime: '12:00' }, { startTime: '13:00', endTime: '18:00' }] },
        { dayOfWeek: 2, shifts: [] },
      ],
    };
    const read = api.staffSchedule('staff-id');
    const readRequest = http.expectOne('/api/staff/staff-id/schedule');
    expect(readRequest.request.headers.get('X-Tenant')).toBe('baan-sabai');
    readRequest.flush(schedule);
    await expect(read).resolves.toEqual(schedule);

    const save = api.saveStaffSchedule('staff-id', schedule);
    const saveRequest = http.expectOne('/api/staff/staff-id/schedule');
    expect(saveRequest.request.method).toBe('PUT');
    expect(saveRequest.request.body).toEqual(schedule);
    saveRequest.flush(schedule);
    await expect(save).resolves.toEqual(schedule);
  });

  it('creates a day-off exception and deletes it using tenant authorization', async () => {
    sessionStorage.setItem('massage.tenant', 'baan-sabai');
    sessionStorage.setItem('massage.accessToken', 'tenant-token');
    const create = api.createStaffScheduleException('staff-id', {
      date: '2026-10-05',
      isDayOff: true,
      shifts: [],
    });
    const createRequest = http.expectOne('/api/staff/staff-id/schedule/exceptions');
    expect(createRequest.request.method).toBe('POST');
    expect(createRequest.request.headers.get('Authorization')).toBe('Bearer tenant-token');
    const exception = { id: 'exception-id', date: '2026-10-05', isDayOff: true, shifts: [] };
    createRequest.flush(exception);
    await expect(create).resolves.toEqual(exception);

    const remove = api.deleteStaffScheduleException('staff-id', exception.id);
    const deleteRequest = http.expectOne('/api/staff/staff-id/schedule/exceptions/exception-id');
    expect(deleteRequest.request.method).toBe('DELETE');
    deleteRequest.flush(null);
    await expect(remove).resolves.toBeNull();
  });

  it('uses tenant-authorized API routes to search, update, and delete shop records', async () => {
    sessionStorage.setItem('massage.tenant', 'baan-sabai');
    sessionStorage.setItem('massage.accessToken', 'tenant-token');

    const search = api.customers('สมใจ');
    const searchRequest = http.expectOne((request) =>
      request.url === '/api/customers' && request.params.get('search') === 'สมใจ',
    );
    expect(searchRequest.request.headers.get('X-Tenant')).toBe('baan-sabai');
    searchRequest.flush([]);
    await expect(search).resolves.toEqual([]);

    const serviceRequest = { name: 'นวดไทย', durationMinutes: 60, price: 500 };
    const service = { id: 'service-id', ...serviceRequest, isActive: true };
    const update = api.updateService(service.id, serviceRequest);
    const updateRequest = http.expectOne('/api/services/service-id');
    expect(updateRequest.request.method).toBe('PUT');
    expect(updateRequest.request.body).toEqual(serviceRequest);
    updateRequest.flush(service);
    await expect(update).resolves.toEqual(service);

    const remove = api.deactivateRoom('room-id');
    const deleteRequest = http.expectOne('/api/rooms/room-id');
    expect(deleteRequest.request.method).toBe('DELETE');
    deleteRequest.flush(null);
    await expect(remove).resolves.toBeNull();
  });

  it('creates shop users and changes their active state through the users API', async () => {
    sessionStorage.setItem('massage.tenant', 'baan-sabai');
    sessionStorage.setItem('massage.accessToken', 'tenant-token');
    const create = api.createUser({
      email: 'staff@example.test',
      password: 'a-long-demo-password',
      role: 'Staff',
    });

    const createRequest = http.expectOne('/api/users');
    expect(createRequest.request.method).toBe('POST');
    createRequest.flush({ id: 'user-id', email: 'staff@example.test', role: 'Staff', isActive: true });
    await create;

    const setActive = api.setUserActive('user-id', false);
    const patchRequest = http.expectOne('/api/users/user-id/active');
    expect(patchRequest.request.method).toBe('PATCH');
    expect(patchRequest.request.body).toEqual({ isActive: false });
    patchRequest.flush(null);
    await expect(setActive).resolves.toBeNull();
  });

  it('links a POS sale to a booking when an appointment id is supplied', async () => {
    sessionStorage.setItem('massage.tenant', 'baan-sabai');
    sessionStorage.setItem('massage.accessToken', 'tenant-token');
    const saleRequest = {
      branchId: 'branch-id',
      customerId: 'customer-id',
      staffId: 'staff-id',
      roomId: 'room-id',
      paymentMethod: 'Cash' as const,
      items: [{ serviceId: 'service-id', quantity: 1 }],
      appointmentId: 'appointment-id',
    };
    const create = api.createSale(saleRequest);
    const request = http.expectOne('/api/sales');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(saleRequest);
    request.flush({
      id: 'sale-id',
      saleNumber: 'S-1',
      ...saleRequest,
      status: 'Paid',
      subtotal: 500,
      discount: 0,
      total: 500,
      createdAt: '2026-10-05T04:00:00Z',
      items: [],
    });
    await create;
  });
});
