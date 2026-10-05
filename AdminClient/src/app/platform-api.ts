import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class PlatformApi {
  private readonly tokenKey = 'massage.platformAccessToken';

  constructor(private readonly http: HttpClient) {}

  get hasSession(): boolean {
    return !!sessionStorage.getItem(this.tokenKey);
  }

  async login(username: string, password: string): Promise<void> {
    const response = await firstValueFrom(
      this.http.post<{ accessToken: string }>('/api/platform/auth/login', { username, password }),
    );
    sessionStorage.setItem(this.tokenKey, response.accessToken);
  }

  logout(): void {
    sessionStorage.removeItem(this.tokenKey);
  }

  tenants(): Promise<Tenant[]> {
    return firstValueFrom(this.http.get<Tenant[]>('/api/platform/tenants', this.options()));
  }

  createTenant(value: {
    name: string;
    slug: string;
    ownerEmail: string;
    ownerPassword: string;
  }): Promise<Tenant> {
    return firstValueFrom(this.http.post<Tenant>('/api/platform/tenants', value, this.options()));
  }

  private options(): { headers: HttpHeaders } {
    const token = sessionStorage.getItem(this.tokenKey);
    if (!token) throw new Error('กรุณาเข้าสู่ระบบผู้ดูแลแพลตฟอร์มก่อน');
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }
}
