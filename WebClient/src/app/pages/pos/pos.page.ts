import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { dayRange, localDateValue, paymentMethodLabel, timeLabel } from '../../core/format';
import { MassageApi } from '../../core/massage-api';
import { MassageService, Room, Sale, StaffMember } from '../../core/models';
import { PosSession } from '../../core/pos-session';
import { WorkspaceStore } from '../../core/workspace.store';

type PosCategory = 'all' | 'thai' | 'aroma' | 'spa' | 'package';

@Component({
  // Pages keep async results in their own fields; Eager lets the shell's markForCheck (via store.run) refresh them.
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [DatePipe, DecimalPipe, FormsModule, NgSelectModule],
  selector: 'app-pos-page',
  styles: ':host { display: contents; }',
  styleUrl: '../../workspace.scss',
  templateUrl: './pos.page.html',
})
export class PosPage implements OnInit {
  protected readonly timeLabel = timeLabel;
  protected readonly paymentMethodLabel = paymentMethodLabel;
  protected readonly posCategories: { id: PosCategory; label: string }[] = [
    { id: 'all', label: 'ทั้งหมด' },
    { id: 'thai', label: 'นวดไทย' },
    { id: 'aroma', label: 'อโรมา' },
    { id: 'spa', label: 'สปา' },
    { id: 'package', label: 'แพ็กเกจ' },
  ];
  protected posCategory: PosCategory = 'all';
  protected posSearch = '';
  protected posSales: Sale[] = [];
  protected paymentDialogOpen = false;
  protected receiptDialogOpen = false;

  constructor(
    protected readonly store: WorkspaceStore,
    protected readonly pos: PosSession,
    private readonly api: MassageApi,
    private readonly destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.ensureStaffAndRoom();
    void this.loadPosSales();
    this.store.branchChanged.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.pos.staffId = '';
      this.pos.roomId = '';
      this.ensureStaffAndRoom();
      void this.loadPosSales();
    });
  }

  protected get posServices(): MassageService[] {
    const query = this.posSearch.trim().toLocaleLowerCase();
    return this.store.services.filter((service) =>
      service.isActive &&
      (this.posCategory === 'all' || this.posServiceCategory(service) === this.posCategory) &&
      (!query || service.name.toLocaleLowerCase().includes(query)),
    );
  }

  protected get posStaff(): StaffMember[] {
    return this.store.activeStaffIn(this.store.selectedBranchId);
  }

  protected get posRooms(): Room[] {
    return this.store.activeRoomsIn(this.store.selectedBranchId);
  }

  protected get posItemCount(): number {
    return this.pos.cart.reduce((count, item) => count + item.quantity, 0);
  }

  protected get posSubtotal(): number {
    return this.pos.cart.reduce((total, item) => total + item.service.price * item.quantity, 0);
  }

  protected addPosService(service: MassageService): void {
    this.pos.lastSale = null;
    const item = this.pos.cart.find((cartItem) => cartItem.service.id === service.id);
    if (item) {
      item.quantity = Math.min(99, item.quantity + 1);
      return;
    }
    this.pos.cart = [...this.pos.cart, { service, quantity: 1 }];
  }

  protected changePosQuantity(serviceId: string, change: number): void {
    const item = this.pos.cart.find((cartItem) => cartItem.service.id === serviceId);
    if (!item) return;
    if (item.quantity + change <= 0) {
      this.removePosService(serviceId);
      return;
    }
    item.quantity += change;
  }

  protected removePosService(serviceId: string): void {
    this.pos.cart = this.pos.cart.filter((item) => item.service.id !== serviceId);
  }

  protected startServiceDrag(event: DragEvent, serviceId: string): void {
    if (!event.dataTransfer) {
      event.preventDefault();
      return;
    }
    this.pos.draggedServiceId = serviceId;
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('text/plain', serviceId);
  }

  protected endServiceDrag(): void {
    this.pos.draggedServiceId = '';
  }

  protected async submitPosSale(): Promise<void> {
    const branchId = this.store.selectedBranchId;
    if (!branchId || !this.pos.cart.length || this.store.busy) return;
    await this.store.run(async () => {
      const paidAppointmentId = this.pos.pendingAppointment?.id ?? '';
      const sale = await this.api.createSale({
        branchId,
        customerId: this.pos.customerId || null,
        staffId: this.pos.staffId || null,
        roomId: this.pos.roomId || null,
        paymentMethod: this.pos.paymentMethod,
        items: this.pos.cart.map(({ service, quantity }) => ({ serviceId: service.id, quantity })),
        ...(paidAppointmentId ? { appointmentId: paidAppointmentId } : {}),
      });
      this.pos.lastSale = sale;
      this.posSales = [sale, ...this.posSales.filter((item) => item.id !== sale.id)].slice(0, 5);
      this.pos.cart = [];
      this.pos.pendingAppointment = null;
      this.paymentDialogOpen = false;
      this.receiptDialogOpen = true;
      if (paidAppointmentId) await this.store.reloadAppointments();
    });
  }

  protected printReceipt(): void {
    window.print();
  }

  protected posServiceTone(service: MassageService): string {
    const tones: Record<PosCategory, string> = {
      all: 'sage',
      thai: 'sage',
      aroma: 'rose',
      spa: 'sand',
      package: 'amber',
    };
    return tones[this.posServiceCategory(service)];
  }

  private posServiceCategory(service: MassageService): PosCategory {
    const name = service.name.toLocaleLowerCase();
    if (/แพ็กเกจ|package|course/.test(name)) return 'package';
    if (/อโรม|aroma|น้ำมัน/.test(name)) return 'aroma';
    if (/สปา|ฝ่าเท้า|นวดเท้า|สครับ|ประคบ|spa|scrub|foot/.test(name)) return 'spa';
    return 'thai';
  }

  private async loadPosSales(): Promise<void> {
    const { from, to } = dayRange(localDateValue(new Date()));
    await this.store.run(async () => {
      this.posSales = await this.api.sales(from, to, this.store.selectedBranchId);
    });
  }

  /** Defaults the therapist and room to the first active ones of the branch, as the original selectors did. */
  private ensureStaffAndRoom(): void {
    if (!this.posStaff.some((member) => member.id === this.pos.staffId)) this.pos.staffId = this.posStaff[0]?.id ?? '';
    if (!this.posRooms.some((room) => room.id === this.pos.roomId)) this.pos.roomId = this.posRooms[0]?.id ?? '';
  }
}
