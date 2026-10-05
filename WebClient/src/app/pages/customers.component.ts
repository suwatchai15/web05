import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { Customer } from '@app/core';

@Component({
  selector: 'app-customers-page',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  template: `
    <div class="customers-page">
      <div class="customers-header">
        <h1>ลูกค้า</h1>
        <div class="customers-controls">
          <input type="text" 
            class="customers-search-input"
            placeholder="ค้นหาลูกค้า" 
            [(ngModel)]="customerSearch"
            (ngModelChange)="onSearchChange()">
          <button class="customers-create-button" (click)="createCustomer()">+ ลูกค้าใหม่</button>
        </div>
      </div>
      <table class="customers-table">
        <thead>
          <tr>
            <th>ชื่อ</th>
            <th>โทรศัพท์</th>
            <th>อีเมล</th>
            <th>บันทึก</th>
            <th>การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          @for (customer of filteredCustomers; track customer.id) {
            <tr>
              <td>{{ customer.name }}</td>
              <td>{{ customer.phone }}</td>
              <td>{{ customer.email }}</td>
              <td>{{ customer.notes }}</td>
              <td>
                <button class="customer-edit-button" (click)="editCustomer(customer)">แก้ไข</button>
                <button class="customer-delete-button" (click)="deleteCustomer(customer)">ลบ</button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .customers-page { padding: 24px; background: #f5f6f2; min-height: calc(100vh - 78px); }
    .customers-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .customers-header h1 { margin: 0; font-size: 24px; }
    .customers-controls { display: flex; gap: 12px; }
    .customers-search-input { padding: 8px 12px; border: 1px solid #d0d8cf; border-radius: 4px; flex: 1; max-width: 300px; }
    .customers-create-button { padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .customers-table { width: 100%; background: white; border-collapse: collapse; border-radius: 8px; overflow: hidden; }
    .customers-table thead { background: #f3f4f1; }
    .customers-table th, .customers-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e9e3; }
    .customers-table th { font-weight: 600; }
    .customer-edit-button, .customer-delete-button { padding: 6px 12px; border: 1px solid #d0d8cf; border-radius: 4px; cursor: pointer; margin-right: 8px; }
    .customer-delete-button { color: #dc2626; border-color: #fecaca; }
  `],
})
export class CustomersPageComponent {
  @Input() filteredCustomers: Customer[] = [];
  @Input() customerSearch = '';

  @Output() searchChange = new EventEmitter<string>();
  @Output() createCustomerEvent = new EventEmitter<void>();
  @Output() editCustomerEvent = new EventEmitter<Customer>();
  @Output() deleteCustomerEvent = new EventEmitter<Customer>();

  onSearchChange(): void { this.searchChange.emit(this.customerSearch); }
  createCustomer(): void { this.createCustomerEvent.emit(); }
  editCustomer(customer: Customer): void { this.editCustomerEvent.emit(customer); }
  deleteCustomer(customer: Customer): void { this.deleteCustomerEvent.emit(customer); }
}
