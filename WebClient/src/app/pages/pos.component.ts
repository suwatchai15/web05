import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { MassageService, Room, StaffMember } from '@app/core';

type PosCategory = 'all' | 'thai' | 'aroma' | 'spa' | 'package';
type PaymentMethod = 'Cash' | 'BankTransfer' | 'Card';
type PosCartItem = { service: MassageService; quantity: number };

@Component({
  selector: 'app-pos-page',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  template: `
    <div class="pos-page">
      <div class="pos-container">
        <div class="pos-services-panel">
          <div class="pos-header">
            <div class="pos-category-tabs">
              @for (category of categories; track category.id) {
                <button 
                  class="category-tab"
                  [class.active]="posCategory === category.id"
                  (click)="selectCategory(category.id)">
                  {{ category.label }}
                </button>
              }
            </div>
            <input 
              type="text" 
              class="pos-search-input"
              placeholder="ค้นหาบริการ"
              [(ngModel)]="posSearch"
              (ngModelChange)="onSearchChange()">
          </div>
          <div class="pos-services-grid">
            @for (service of posServices; track service.id) {
              <div class="pos-service-card" 
                draggable="true"
                (dragstart)="startServiceDrag($event, service.id)"
                (dragend)="endServiceDrag()">
                <div class="service-name">{{ service.name }}</div>
                <div class="service-price">{{ service.price | currency }}</div>
                <div class="service-duration">{{ service.durationMinutes }}นาที</div>
                <button class="service-add-button" (click)="addToCart(service)">+</button>
              </div>
            }
          </div>
        </div>
        <div class="pos-cart-panel">
          <div class="pos-cart-header">
            <h2>ตะกร้า</h2>
            <span class="cart-count">{{ cartItemCount }}</span>
          </div>
          <div class="pos-cart-content">
            @if (cart.length > 0) {
              <div class="pos-cart-items">
                @for (item of cart; track item.service.id) {
                  <div class="cart-item">
                    <div class="cart-item-info">
                      <div class="cart-item-name">{{ item.service.name }}</div>
                      <div class="cart-item-price">{{ item.service.price | currency }}</div>
                    </div>
                    <div class="cart-item-quantity">
                      <button (click)="decreaseQuantity(item)">-</button>
                      <span>{{ item.quantity }}</span>
                      <button (click)="increaseQuantity(item)">+</button>
                    </div>
                    <button class="cart-item-remove" (click)="removeFromCart(item)">✕</button>
                  </div>
                }
              </div>
              <div class="pos-cart-summary">
                <div class="summary-row">
                  <span>รวม</span>
                  <strong>{{ cartSubtotal | currency }}</strong>
                </div>
              </div>
              <div class="pos-booking-section">
                <h3>ผูกกับนัดหมาย</h3>
                <div class="form-group">
                  <label>สาขา</label>
                  <ng-select [(ngModel)]="posBranchId" (ngModelChange)="onBranchChange()">
                    @for (branch of branches; track branch.id) {
                      <ng-option [value]="branch.id">{{ branch.name }}</ng-option>
                    }
                  </ng-select>
                </div>
                <div class="form-group">
                  <label>หมอนวด</label>
                  <ng-select [(ngModel)]="posStaffId">
                    @for (staff of staffList; track staff.id) {
                      <ng-option [value]="staff.id">{{ staff.name }}</ng-option>
                    }
                  </ng-select>
                </div>
                <div class="form-group">
                  <label>ห้อง</label>
                  <ng-select [(ngModel)]="posRoomId">
                    @for (room of roomList; track room.id) {
                      <ng-option [value]="room.id">{{ room.name }}</ng-option>
                    }
                  </ng-select>
                </div>
                <div class="form-group">
                  <label>ลูกค้า</label>
                  <ng-select [(ngModel)]="posCustomerId">
                    @for (customer of customers; track customer.id) {
                      <ng-option [value]="customer.id">{{ customer.name }}</ng-option>
                    }
                  </ng-select>
                </div>
              </div>
              <button class="pos-checkout-button" 
                (click)="checkout()"
                [disabled]="isLoading || !posBranchId">
                {{ isLoading ? 'กำลังดำเนินการ...' : 'สรุปการขาย' }}
              </button>
            } @else {
              <p class="pos-empty-cart">ไม่มีสินค้าในตะกร้า</p>
            }
          </div>
        </div>
      </div>
      @if (paymentDialogOpen) {
        <div class="pos-dialog-overlay" (click)="closePaymentDialog()">
          <div class="pos-dialog-content" (click)="$event.stopPropagation()">
            <div class="pos-dialog-header">
              <h2>เลือกวิธีชำระเงิน</h2>
              <button class="pos-dialog-close" (click)="closePaymentDialog()">✕</button>
            </div>
            <div class="payment-methods">
              @for (method of paymentMethods; track method) {
                <button class="payment-method-button" 
                  (click)="selectPaymentMethod(method)">
                  {{ paymentMethodLabel(method) }}
                </button>
              }
            </div>
          </div>
        </div>
      }
      @if (receiptDialogOpen) {
        <div class="pos-dialog-overlay" (click)="closeReceiptDialog()">
          <div class="pos-dialog-content" (click)="$event.stopPropagation()">
            <div class="pos-dialog-header">
              <h2>ใบเสร็จรับเงิน</h2>
              <button class="pos-dialog-close" (click)="closeReceiptDialog()">✕</button>
            </div>
            @if (lastSale) {
              <div class="receipt-content">
                <div class="receipt-row">
                  <span>ลำดับที่</span>
                  <strong>{{ lastSale.id }}</strong>
                </div>
                <div class="receipt-row">
                  <span>วันที่</span>
                  <strong>{{ lastSale.createdAt | date: 'short' }}</strong>
                </div>
                <div class="receipt-row">
                  <span>จำนวนเงิน</span>
                  <strong>{{ lastSale.amount | currency }}</strong>
                </div>
                <div class="receipt-row">
                  <span>วิธีชำระ</span>
                  <strong>{{ paymentMethodLabel(lastSale.paymentMethod) }}</strong>
                </div>
              </div>
            }
            <button class="pos-confirm-button" (click)="closeReceiptDialog()">ปิด</button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .pos-page {
      padding: 24px;
      background: #f5f6f2;
      min-height: calc(100vh - 78px);
    }
    .pos-container {
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 24px;
    }
    .pos-services-panel,
    .pos-cart-panel {
      background: white;
      border-radius: 8px;
      border: 1px solid #e5e9e3;
    }
    .pos-header {
      padding: 16px;
      border-bottom: 1px solid #e5e9e3;
    }
    .pos-category-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }
    .category-tab {
      padding: 6px 12px;
      border: 1px solid #d0d8cf;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      font-size: 13px;
    }
    .category-tab.active {
      background: #10b981;
      color: white;
      border-color: #10b981;
    }
    .pos-search-input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #d0d8cf;
      border-radius: 4px;
      font-size: 13px;
    }
    .pos-services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
      gap: 12px;
      padding: 16px;
      max-height: calc(100vh - 300px);
      overflow-y: auto;
    }
    .pos-service-card {
      padding: 12px;
      border: 1px solid #e5e9e3;
      border-radius: 6px;
      cursor: grab;
      text-align: center;
      background: #f9faf8;
      transition: all 0.2s;
    }
    .pos-service-card:hover {
      background: white;
      border-color: #10b981;
      box-shadow: 0 2px 4px rgba(16, 185, 129, 0.1);
    }
    .service-name {
      font-weight: 500;
      font-size: 13px;
      margin-bottom: 4px;
    }
    .service-price {
      font-size: 14px;
      font-weight: 600;
      color: #10b981;
      margin-bottom: 4px;
    }
    .service-duration {
      font-size: 11px;
      color: #9ca3af;
      margin-bottom: 8px;
    }
    .service-add-button {
      width: 100%;
      padding: 4px;
      background: #10b981;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
    }
    .pos-cart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #e5e9e3;
    }
    .pos-cart-header h2 {
      margin: 0;
      font-size: 16px;
    }
    .cart-count {
      background: #10b981;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-weight: 600;
      font-size: 12px;
    }
    .pos-cart-content {
      padding: 16px;
      max-height: calc(100vh - 200px);
      overflow-y: auto;
    }
    .pos-cart-items {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
    }
    .cart-item {
      display: grid;
      grid-template-columns: 1fr auto auto;
      gap: 8px;
      align-items: center;
      padding: 8px;
      background: #f9faf8;
      border-radius: 4px;
    }
    .cart-item-name {
      font-weight: 500;
      font-size: 13px;
    }
    .cart-item-price {
      font-size: 12px;
      color: #10b981;
      font-weight: 600;
    }
    .cart-item-quantity {
      display: flex;
      gap: 4px;
      align-items: center;
    }
    .cart-item-quantity button {
      width: 24px;
      height: 24px;
      border: 1px solid #d0d8cf;
      background: white;
      cursor: pointer;
      border-radius: 4px;
      font-size: 12px;
    }
    .cart-item-remove {
      width: 24px;
      height: 24px;
      border: none;
      background: #fee2e2;
      color: #991b1b;
      cursor: pointer;
      border-radius: 4px;
    }
    .pos-cart-summary {
      border-top: 1px solid #e5e9e3;
      padding-top: 12px;
      margin-bottom: 16px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      font-weight: 600;
      color: #1f2937;
    }
    .pos-booking-section {
      margin-bottom: 16px;
      padding-top: 16px;
      border-top: 1px solid #e5e9e3;
    }
    .pos-booking-section h3 {
      margin: 0 0 12px 0;
      font-size: 13px;
      font-weight: 600;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
      margin-bottom: 8px;
    }
    .form-group label {
      font-weight: 500;
      font-size: 12px;
    }
    .pos-checkout-button {
      width: 100%;
      padding: 12px;
      background: #10b981;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
    }
    .pos-checkout-button:disabled {
      background: #d0d8cf;
      cursor: not-allowed;
    }
    .pos-empty-cart {
      text-align: center;
      color: #9ca3af;
      padding: 24px;
    }
    .pos-dialog-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
    }
    .pos-dialog-content {
      background: white;
      border-radius: 8px;
      padding: 20px;
      max-width: 400px;
      width: 90vw;
    }
    .pos-dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .pos-dialog-header h2 {
      margin: 0;
      font-size: 18px;
    }
    .pos-dialog-close {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #9ca3af;
    }
    .payment-methods {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .payment-method-button {
      padding: 12px;
      border: 1px solid #e5e9e3;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }
    .payment-method-button:hover {
      background: #f9faf8;
      border-color: #10b981;
    }
    .receipt-content {
      padding: 20px 0;
    }
    .receipt-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e5e9e3;
    }
    .pos-confirm-button {
      width: 100%;
      padding: 8px;
      background: #10b981;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
    }
  `],
})
export class PosPageComponent {
  @Input() posServices: MassageService[] = [];
  @Input() posCategory: PosCategory = 'all';
  @Input() posSearch = '';
  @Input() cart: PosCartItem[] = [];
  @Input() cartItemCount = 0;
  @Input() cartSubtotal = 0;
  @Input() posBranchId = '';
  @Input() posStaffId = '';
  @Input() posRoomId = '';
  @Input() posCustomerId = '';
  @Input() branches: any[] = [];
  @Input() staffList: StaffMember[] = [];
  @Input() roomList: any[] = [];
  @Input() customers: any[] = [];
  @Input() paymentDialogOpen = false;
  @Input() receiptDialogOpen = false;
  @Input() lastSale: any = null;
  @Input() isLoading = false;

