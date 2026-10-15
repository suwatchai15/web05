import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { dayRange, paymentMethodLabel, timeLabel } from '../../core/format';
import { MassageApi } from '../../core/massage-api';
import { Sale } from '../../core/models';
import { WorkspaceStore } from '../../core/workspace.store';

@Component({
  // Pages keep async results in their own fields; Eager lets the shell's markForCheck (via store.run) refresh them.
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [DecimalPipe, FormsModule],
  selector: 'app-orders-page',
  styles: ':host { display: contents; }',
  styleUrl: '../../workspace.scss',
  templateUrl: './orders.page.html',
})
export class OrdersPage implements OnInit {
  protected readonly timeLabel = timeLabel;
  protected readonly paymentMethodLabel = paymentMethodLabel;
  protected orderSales: Sale[] = [];

  constructor(
    protected readonly store: WorkspaceStore,
    private readonly api: MassageApi,
    private readonly destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    void this.loadOrders();
    this.store.branchChanged.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => void this.loadOrders());
  }

  protected get orderSalesTotal(): number {
    return this.orderSales.reduce((total, sale) => total + sale.total, 0);
  }

  protected async loadOrdersForDate(date: string): Promise<void> {
    if (!date) return;
    this.store.selectedDate = date;
    // selectedDate is shared, so the store's appointments must follow it too.
    await this.loadOrders(() => this.store.reloadAppointments());
  }

  private async loadOrders(alongside?: () => Promise<void>): Promise<void> {
    const { from, to } = dayRange(this.store.selectedDate);
    await this.store.run(async () => {
      const [sales] = await Promise.all([this.api.sales(from, to, this.store.selectedBranchId), alongside?.()]);
      this.orderSales = sales;
    });
  }
}
