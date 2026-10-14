import { provideRouter, Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { routes } from './app.routes';
import { MassageApi } from './core/massage-api';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), { provide: MassageApi, useValue: { hasSession: false } }],
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should request tenant login before showing store data', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('เข้าสู่ระบบร้าน');
    expect(compiled.textContent).toContain('รหัสร้าน (Tenant)');
  });

  it('recognizes direct URLs for the management menus', async () => {
    const router = TestBed.inject(Router);
    for (const menu of ['pos', 'booking', 'rooms', 'appointments', 'services', 'team', 'customers', 'branches', 'users']) {
      await router.navigateByUrl(`/${menu}`);
      expect(router.url).toBe(`/${menu}`);
    }
  });
});
