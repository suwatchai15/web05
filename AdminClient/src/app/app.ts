import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PlatformApi, Tenant } from './platform-api';

type AdminView =
  | 'dashboard'
  | 'organizations'
  | 'users'
  | 'roles'
  | 'permissions'
  | 'servicePricing'
  | 'packages'
  | 'memberships'
  | 'commissionRules';

const featureViews: Record<
  Exclude<AdminView, 'dashboard' | 'organizations'>,
  { group: string; title: string; description: string }
> = {
  users: {
    group: 'Users & Access',
    title: 'Users',
    description: 'จัดการบัญชีผู้ใช้งานระดับแพลตฟอร์มและบัญชีของแต่ละองค์กร',
  },
  roles: {
    group: 'Users & Access',
    title: 'Roles',
    description: 'กำหนดบทบาทผู้ใช้งานและขอบเขตการเข้าถึงในแต่ละองค์กร',
  },
  permissions: {
    group: 'Users & Access',
    title: 'Permissions',
    description: 'กำหนดสิทธิ์การเข้าถึงเมนูและการดำเนินการของระบบ',
  },
  servicePricing: {
    group: 'Pricing & Packages',
    title: 'Service Pricing',
    description: 'จัดการราคาบริการและกฎราคาตามองค์กรหรือสาขา',
  },
  packages: {
    group: 'Pricing & Packages',
    title: 'Packages',
    description: 'สร้างและจัดการแพ็กเกจบริการสำหรับร้านสมาชิก',
  },
  memberships: {
    group: 'Pricing & Packages',
    title: 'Memberships',
    description: 'จัดการระดับสมาชิกและสิทธิประโยชน์ของลูกค้า',
  },
  commissionRules: {
    group: 'Pricing & Packages',
    title: 'Commission Rules',
    description: 'กำหนดกฎค่าคอมมิชชันสำหรับบริการและพนักงาน',
  },
};

@Component({
  imports: [FormsModule],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App implements OnInit {
  protected activeView: AdminView = 'dashboard';
  protected usersAccessExpanded = false;
  protected pricingExpanded = false;
  protected isAuthenticated = false;
  protected busy = false;
  protected errorMessage = '';
  protected successMessage = '';
  protected tenants: Tenant[] = [];
  protected tenantSearch = '';
  protected tenantFilter: 'all' | 'active' | 'suspended' = 'all';
  protected loginForm = { username: '', password: '' };
  protected tenantForm = { name: '', slug: '', ownerEmail: '', ownerPassword: '' };

  constructor(private readonly api: PlatformApi) {}

  protected get activeFeature(): { group: string; title: string; description: string } | null {
    return this.activeView === 'dashboard' || this.activeView === 'organizations'
      ? null
      : featureViews[this.activeView];
  }

  protected selectView(view: AdminView): void {
    this.activeView = view;
    this.errorMessage = '';
    this.successMessage = '';
    this.usersAccessExpanded = view === 'users' || view === 'roles' || view === 'permissions';
    this.pricingExpanded =
      view === 'servicePricing' ||
      view === 'packages' ||
      view === 'memberships' ||
      view === 'commissionRules';
  }

  protected get todayLabel(): string {
    return new Intl.DateTimeFormat('th-TH', {
      day: 'numeric',
      month: 'long',
      weekday: 'long',
      year: 'numeric',
    }).format(new Date());
  }

  protected get activeTenantCount(): number {
    return this.tenants.filter((tenant) => tenant.isActive).length;
  }

  protected get suspendedTenantCount(): number {
    return this.tenants.length - this.activeTenantCount;
  }

  protected get filteredTenants(): Tenant[] {
    const query = this.tenantSearch.trim().toLocaleLowerCase();
    return this.tenants.filter((tenant) => {
      const matchesStatus =
        this.tenantFilter === 'all' ||
        (this.tenantFilter === 'active' && tenant.isActive) ||
        (this.tenantFilter === 'suspended' && !tenant.isActive);
      const matchesSearch =
        !query ||
        tenant.name.toLocaleLowerCase().includes(query) ||
        tenant.slug.toLocaleLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }

  async ngOnInit(): Promise<void> {
    if (this.api.hasSession) {
      this.isAuthenticated = true;
      await this.run(async () => {
        this.tenants = await this.api.tenants();
      });
    }
  }

  protected async login(): Promise<void> {
    await this.run(async () => {
      await this.api.login(this.loginForm.username, this.loginForm.password);
      this.isAuthenticated = true;
      this.tenants = await this.api.tenants();
    });
  }

  protected async createTenant(): Promise<void> {
    await this.run(async () => {
      await this.api.createTenant({
        ...this.tenantForm,
        slug: this.tenantForm.slug.trim().toLowerCase(),
        ownerEmail: this.tenantForm.ownerEmail.trim().toLowerCase(),
      });
      this.successMessage = `สร้างร้าน "${this.tenantForm.name}" และบัญชีเจ้าของร้านเรียบร้อย`;
      this.tenantForm = { name: '', slug: '', ownerEmail: '', ownerPassword: '' };
      this.tenants = await this.api.tenants();
    });
  }

  protected logout(): void {
    this.api.logout();
    this.isAuthenticated = false;
    this.tenants = [];
    this.tenantSearch = '';
    this.tenantFilter = 'all';
    this.activeView = 'dashboard';
    this.errorMessage = '';
    this.successMessage = '';
  }

  private async run(action: () => Promise<void>): Promise<void> {
    this.busy = true;
    this.errorMessage = '';
    this.successMessage = '';
    try {
      await action();
    } catch (error) {
      this.errorMessage = this.errorText(error);
    } finally {
      this.busy = false;
    }
  }

  private errorText(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const message = typeof error.error?.error === 'string' ? error.error.error : '';
      if (message) return message;
      if (error.status === 0) return 'เชื่อมต่อ API ไม่ได้ ตรวจสอบว่า API ทำงานอยู่ที่พอร์ต 5080';
      if (error.status === 401) return 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบชื่อผู้ใช้และรหัสผ่าน';
      if (error.status === 409) return 'มีรหัสร้านนี้ในระบบแล้ว กรุณาใช้รหัสร้านอื่น';
      return `คำขอไม่สำเร็จ (HTTP ${error.status})`;
    }
    return error instanceof Error ? error.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
  }
}
