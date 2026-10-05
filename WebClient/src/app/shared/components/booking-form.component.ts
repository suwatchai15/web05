import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { BookingFormData, Branch, Customer, MassageService, Room, StaffMember } from '@app/core';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  template: `
    <form class="booking-form" (ngSubmit)="onSubmit()">
      <label>ชื่อลูกค้า
        <ng-select name="bookingCustomer" [(ngModel)]="form.customerId" 
          placeholder="ค้นหาหรือเลือกลูกค้า" [clearable]="false" required>
          @for (customer of customers; track customer.id) {
            <ng-option [value]="customer.id">{{ customer.name }}{{ customer.phone ? ' · ' + customer.phone : '' }}</ng-option>
          }
        </ng-select>
      </label>
      <label>สาขา
        <ng-select name="bookingBranch" [(ngModel)]="form.branchId" 
          [clearable]="false" [searchable]="false" required>
          @for (branch of branches; track branch.id) {
            <ng-option [value]="branch.id">{{ branch.name }}</ng-option>
          }
        </ng-select>
      </label>
      <label>บริการ
        <ng-select name="bookingService" [(ngModel)]="form.serviceId" 
          placeholder="เลือกบริการ" [clearable]="false" required>
          @for (service of services; track service.id) {
            @if (service.isActive) {
              <ng-option [value]="service.id">{{ service.name }} · {{ service.durationMinutes }} นาที</ng-option>
            }
          }
        </ng-select>
      </label>
      <div class="booking-form-row">
        <label>วันที่<input name="bookingDate" type="date" [(ngModel)]="form.date" required></label>
        <label>เวลาเริ่ม
          <ng-select name="bookingTime" [(ngModel)]="form.time" [clearable]="false" [searchable]="false">
            @for (time of timeSlots; track time) {
              @if (time !== '22:00') {
                <ng-option [value]="time">{{ time }}</ng-option>
              }
            }
          </ng-select>
        </label>
      </div>
      <div class="booking-form-row">
        <label>หมอนวด
          <ng-select name="bookingStaff" [(ngModel)]="form.staffId" 
            placeholder="เลือกหมอนวด" [clearable]="false" required>
            @for (staff of staffList; track staff.id) {
              <ng-option [value]="staff.id">{{ staff.name }}</ng-option>
            }
          </ng-select>
        </label>
        <label>ห้อง / เตียง
          <ng-select name="bookingRoom" [(ngModel)]="form.roomId" 
            placeholder="เลือกห้อง" [clearable]="false" required>
            @for (room of rooms; track room.id) {
              <ng-option [value]="room.id">{{ room.name }}</ng-option>
            }
          </ng-select>
        </label>
      </div>
      <label>หมายเหตุ<textarea name="bookingNotes" [(ngModel)]="form.notes" 
        rows="2" maxlength="1000" placeholder="เพิ่มหมายเหตุ (ถ้ามี)"></textarea></label>
      @if (error) {
        <div class="error-banner" role="alert">{{ error }}</div>
      }
      <div class="booking-dialog-actions">
        <button type="button" class="booking-cancel-button" (click)="onCancel()">ยกเลิก</button>
        <button type="submit" class="booking-confirm-button" 
          [disabled]="isLoading || !form.customerId || !form.serviceId || !form.staffId || !form.roomId">
          {{ isLoading ? 'กำลังบันทึก...' : submitLabel }}
        </button>
      </div>
    </form>
  `,
})
export class BookingFormComponent {
  @Input() form!: BookingFormData;
  @Input() customers: Customer[] = [];
  @Input() branches: Branch[] = [];
  @Input() services: MassageService[] = [];
  @Input() staffList: StaffMember[] = [];
  @Input() rooms: Room[] = [];
  @Input() timeSlots: string[] = [];
  @Input() isLoading = false;
  @Input() error = '';
  @Input() submitLabel = 'ยืนยันการจอง';

  @Output() submit = new EventEmitter<BookingFormData>();
  @Output() cancel = new EventEmitter<void>();

  onSubmit(): void {
    this.submit.emit(this.form);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
