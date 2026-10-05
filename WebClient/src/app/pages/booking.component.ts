import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Appointment, StaffMember } from '@app/core';
import { BookingFormComponent } from '@app/shared';

type AppointmentStatus = 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled';

@Component({
  selector: 'app-booking-page',
  standalone: true,
  imports: [CommonModule, FormsModule, BookingFormComponent],
  template: `
    <div class="booking-page" [class.booking-drop-zone-active]="bookingDropZoneActive">
      <div class="booking-header">
        <div class="booking-date-picker">
          <button (click)="goToToday()" class="booking-today-button">วันนี้</button>
          <input type="date" [value]="selectedDate" (change)="dateChanged($event)" class="booking-date-input" />
          <span class="booking-date-label">{{ agendaDateLabel }}</span>
        </div>
        <div class="booking-stats">
          <span class="booking-stat">
            <strong>{{ scheduledCount }}</strong> รอดำเนินการ
          </span>
          <span class="booking-stat">
            <strong>{{ inProgressCount }}</strong> กำลังทำ
          </span>
          <span class="booking-stat">
            <strong>{{ completedCount }}</strong> เสร็จสิ้น
          </span>
          <span class="booking-stat">
            <strong>{{ cancelledCount }}</strong> ยกเลิก
          </span>
        </div>
        <button (click)="newBooking()" class="booking-new-button">+ นัดหมายใหม่</button>
      </div>
      <div class="booking-timeline">
        <div class="timeline-header">
          <div class="timeline-time-column"></div>
          @for (resource of resources; track resource.id) {
            <div class="timeline-resource-column">
              <span>{{ resource.name }}</span>
            </div>
          }
        </div>
        <div class="timeline-body">
          @for (timeSlot of timeSlots; track timeSlot) {
            <div class="timeline-row">
              <div class="timeline-time-cell">{{ timeSlot }}</div>
              @for (resource of resources; track resource.id) {
                <div class="timeline-slot-cell" 
                  (dragover)="allowDrop($event, resource.id)" 
                  (drop)="dropAppointment($event, resource.id)"
                  (dragleave)="endDrag()"
                  (click)="openQuickAdd(resource.id, timeSlot)"
                  [class.timeline-slot-dragging]="draggedResourceId === resource.id">
                  @for (appointment of appointmentsForSlot(resource.id, timeSlot); track appointment.id) {
                    <div class="timeline-appointment" 
                      [class.timeline-appointment-scheduled]="appointment.status === 'Scheduled'"
                      [class.timeline-appointment-inprogress]="appointment.status === 'InProgress'"
                      [class.timeline-appointment-completed]="appointment.status === 'Completed'"
                      [class.timeline-appointment-cancelled]="appointment.status === 'Cancelled'"
                      draggable="true"
                      (dragstart)="startDrag($event, appointment)"
                      (click)="editAppointment(appointment); $event.stopPropagation()">
                      <span class="appointment-label">{{ appointmentLabel(appointment) }}</span>
                    </div>
                  }
                </div>
              }
            </div>
          }
        </div>
      </div>
      @if (bookingDialogOpen) {
        <div class="booking-dialog-overlay" (click)="closeDialog()">
          <div class="booking-dialog-content" (click)="$event.stopPropagation()">
            <div class="booking-dialog-header">
              <h2>{{ editingAppointmentId ? 'แก้ไขนัดหมาย' : 'สร้างนัดหมายใหม่' }}</h2>
              <button class="booking-dialog-close" (click)="closeDialog()">✕</button>
            </div>
            <app-booking-form 
              [form]="appointmentForm"
              [customers]="customers"
              [branches]="branches"
              [services]="services"
              [staffList]="staffList"
              [rooms]="rooms"
              [timeSlots]="[]"
              [isLoading]="isLoading"
              [error]="error"
              [submitLabel]="editingAppointmentId ? 'อัปเดต' : 'บันทึก'"
              (submit)="submitBooking($event)"
              (cancel)="closeDialog()">
            </app-booking-form>
          </div>
        </div>
      }
      @if (quickAddModalOpen) {
        <div class="booking-dialog-overlay" (click)="closeQuickAdd()">
          <div class="booking-dialog-content" (click)="$event.stopPropagation()">
            <div class="booking-dialog-header">
              <h2>สร้างนัดหมายเร็ว</h2>
              <button class="booking-dialog-close" (click)="closeQuickAdd()">✕</button>
            </div>
            <div class="quick-add-form">
              <div class="form-group">
                <label>เวลา</label>
                <input type="time" [(ngModel)]="quickAddTime" class="form-input" />
              </div>
              <div class="quick-add-actions">
                <button class="booking-confirm-button" (click)="submitQuickAdd()">สร้างนัดหมาย</button>
                <button class="booking-cancel-button" (click)="closeQuickAdd()">ยกเลิก</button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .booking-page {
      padding: 24px;
      background: #f5f6f2;
      min-height: calc(100vh - 78px);
    }
    .booking-page.booking-drop-zone-active {
      background-color: #d1fae5;
    }
    .booking-header {
      display: flex;
      align-items: center;
      gap: 24px;
      margin-bottom: 24px;
      background: white;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #e5e9e3;
    }
    .booking-date-picker {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .booking-today-button,
    .booking-date-input,
    .booking-new-button {
      padding: 8px 12px;
      border: 1px solid #d0d8cf;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      font-size: 13px;
    }
    .booking-new-button {
      background: #10b981;
      color: white;
      border-color: #10b981;
      margin-left: auto;
    }
    .booking-stats {
      display: flex;
      gap: 16px;
      flex: 1;
    }
    .booking-stat {
      font-size: 13px;
      color: #6b7280;
    }
    .booking-stat strong {
      color: #1f2937;
      margin-right: 4px;
    }
    .booking-timeline {
      background: white;
      border-radius: 8px;
      border: 1px solid #e5e9e3;
      overflow: hidden;
    }
    .timeline-header {
      display: grid;
      grid-template-columns: 60px repeat(auto-fit, minmax(120px, 1fr));
      background: #f3f4f1;
      border-bottom: 1px solid #e5e9e3;
      position: sticky;
      top: 0;
      z-index: 2;
    }
    .timeline-time-column {
      padding: 12px;
      font-weight: 600;
      font-size: 12px;
    }
    .timeline-resource-column {
      padding: 12px;
      font-weight: 600;
      font-size: 12px;
      border-right: 1px solid #e5e9e3;
    }
    .timeline-body {
      max-height: calc(100vh - 300px);
      overflow-y: auto;
    }
    .timeline-row {
      display: grid;
      grid-template-columns: 60px repeat(auto-fit, minmax(120px, 1fr));
      border-bottom: 1px solid #f3f4f1;
    }
    .timeline-time-cell {
      padding: 12px;
      font-size: 12px;
      color: #6b7280;
      border-right: 1px solid #e5e9e3;
      background: #f9faf8;
    }
    .timeline-slot-cell {
      padding: 4px;
      min-height: 60px;
      border-right: 1px solid #f3f4f1;
      cursor: pointer;
      position: relative;
    }
    .timeline-slot-cell:hover {
      background: #f0fdf4;
    }
    .timeline-slot-dragging {
      background: #d1fae5;
    }
    .timeline-appointment {
      padding: 4px 6px;
      margin: 2px 0;
      border-radius: 4px;
      font-size: 11px;
      cursor: grab;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .timeline-appointment-scheduled {
      background: #dbeafe;
      color: #1e40af;
    }
    .timeline-appointment-inprogress {
      background: #fed7aa;
      color: #92400e;
    }
    .timeline-appointment-completed {
      background: #dcfce7;
      color: #15803d;
    }
    .timeline-appointment-cancelled {
      background: #fee2e2;
      color: #991b1b;
    }
    .appointment-label {
      display: block;
    }
    .booking-dialog-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
    }
    .booking-dialog-content {
      background: white;
      border-radius: 8px;
      padding: 20px;
      max-width: 500px;
      width: 90vw;
      max-height: 90vh;
      overflow-y: auto;
    }
    .booking-dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .booking-dialog-header h2 {
      margin: 0;
      font-size: 18px;
    }
    .booking-dialog-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #9ca3af;
    }
    .quick-add-form {
      padding: 20px 0;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
    }
    .form-group label {
      font-weight: 500;
      font-size: 14px;
    }
    .form-input {
      padding: 8px 12px;
      border: 1px solid #d0d8cf;
      border-radius: 4px;
      font-size: 14px;
    }
    .quick-add-actions {
      display: flex;
      gap: 8px;
      justify-content: flex-end;
    }
    .booking-confirm-button,
    .booking-cancel-button {
      padding: 8px 16px;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
    }
    .booking-confirm-button {
      background: #10b981;
      color: white;
    }
    .booking-cancel-button {
      background: #f3f4f1;
      color: #6b7280;
    }
  `],
})
export class BookingPageComponent {
  @Input() selectedDate = '';
  @Input() agendaDateLabel = '';
  @Input() scheduledCount = 0;
  @Input() inProgressCount = 0;
  @Input() completedCount = 0;
  @Input() cancelledCount = 0;
  @Input() resources: StaffMember[] = [];
  @Input() timeSlots: string[] = [];
  @Input() appointments: Appointment[] = [];
  @Input() branches: any[] = [];
  @Input() customers: any[] = [];
  @Input() services: any[] = [];
  @Input() staffList: StaffMember[] = [];
  @Input() rooms: any[] = [];
  @Input() isLoading = false;
  @Input() error = '';
  @Input() bookingDialogOpen = false;
  @Input() quickAddModalOpen = false;
  @Input() editingAppointmentId = '';
  @Input() bookingDropZoneActive = false;
  @Input() draggedResourceId = '';
  @Input() quickAddStaffId = '';
  @Input() quickAddTime = '10:00';

