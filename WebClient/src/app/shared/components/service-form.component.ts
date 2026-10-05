import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ServiceFormData } from '@app/core';

@Component({
  selector: 'app-service-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form class="form-stack" (ngSubmit)="onSubmit()">
      <label>ชื่อบริการ
        <input name="serviceName" [(ngModel)]="form.name" placeholder="เช่น นวดไทยแบบเต็มตัว" required>
      </label>
      <label>ระยะเวลา (นาที)
        <input name="serviceDuration" [(ngModel)]="form.durationMinutes" type="number" min="15" max="480" step="15" required>
      </label>
      <label>ราคา (บาท)
        <input name="servicePrice" [(ngModel)]="form.price" type="number" min="0" step="50" required>
      </label>
      @if (error) {
        <div class="error-banner" role="alert">{{ error }}</div>
      }
      <div class="booking-dialog-actions">
        <button type="button" class="booking-cancel-button" (click)="onCancel()">ยกเลิก</button>
        <button type="submit" class="booking-confirm-button" [disabled]="isLoading || !form.name || !form.durationMinutes || !form.price">
          {{ isLoading ? 'กำลังบันทึก...' : submitLabel }}
        </button>
      </div>
    </form>
  `,
})
export class ServiceFormComponent {
  @Input() form!: ServiceFormData;
  @Input() isLoading = false;
  @Input() error = '';
  @Input() submitLabel = 'บันทึก';

  @Output() submit = new EventEmitter<ServiceFormData>();
  @Output() cancel = new EventEmitter<void>();

  onSubmit(): void {
    this.submit.emit(this.form);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
