import { Routes } from '@angular/router';
import { MenuRoute } from './menu-route';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: MenuRoute, data: { section: 'overview' } },
  { path: 'overview', component: MenuRoute, data: { section: 'overview' } },
  { path: 'pos', component: MenuRoute, data: { section: 'pos' } },
  { path: 'booking', component: MenuRoute, data: { section: 'booking' } },
  { path: 'rooms', component: MenuRoute, data: { section: 'rooms' } },
  { path: 'appointments', component: MenuRoute, data: { section: 'appointments' } },
  { path: 'services', component: MenuRoute, data: { section: 'services' } },
  { path: 'team', component: MenuRoute, data: { section: 'team' } },
  { path: 'customers', component: MenuRoute, data: { section: 'customers' } },
  { path: 'branches', component: MenuRoute, data: { section: 'branches' } },
  { path: 'users', component: MenuRoute, data: { section: 'users' } },
  { path: '**', redirectTo: '' },
];
