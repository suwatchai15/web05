import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { PlatformApi } from './platform-api';

describe('App', () => {
  let tenantRecords: { id: string; name: string; slug: string; isActive: boolean }[];

  beforeEach(async () => {
    tenantRecords = [];
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        {
          provide: PlatformApi,
          useValue: {
            hasSession: false,
            login: async () => undefined,
            tenants: async () => tenantRecords,
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should require platform admin credentials before showing tenant controls', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('เข้าสู่ระบบผู้ดูแล');
    expect(compiled.textContent).toContain('ชื่อผู้ใช้');
  });

  it('should search tenants by name and filter them by active status', async () => {
    tenantRecords = [
      { id: '1', name: 'บ้านสบาย', slug: 'baan-sabai', isActive: true },
      { id: '2', name: 'สปาร่มเย็น', slug: 'spa-romyen', isActive: false },
      { id: '3', name: 'สบายดี', slug: 'sabai-dee', isActive: true },
    ];

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const username = root.querySelector<HTMLInputElement>('input[name="username"]')!;
    const password = root.querySelector<HTMLInputElement>('input[name="password"]')!;
    username.value = 'admin';
    username.dispatchEvent(new Event('input'));
    password.value = 'password';
    password.dispatchEvent(new Event('input'));
    root
      .querySelector<HTMLFormElement>('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    fixture.detectChanges();

    root.querySelectorAll<HTMLButtonElement>('.nav-item')[1].click();
    fixture.detectChanges();
    const search = root.querySelector<HTMLInputElement>('input[type="search"]')!;
    search.value = 'spa';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(root.querySelectorAll('.tenant-row')).toHaveLength(1);
    expect(root.querySelector('.tenant-row')?.textContent).toContain('สปาร่มเย็น');

    search.value = '';
    search.dispatchEvent(new Event('input'));
    root.querySelectorAll<HTMLButtonElement>('.tenant-filters button')[2].click();
    fixture.detectChanges();
    expect(root.querySelectorAll('.tenant-row')).toHaveLength(1);
    expect(root.querySelector('.tenant-row')?.textContent).toContain('สปาร่มเย็น');
  });

  it('should expose Users & Access and Pricing & Packages without implying unavailable features are active', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    root
      .querySelector<HTMLFormElement>('form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await fixture.whenStable();
    fixture.detectChanges();

    const groups = root.querySelectorAll<HTMLButtonElement>('.nav-group-toggle');
    expect(groups).toHaveLength(2);
    expect(groups[0].textContent).toContain('Users & Access');
    expect(groups[1].textContent).toContain('Pricing & Packages');

    groups[0].click();
    fixture.detectChanges();
    root.querySelector<HTMLButtonElement>('.nav-child')!.click();
    fixture.detectChanges();
    expect(root.querySelector('.feature-placeholder h2')?.textContent).toContain(
      'ยังไม่พร้อมใช้งาน',
    );
    expect(root.querySelector('.welcome h1')?.textContent).toContain('Users');
    expect(root.textContent).toContain('API ปัจจุบันยังไม่มีบริการ');

    groups[1].click();
    fixture.detectChanges();
    Array.from(root.querySelectorAll<HTMLButtonElement>('.nav-child'))
      .find((button) => button.textContent?.includes('Commission Rules'))!
      .click();
    fixture.detectChanges();
    expect(root.querySelector('.welcome h1')?.textContent).toContain('Commission Rules');
    expect(root.querySelector('.feature-placeholder')).toBeTruthy();
  });
});
