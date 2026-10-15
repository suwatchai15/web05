import { ChangeDetectorRef, Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRouteSnapshot, ResolveEnd, Router, RouterOutlet } from '@angular/router';
import { ICON_PATHS, IconName } from './core/icons';
import { PosSession } from './core/pos-session';
import { Section, WorkspaceStore } from './core/workspace.store';

/** App shell: tenant login, navigation, branch picker; each menu is a routed page. */
@Component({
  imports: [FormsModule, RouterOutlet],
  selector: 'app-root',
  styleUrls: ['./app.scss', './workspace.scss'],
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
  protected readonly iconPaths = ICON_PATHS;
  protected loginForm = { tenant: '', email: '', password: '' };

  constructor(
    protected readonly store: WorkspaceStore,
    private readonly pos: PosSession,
    private readonly router: Router,
    changeDetector: ChangeDetectorRef,
    destroyRef: DestroyRef,
  ) {
    store.connectView(() => changeDetector.markForCheck());
    // Set the section before the page activates, so its initial loads use the right branch filter.
    router.events.pipe(takeUntilDestroyed(destroyRef)).subscribe((event) => {
      if (event instanceof ResolveEnd) this.setSection(this.routeSection(event.state.root));
    });
  }

  ngOnInit(): Promise<void> {
    return this.store.restoreSession();
  }

  protected get todayLabel(): string {
    return new Intl.DateTimeFormat('th-TH', {
      day: 'numeric',
      month: 'long',
      weekday: 'long',
      year: 'numeric',
    }).format(new Date());
  }

  protected get activeSectionLabel(): string {
    return this.sections.find((section) => section.id === this.store.activeSection)?.label ?? 'ภาพรวม';
  }

  protected selectSection(section: Section): void {
    this.store.errorMessage = '';
    void this.router.navigateByUrl(section === 'overview' ? '/' : `/${section}`);
  }

  protected login(): Promise<void> {
    return this.store.login(this.loginForm.tenant, this.loginForm.email, this.loginForm.password);
  }

  protected logout(): void {
    this.store.logout();
    this.pos.reset();
  }

  private setSection(section: Section | undefined): void {
    if (!section || section === this.store.activeSection) return;
    this.store.activeSection = section;
    this.store.errorMessage = '';
  }

  private routeSection(route: ActivatedRouteSnapshot): Section | undefined {
    while (route.firstChild) route = route.firstChild;
    const section: unknown = route.data['section'];
    return this.sections.some((item) => item.id === section) ? section as Section : undefined;
  }
}
