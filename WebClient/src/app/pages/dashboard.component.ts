import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Appointment, Branch, MassageService, Room, StaffMember } from '@app/core';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-page">
      <div class="dashboard-stats">
        <div class="stat-card">
          <div class="stat-value">{{ upcomingAppointments.length }}</div>
          <div class="stat-label">นัดหมายวันนี้</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ completedAppointmentCount }}</div>
          <div class="stat-label">เสร็จสิ้น</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ pendingAppointments }}</div>
          <div class="stat-label">รอดำเนินการ</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ cancelledAppointmentCount }}</div>
          <div class="stat-label">ยกเลิก</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ activeStaffCount }}</div>
          <div class="stat-label">หมอนวดกำลังทำงาน</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ activeRoomCount }}</div>
          <div class="stat-label">ห้องทำงาน</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ activeServiceCount }}</div>
          <div class="stat-label">บริการที่เปิดใช้</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ completedRevenue | currency }}</div>
          <div class="stat-label">รายได้วันนี้</div>
        </div>
      </div>
      <div class="dashboard-section">
        <h2>นัดหมายที่เตรียมไว้</h2>
        @if (upcomingAppointments.length > 0) {
          <div class="upcoming-list">
            @for (appointment of upcomingAppointments; track appointment.id) {
              <div class="appointment-item">
                <div class="appointment-time">{{ appointmentTime(appointment) }}</div>
                <div class="appointment-info">
                  <div class="appointment-customer">{{ getCustomerName(appointment.customerId) }}</div>
                  <div class="appointment-service">{{ getServiceName(appointment.serviceId) }}</div>
                </div>
                <div class="appointment-staff">{{ getStaffName(appointment.staffId) }}</div>
              </div>
            }
          </div>
        } @else {
          <p class="no-data">ไม่มีนัดหมายวันนี้</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page {
      padding: 24px;
      background: #f5f6f2;
      min-height: calc(100vh - 78px);
    }
    .dashboard-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }
    .stat-card {
      padding: 16px;
      background: white;
      border-radius: 8px;
      border: 1px solid #e5e9e3;
      text-align: center;
    }
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 8px;
    }
    .stat-label {
      font-size: 13px;
      color: #6b7280;
    }
    .dashboard-section {
      background: white;
      border-radius: 8px;
      border: 1px solid #e5e9e3;
      padding: 20px;
    }
    .dashboard-section h2 {
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 600;
    }
    .upcoming-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .appointment-item {
      display: grid;
      grid-template-columns: 60px 1fr 120px;
      gap: 16px;
      padding: 12px;
      background: #f9faf8;
      border-radius: 6px;
      border-left: 3px solid #10b981;
    }
    .appointment-time {
      font-weight: 600;
      color: #1f2937;
    }
    .appointment-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .appointment-customer {
      font-size: 14px;
      font-weight: 500;
    }
    .appointment-service {
      font-size: 13px;
      color: #6b7280;
    }
    .appointment-staff {
      text-align: right;
      font-size: 13px;
      color: #6b7280;
    }
    .no-data {
      text-align: center;
      color: #9ca3af;
      padding: 24px;
    }
  `],
})
export class DashboardPageComponent {
  @Input() upcomingAppointments: Appointment[] = [];
  @Input() completedAppointmentCount = 0;
  @Input() pendingAppointments = 0;
  @Input() cancelledAppointmentCount = 0;
  @Input() activeStaffCount = 0;
  @Input() activeRoomCount = 0;
  @Input() activeServiceCount = 0;
  @Input() completedRevenue = 0;
  @Input() customers: Record<string, string> = {};
  @Input() services: Record<string, string> = {};
  @Input() staff: Record<string, string> = {};

  appointmentTime(appointment: Appointment): string {
    const time = new Date(appointment.startsAt);
    return time.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  }

  getCustomerName(customerId: string): string {
    return this.customers[customerId] || 'ไม่ทราบ';
  }

  getServiceName(serviceId: string): string {
    return this.services[serviceId] || 'ไม่ทราบ';
  }

  getStaffName(staffId: string): string {
    return this.staff[staffId] || 'ไม่ทราบ';
  }
}
