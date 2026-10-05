import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { RoomFormData, Branch } from '@app/core';

@Component({
  selector: 'app-room-form',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  template: `
    <form class="form-stack" (ngSubmit)="onSubmit()">
      <label>สาขา
        <ng-select name="roomBranch" [(ngModel)]="form.branchId" 
          [clearable]="false" required>
          @for (branch of branches; track branch.id) {
            <ng-option [value]="branch.id">{{ branch.name }}</ng-option>
          }
        </ng-select>
      </label>
      <label>ชื่อห้อง / เตียง
        <input name="roomName" [(ngModel)]="form.name" placeholder="เช่น ห้อง A, เตียง 1" required>
      </label>
      @if (error) {
        <div class="error-banner" role="alert">{{ error }}</div>
      }
      <div class="booking-dialog-actions">
        <button type="button" class="booking-cancel-button" (click)="onCancel()">ยกเลิก</button>
        <button type="submit" class="booking-confirm-button" [disabled]="isLoading || !form.branchId || !form.name">
          {{ isLoading ? 'กำลังบันทึก...' : submitLabel }}
        </button>
      </div>
    </form>
  `,
})
export class RoomFormComponent {
  @Input() form!: RoomFormData;
  @Input() branches: Branch[] = [];
  @Input() isLoading = false;
  @Input() error = '';
  @Input() submitLabel = 'บันทึก';

  @Output() submit = new EventEmitter<RoomFormData>();
  @Output() cancel = new EventEmitter<void>();

  onSubmit(): void {
    this.submit.emit(this.form);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
