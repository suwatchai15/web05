import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PlatformApi } from './platform-api';

describe('PlatformApi', () => {
  let api: PlatformApi;
  let http: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [PlatformApi, provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(PlatformApi);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('authenticates as platform admin and creates a tenant with a bearer token', async () => {
    const login = api.login('platform-admin', 'a-strong-password');
    const loginRequest = http.expectOne('/api/platform/auth/login');
    expect(loginRequest.request.body).toEqual({ username: 'platform-admin', password: 'a-strong-password' });
    loginRequest.flush({ accessToken: 'platform-token' });
    await login;
    expect(api.hasSession).toBe(true);

    const create = api.createTenant({
      name: 'บ้านสบาย',
      slug: 'baan-sabai',
      ownerEmail: 'owner@example.com',
      ownerPassword: 'very-strong-owner-password',
    });
    const createRequest = http.expectOne('/api/platform/tenants');
    expect(createRequest.request.headers.get('Authorization')).toBe('Bearer platform-token');
    expect(createRequest.request.body.slug).toBe('baan-sabai');
    createRequest.flush({ id: 'tenant-id', name: 'บ้านสบาย', slug: 'baan-sabai', isActive: true });
    await create;
  });
});