  @Input() appointmentForm = {
    branchId: '',
    serviceId: '',
    staffId: '',
    customerId: '',
    roomId: '',
    date: '',
    time: '10:00',
    notes: '',
  };

  @Output() dateChange = new EventEmitter<string>();
  @Output() newBookingClick = new EventEmitter<void>();
  @Output() appointmentEdit = new EventEmitter<Appointment>();
  @Output() bookingSubmit = new EventEmitter<any>();
  @Output() bookingCancel = new EventEmitter<void>();
  @Output() dragStart = new EventEmitter<{ event: DragEvent; appointment: Appointment }>();
  @Output() dragAllow = new EventEmitter<{ event: DragEvent; resourceId: string }>();
  @Output() dropAppointmentEvent = new EventEmitter<{ event: DragEvent; resourceId: string }>();
  @Output() dragEnd = new EventEmitter<void>();
  @Output() quickAddOpen = new EventEmitter<{ staffId: string; time: string }>();
  @Output() quickAddClose = new EventEmitter<void>();
  @Output() quickAddSubmit = new EventEmitter<void>();
  @Output() goToToday = new EventEmitter<void>();

  dateChanged(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.dateChange.emit(input.value);
  }

  newBooking(): void {
    this.newBookingClick.emit();
  }

  editAppointment(appointment: Appointment): void {
    this.appointmentEdit.emit(appointment);
  }

  submitBooking(form: any): void {
    this.bookingSubmit.emit(form);
  }

  closeDialog(): void {
    this.bookingCancel.emit();
  }

  startDrag(event: DragEvent, appointment: Appointment): void {
    this.dragStart.emit({ event, appointment });
  }

  allowDrop(event: DragEvent, resourceId: string): void {
    this.dragAllow.emit({ event, resourceId });
  }

  dropAppointment(event: DragEvent, resourceId: string): void {
    this.dropAppointmentEvent.emit({ event, resourceId });
  }

  endDrag(): void {
    this.dragEnd.emit();
  }

  openQuickAdd(staffId: string, time: string): void {
    this.quickAddOpen.emit({ staffId, time });
  }

  closeQuickAdd(): void {
    this.quickAddClose.emit();
  }

  submitQuickAdd(): void {
    this.quickAddSubmit.emit();
  }

  goToTodayClick(): void {
    this.goToToday.emit();
  }

  appointmentsForSlot(resourceId: string, timeSlot: string): Appointment[] {
    return this.appointments.filter((a) => a.staffId === resourceId);
  }

  appointmentLabel(appointment: Appointment): string {
    const start = new Date(appointment.startsAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    return `${start} - ${appointment.customerId}`;
  }
}
