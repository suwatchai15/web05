import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { StaffMember } from '@app/core';

@Component({
  selector: 'app-team-page',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  template: `
    <div class="team-page">
      <div class="team-header">
        <h1>ทีมหมอนวด</h1>
        <button class="team-create-button" (click)="createStaff()">+ หมอนวดใหม่</button>
      </div>
      <table class="team-table">
        <thead>
          <tr>
            <th>ชื่อ</th>
            <th>อีเมล</th>
            <th>สาขา</th>
            <th>สถานะ</th>
            <th>การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          @for (staff of staffMembers; track staff.id) {
            <tr>
              <td>{{ staff.name }}</td>
              <td>{{ staff.email }}</td>
              <td>{{ getBranchName(staff.branchId) }}</td>
              <td>
                <span [class]="staff.isActive ? 'status-active' : 'status-inactive'">
                  {{ staff.isActive ? 'ใช้งาน' : 'ปิดใช้งาน' }}
                </span>
              </td>
              <td>
                <button class="team-edit-button" (click)="editStaff(staff)">แก้ไข</button>
                <button class="team-delete-button" (click)="deleteStaff(staff)">ลบ</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .team-page { padding: 24px; background: #f5f6f2; min-height: calc(100vh - 78px); }
    .team-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .team-header h1 { margin: 0; font-size: 24px; }
    .team-create-button { padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .team-table { width: 100%; background: white; border-collapse: collapse; border-radius: 8px; overflow: hidden; }
    .team-table thead { background: #f3f4f1; }
    .team-table th, .team-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e9e3; }
    .team-table th { font-weight: 600; }
    .status-active { color: #10b981; }
    .status-inactive { color: #ef4444; }
    .team-edit-button, .team-delete-button { padding: 6px 12px; border: 1px solid #d0d8cf; border-radius: 4px; cursor: pointer; margin-right: 8px; }
    .team-delete-button { color: #dc2626; border-color: #fecaca; }
  `],
})
export class TeamPageComponent {
  @Input() staffMembers: StaffMember[] = [];
  @Input() branches: any[] = [];

  @Output() createStaffEvent = new EventEmitter<void>();
  @Output() editStaffEvent = new EventEmitter<StaffMember>();
  @Output() deleteStaffEvent = new EventEmitter<StaffMember>();

  createStaff(): void { this.createStaffEvent.emit(); }
  editStaff(staff: StaffMember): void { this.editStaffEvent.emit(staff); }
  deleteStaff(staff: StaffMember): void { this.deleteStaffEvent.emit(staff); }
  getBranchName(branchId: string): string { return this.branches.find(b => b.id === branchId)?.name ?? 'ไม่ทราบ'; }
}
