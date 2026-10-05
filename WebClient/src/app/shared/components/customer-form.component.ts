import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomerFormData } from '@app/core';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form class="form-stack" (ngSubmit)="onSubmit()">
      <label>ชื่อลูกค้า
        <input name="customerName" [(ngModel)]="form.name" placeholder="ชื่อ-นามสกุล" required>
      </label>
      <label>อีเมล (ไม่บังคับ)
        <input name="customerEmail" [(ngModel)]="form.email" type="email" placeholder="example@email.com">
      </label>
      <label>เบอร์โทรศัพท์ (ไม่บังคับ)
        <input name="customerPhone" [(ngModel)]="form.phone" type="tel" placeholder="08X-XXX-XXXX">
      </label>
      <label>หมายเหตุ
        <textarea name="customerNotes" [(ngModel)]="form.notes" rows="2" maxlength="1000" placeholder="หมายเหตุเพิ่มเติม"></textarea>
      </label>
      @if (error) {
        <div class="error-banner" role="alert">{{ error }}</div>
      }
      <div class="booking-dialog-actions">
        <button type="button" class="booking-cancel-button" (click)="onCancel()">ยกเลิก</button>
        <button type="submit" class="booking-confirm-button" [disabled]="isLoading || !form.name">
          {{ isLoading ? 'กำลังบันทึก...' : submitLabel }}
        </button>
      </div>
    </form>
  `,
})
export class CustomerFormComponent {
  @Input() form!: CustomerFormData;
  @Input() isLoading = false;
  @Input() error = '';
  @Input() submitLabel = 'บันทึก';

  @Output() submit = new EventEmitter<CustomerFormData>();
  @Output() cancel = new EventEmitter<void>();

  onSubmit(): void {
    this.submit.emit(this.form);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