  @Output() categorySelect = new EventEmitter<PosCategory>();
  @Output() searchChange = new EventEmitter<string>();
  @Output() addToCartEvent = new EventEmitter<MassageService>();
  @Output() removeFromCartEvent = new EventEmitter<PosCartItem>();
  @Output() quantityChange = new EventEmitter<{ item: PosCartItem; increase: boolean }>();
  @Output() branchChange = new EventEmitter<string>();
  @Output() checkoutClick = new EventEmitter<void>();
  @Output() paymentSelect = new EventEmitter<PaymentMethod>();
  @Output() dragServiceStart = new EventEmitter<{ event: DragEvent; serviceId: string }>();
  @Output() dragServiceEnd = new EventEmitter<void>();

  protected readonly categories = [
    { id: 'all' as PosCategory, label: 'ทั้งหมด' },
    { id: 'thai' as PosCategory, label: 'นวดไทย' },
    { id: 'aroma' as PosCategory, label: 'อโรมา' },
    { id: 'spa' as PosCategory, label: 'สปา' },
    { id: 'package' as PosCategory, label: 'แพ็กเกจ' },
  ];

  protected readonly paymentMethods: PaymentMethod[] = ['Cash', 'BankTransfer', 'Card'];

  selectCategory(category: PosCategory): void {
    this.categorySelect.emit(category);
  }

