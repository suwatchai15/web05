import { TestBed } from '@angular/core/testing';
import { MassageApi } from '../../core/massage-api';
import { Appointment, MassageService } from '../../core/models';
import { PosSession } from '../../core/pos-session';
import { WorkspaceStore } from '../../core/workspace.store';
import { PosPage } from './pos.page';

const service: MassageService = { id: 'service', name: 'นวดไทย', durationMinutes: 60, price: 500, isActive: true };
const appointment: Appointment = {
  id: 'appt',
  branchId: 'branch-a',
  serviceId: 'service',
  staffId: 'staff',
  customerId: 'customer',
  roomId: 'room',
  startsAt: '2026-10-20T03:00:00+00:00',
  endsAt: '2026-10-20T04:00:00+00:00',
  status: 'InProgress',
  paidSaleId: null,
  notes: null,
};

describe('PosPage', () => {
  let api: Record<string, ReturnType<typeof vi.fn>>;
  let store: WorkspaceStore;
  let pos: PosSession;
  let page: any;

  beforeEach(async () => {
    api = {
      sales: vi.fn().mockResolvedValue([]),
      createSale: vi.fn().mockResolvedValue({ id: 'sale' }),
      appointments: vi.fn().mockResolvedValue([]),
    };
    TestBed.configureTestingModule({ imports: [PosPage], providers: [{ provide: MassageApi, useValue: api }] });
    store = TestBed.inject(WorkspaceStore);
    pos = TestBed.inject(PosSession);
    pos.reset();
    store.selectedBranchId = 'branch-a';
    store.services = [service];
    const fixture = TestBed.createComponent(PosPage);
    page = fixture.componentInstance;
    page.ngOnInit();
    await fixture.whenStable();
  });

  it('drops a pending appointment checkout when the branch changes', () => {
    pos.startCheckout(appointment, service);
    store.selectedBranchId = 'branch-b';
    store.branchChanged.next('branch-b');
    expect(pos.pendingAppointment).toBeNull();
    expect(pos.cart).toEqual([]);
  });

  it('drops the pending appointment when the cart is emptied', () => {
    pos.startCheckout(appointment, service);
    page.removePosService('service');
    expect(pos.pendingAppointment).toBeNull();
  });

  it('links the sale to the pending appointment of the same branch', async () => {
    pos.startCheckout(appointment, service);
    await page.submitPosSale();
    expect(api['createSale']).toHaveBeenCalledWith(expect.objectContaining({ branchId: 'branch-a', appointmentId: 'appt' }));
  });

  it('never links a sale to an appointment of another branch', async () => {
    pos.startCheckout(appointment, service);
    store.selectedBranchId = 'branch-b';
    await page.submitPosSale();
    expect(api['createSale'].mock.calls[0][0]).not.toHaveProperty('appointmentId');
  });
});
