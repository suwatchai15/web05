import { TestBed } from '@angular/core/testing';
import { MassageApi } from './massage-api';
import { WorkspaceStore } from './workspace.store';

describe('WorkspaceStore', () => {
  let api: Record<string, ReturnType<typeof vi.fn>>;
  let store: WorkspaceStore;

  beforeEach(() => {
    sessionStorage.clear();
    api = {
      branches: vi.fn().mockResolvedValue([{ id: 'branch', name: 'สาขา', address: null, timeZone: 'Asia/Bangkok', isActive: true }]),
      services: vi.fn().mockResolvedValue([]),
      staff: vi.fn().mockResolvedValue([]),
      rooms: vi.fn().mockResolvedValue([]),
      customers: vi.fn().mockResolvedValue([]),
      appointments: vi.fn().mockResolvedValue([]),
    };
    TestBed.configureTestingModule({ providers: [{ provide: MassageApi, useValue: api }] });
    store = TestBed.inject(WorkspaceStore);
    store.activeSection = 'appointments';
  });

  it('skips the first page-entry appointments fetch right after loading the workspace', async () => {
    await store.loadWorkspace();
    await store.loadAppointmentsOnEnter();
    expect(api['appointments']).toHaveBeenCalledTimes(1);
    await store.loadAppointmentsOnEnter();
    expect(api['appointments']).toHaveBeenCalledTimes(2);
  });

  it('refetches on page entry when the date changed after the workspace loaded', async () => {
    await store.loadWorkspace();
    store.selectedDate = '2026-01-01';
    await store.loadAppointmentsOnEnter();
    expect(api['appointments']).toHaveBeenCalledTimes(2);
  });

  it('reloads only the edited reference list', async () => {
    await store.reloadRooms();
    expect(api['rooms']).toHaveBeenCalledTimes(1);
    expect(api['branches']).not.toHaveBeenCalled();
    expect(api['appointments']).not.toHaveBeenCalled();
  });
});
