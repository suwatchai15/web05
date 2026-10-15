import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { dateLabel } from '../../core/format';
import { MassageApi } from '../../core/massage-api';
import { Customer, CustomerType } from '../../core/models';
import { WorkspaceStore } from '../../core/workspace.store';

type CustomerFilter = 'all' | CustomerType | 'phone' | 'email' | 'today';

const emptyCustomerForm = (): { name: string; email: string; phone: string; notes: string; type: CustomerType } =>
  ({ name: '', email: '', phone: '', notes: '', type: 'ลูกค้าใหม่' });

@Component({
  // Pages keep async results in their own fields; Eager lets the shell's markForCheck (via store.run) refresh them.
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [DecimalPipe, FormsModule],
  selector: 'app-customers-page',
  styles: ':host { display: contents; }',
  styleUrl: '../../workspace.scss',
  templateUrl: './customers.page.html',
})
export class CustomersPage implements OnInit {
  protected customerSearch = '';
  protected customerFilter: CustomerFilter = 'all';
  protected customerForm = emptyCustomerForm();
  protected editingCustomerId = '';
  protected customerCreateOpen = false;
  protected customerDeleteTarget: Customer | null = null;
  private customerSearchResults: Customer[] = [];
  private customerSearchSequence = 0;

  constructor(
    protected readonly store: WorkspaceStore,
    private readonly api: MassageApi,
  ) {}

  ngOnInit(): void {
    // The "booked on the selected date" filter and counts read the shared appointment list.
    void this.store.loadAppointmentsOnEnter();
  }

  protected get selectedDateLabel(): string {
    return dateLabel(this.store.selectedDate);
  }

  protected get filteredCustomers(): Customer[] {
    const results = this.customerSearch.trim() ? this.customerSearchResults : this.store.customers;
    return results.filter((customer) => {
      if (this.customerFilter === 'all') return true;
      if (this.customerFilter === 'phone') return !!customer.phone?.trim();
      if (this.customerFilter === 'email') return !!customer.email?.trim();
      if (this.customerFilter === 'today') return this.store.selectedAppointments.some((appointment) => appointment.customerId === customer.id);
      return customer.type === this.customerFilter;
    });
  }

  protected get customersWithContact(): number {
    return this.store.customers.filter((customer) => !!customer.phone?.trim() || !!customer.email?.trim()).length;
  }

  protected get customersToday(): number {
    return new Set(this.store.selectedAppointments.map((appointment) => appointment.customerId)).size;
  }

  protected customerAppointmentCount(customerId: string): number {
    return this.store.selectedAppointments.filter((appointment) => appointment.customerId === customerId).length;
  }

  protected customerInitial(name: string): string {
    return name.trim().slice(0, 1) || 'ล';
  }

  protected async searchCustomers(query: string): Promise<void> {
    this.customerSearch = query;
    await this.store.run(() => this.refreshSearchResults());
  }

  protected openCustomerCreate(): void {
    this.store.errorMessage = '';
    this.editingCustomerId = '';
    this.customerForm = emptyCustomerForm();
    this.customerCreateOpen = true;
  }

  protected editCustomer(customer: Customer): void {
    this.store.errorMessage = '';
    this.editingCustomerId = customer.id;
    this.customerForm = {
      name: customer.name,
      email: customer.email ?? '',
      phone: customer.phone ?? '',
      notes: customer.notes ?? '',
      type: customer.type ?? 'ทั่วไป',
    };
    this.customerCreateOpen = true;
  }

  protected closeCustomerForm(): void {
    this.customerCreateOpen = false;
    this.editingCustomerId = '';
    this.customerForm = emptyCustomerForm();
    this.store.errorMessage = '';
  }

  protected async createCustomer(): Promise<void> {
    await this.store.run(async () => {
      if (this.editingCustomerId) await this.api.updateCustomer(this.editingCustomerId, this.customerForm);
      else await this.api.createCustomer(this.customerForm);
      this.customerForm = emptyCustomerForm();
      this.editingCustomerId = '';
      await this.store.reloadCustomers();
      await this.refreshSearchResults();
      this.customerCreateOpen = false;
    });
  }

  protected openCustomerDeleteConfirm(customer: Customer): void {
    this.store.errorMessage = '';
    this.customerDeleteTarget = customer;
  }

  protected cancelCustomerDelete(): void {
    if (!this.store.busy) this.customerDeleteTarget = null;
  }

  protected async confirmDeleteCustomer(): Promise<void> {
    const customer = this.customerDeleteTarget;
    if (!customer) return;
    const error = await this.store.run(async () => {
      await this.api.deleteCustomer(customer.id);
      await this.store.reloadCustomers();
      await this.refreshSearchResults();
    });
    if (error === null) this.customerDeleteTarget = null;
  }

  /** Re-runs the current search; responses that arrive after a newer search are dropped. */
  private async refreshSearchResults(): Promise<void> {
    const sequence = ++this.customerSearchSequence;
    const query = this.customerSearch.trim();
    if (!query) {
      this.customerSearchResults = [];
      return;
    }
    const results = await this.api.customers(query);
    if (sequence === this.customerSearchSequence) this.customerSearchResults = results;
  }
}