  onSearchChange(): void {
    this.searchChange.emit(this.posSearch);
  }

  addToCart(service: MassageService): void {
    this.addToCartEvent.emit(service);
  }

  removeFromCart(item: PosCartItem): void {
    this.removeFromCartEvent.emit(item);
  }

  increaseQuantity(item: PosCartItem): void {
    this.quantityChange.emit({ item, increase: true });
  }

  decreaseQuantity(item: PosCartItem): void {
    this.quantityChange.emit({ item, increase: false });
  }

  onBranchChange(): void {
    this.branchChange.emit(this.posBranchId);
  }

  checkout(): void {
    this.checkoutClick.emit();
  }

  selectPaymentMethod(method: PaymentMethod): void {
    this.paymentSelect.emit(method);
  }

  closePaymentDialog(): void {
    // Emit event to close
  }

  closeReceiptDialog(): void {
    // Emit event to close
  }

  startServiceDrag(event: DragEvent, serviceId: string): void {
    this.dragServiceStart.emit({ event, serviceId });
  }

  endServiceDrag(): void {
    this.dragServiceEnd.emit();
  }

  paymentMethodLabel(method: PaymentMethod): string {
    const labels = { Cash: 'เงินสด', BankTransfer: 'QR พร้อมเพย์', Card: 'บัตรเครดิต' };
    return labels[method];
  }
}
