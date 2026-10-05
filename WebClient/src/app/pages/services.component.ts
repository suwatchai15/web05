import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { MassageService } from '@app/core';

@Component({
  selector: 'app-services-page',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  template: `
    <div class="services-page">
      <div class="services-header">
        <h1>บริการนวด</h1>
        <button class="services-create-button" (click)="createService()">+ บริการใหม่</button>
      </div>
      <table class="services-table">
        <thead>
          <tr>
            <th>ชื่อบริการ</th>
            <th>ระยะเวลา</th>
            <th>ราคา</th>
            <th>สถานะ</th>
            <th>การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          @for (service of services; track service.id) {
            <tr>
              <td>{{ service.name }}</td>
              <td>{{ service.durationMinutes }}นาที</td>
              <td>{{ service.price | currency }}</td>
              <td>
                <span [class]="service.isActive ? 'status-active' : 'status-inactive'">
                  {{ service.isActive ? 'ใช้งาน' : 'ปิดใช้งาน' }}
                </span>
              </td>
              <td>
                <button class="service-edit-button" (click)="editService(service)">แก้ไข</button>
                <button class="service-delete-button" (click)="deleteService(service)">ลบ</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .services-page { padding: 24px; background: #f5f6f2; min-height: calc(100vh - 78px); }
    .services-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .services-header h1 { margin: 0; font-size: 24px; }
    .services-create-button { padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .services-table { width: 100%; background: white; border-collapse: collapse; border-radius: 8px; overflow: hidden; }
    .services-table thead { background: #f3f4f1; }
    .services-table th, .services-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e9e3; }
    .services-table th { font-weight: 600; }
    .status-active { color: #10b981; }
    .status-inactive { color: #ef4444; }
    .service-edit-button, .service-delete-button { padding: 6px 12px; border: 1px solid #d0d8cf; border-radius: 4px; cursor: pointer; margin-right: 8px; }
    .service-delete-button { color: #dc2626; border-color: #fecaca; }
  `],
})
export class ServicesPageComponent {
  @Input() services: MassageService[] = [];

  @Output() createServiceEvent = new EventEmitter<void>();
  @Output() editServiceEvent = new EventEmitter<MassageService>();
  @Output() deleteServiceEvent = new EventEmitter<MassageService>();

  createService(): void { this.createServiceEvent.emit(); }
  editService(service: MassageService): void { this.editServiceEvent.emit(service); }
  deleteService(service: MassageService): void { this.deleteServiceEvent.emit(service); }
}
