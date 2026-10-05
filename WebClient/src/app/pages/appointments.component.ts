import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { Appointment } from '@app/core';

@Component({
  selector: 'app-appointments-page',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  template: `
    <div class="appointments-page">
      <div class="appointments-header">
        <h1>นัดหมายใหม่</h1>
        <button class="appointments-create-button" (click)="createAppointment()">+ นัดหมายใหม่</button>
      </div>
      <table class="appointments-table">
        <thead>
          <tr>
            <th>เวลา</th>
            <th>ลูกค้า</th>
            <th>บริการ</th>
            <th>หมอนวด</th>
            <th>ห้อง</th>
            <th>สถานะ</th>
            <th>การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          @for (appointment of appointments; track appointment.id) {
            <tr>
              <td>{{ formatTime(appointment.startsAt) }}</td>
              <td>{{ getCustomerName(appointment.customerId) }}</td>
              <td>{{ getServiceName(appointment.serviceId) }}</td>
              <td>{{ getStaffName(appointment.staffId) }}</td>
              <td>{{ getRoomName(appointment.roomId) }}</td>
              <td>
                <span [class]="'status-' + appointment.status.toLowerCase()">
                  {{ appointmentStatusLabel(appointment.status) }}
                </span>
              </td>
              <td>
                <button class="appointment-edit-button" (click)="editAppointment(appointment)">แก้ไข</button>
                <button class="appointment-delete-button" (click)="deleteAppointment(appointment)">ลบ</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .appointments-page { padding: 24px; background: #f5f6f2; min-height: calc(100vh - 78px); }
    .appointments-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .appointments-header h1 { margin: 0; font-size: 24px; }
    .appointments-create-button { padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .appointments-table { width: 100%; background: white; border-collapse: collapse; border-radius: 8px; overflow: hidden; }
    .appointments-table thead { background: #f3f4f1; }
    .appointments-table th, .appointments-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e9e3; }
    .appointments-table th { font-weight: 600; }
    .status-scheduled { color: #3b82f6; }
    .status-inprogress { color: #f59e0b; }
    .status-completed { color: #10b981; }
    .status-cancelled { color: #ef4444; }
    .appointment-edit-button, .appointment-delete-button { padding: 6px 12px; border: 1px solid #d0d8cf; border-radius: 4px; cursor: pointer; margin-right: 8px; }
    .appointment-delete-button { color: #dc2626; border-color: #fecaca; }
  `],
})
export class AppointmentsPageComponent {
  @Input() appointments: Appointment[] = [];
  @Input() customers: Record<string, string> = {};
  @Input() services: Record<string, string> = {};
  @Input() staff: Record<string, string> = {};
  @Input() rooms: Record<string, string> = {};

  @Output() createAppointmentEvent = new EventEmitter<void>();
  @Output() editAppointmentEvent = new EventEmitter<Appointment>();
  @Output() deleteAppointmentEvent = new EventEmitter<Appointment>();

  createAppointment(): void { this.createAppointmentEvent.emit(); }
  editAppointment(appointment: Appointment): void { this.editAppointmentEvent.emit(appointment); }
  deleteAppointment(appointment: Appointment): void { this.deleteAppointmentEvent.emit(appointment); }

  formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString('th-TH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  getCustomerName(id: string): string { return this.customers[id] || 'ไม่ทราบ'; }
  getServiceName(id: string): string { return this.services[id] || 'ไม่ทราบ'; }
  getStaffName(id: string): string { return this.staff[id] || 'ไม่ทราบ'; }
  getRoomName(id: string): string { return this.rooms[id] || 'ไม่ทราบ'; }

  appointmentStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      Scheduled: 'รอดำเนินการ',
      InProgress: 'กำลังทำ',
      Completed: 'เสร็จสิ้น',
      Cancelled: 'ยกเลิก',
    };
    return labels[status] || status;
  }
}
