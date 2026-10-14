import { Routes } from '@angular/router';
import { Section } from './core/workspace.store';

const section = (id: Section) => ({ section: id });

// The shell reads `data.section` to highlight the menu and title the page.
export const routes: Routes = [
  { path: '', pathMatch: 'full', data: section('overview'), loadComponent: () => import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage) },
  { path: 'overview', data: section('overview'), loadComponent: () => import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage) },
  { path: 'pos', data: section('pos'), loadComponent: () => import('./pages/pos/pos.page').then((m) => m.PosPage) },
  { path: 'booking', data: section('booking'), loadComponent: () => import('./pages/booking/booking.page').then((m) => m.BookingPage) },
  { path: 'orders', data: section('orders'), loadComponent: () => import('./pages/orders/orders.page').then((m) => m.OrdersPage) },
  { path: 'rooms', data: section('rooms'), loadComponent: () => import('./pages/rooms/rooms.page').then((m) => m.RoomsPage) },
  { path: 'appointments', data: section('appointments'), loadComponent: () => import('./pages/appointments/appointments.page').then((m) => m.AppointmentsPage) },
  { path: 'services', data: section('services'), loadComponent: () => import('./pages/services/services.page').then((m) => m.ServicesPage) },
  { path: 'team', data: section('team'), loadComponent: () => import('./pages/team/team.page').then((m) => m.TeamPage) },
  { path: 'customers', data: section('customers'), loadComponent: () => import('./pages/customers/customers.page').then((m) => m.CustomersPage) },
  { path: 'branches', data: section('branches'), loadComponent: () => import('./pages/branches/branches.page').then((m) => m.BranchesPage) },
  { path: 'users', data: section('users'), loadComponent: () => import('./pages/users/users.page').then((m) => m.UsersPage) },
  { path: '**', redirectTo: '' },
];
