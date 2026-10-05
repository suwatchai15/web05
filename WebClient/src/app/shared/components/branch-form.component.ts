import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BranchFormData } from '@app/core';

@Component({
  selector: 'app-branch-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <form class="form-stack" (ngSubmit)="onSubmit()">
      <label>ชื่อสาขา
        <input name="branchName" [(ngModel)]="form.name" placeholder="เช่น SABAI Central" required>
      </label>
      <label>ที่อยู่
        <textarea name="branchAddress" [(ngModel)]="form.address" rows="2" placeholder="ที่อยู่หรือตำแหน่งสาขา"></textarea>
      </label>
      <label>เขตเวลา
        <select name="branchTimeZone" [(ngModel)]="form.timeZone" [clearable]="false" required>
          <option value="Asia/Bangkok">Asia/Bangkok (ไทย)</option>
          <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh (เวียดนาม)</option>
          <option value="Asia/Kolkata">Asia/Kolkata (อินเดีย)</option>
        </select>
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
export class BranchFormComponent {
  @Input() form!: BranchFormData;
  @Input() isLoading = false;
  @Input() error = '';
  @Input() submitLabel = 'บันทึก';

  @Output() submit = new EventEmitter<BranchFormData>();
  @Output() cancel = new EventEmitter<void>();

  onSubmit(): void {
    this.submit.emit(this.form);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
