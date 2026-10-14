import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MassageApi } from '../../core/massage-api';
import { MassageService } from '../../core/models';
import { WorkspaceStore } from '../../core/workspace.store';

@Component({
  // Pages keep async results in their own fields; Eager lets the shell's markForCheck (via store.run) refresh them.
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [DecimalPipe, FormsModule],
  selector: 'app-services-page',
  styles: ':host { display: contents; }',
  styleUrl: '../../workspace.scss',
  templateUrl: './services.page.html',
})
export class ServicesPage {
  protected serviceForm = { name: '', durationMinutes: 60, price: 0 };
  protected editingServiceId = '';
  protected serviceFormDialogOpen = false;
  protected serviceDeleteTarget: MassageService | null = null;

  constructor(
    protected readonly store: WorkspaceStore,
    private readonly api: MassageApi,
  ) {}

  protected openServiceCreate(): void {
    this.cancelServiceEdit();
    this.serviceFormDialogOpen = true;
  }

  protected editService(service: MassageService): void {
    this.editingServiceId = service.id;
    this.serviceForm = { name: service.name, durationMinutes: service.durationMinutes, price: service.price };
    this.serviceFormDialogOpen = true;
  }

  protected closeServiceForm(): void {
    this.serviceFormDialogOpen = false;
    this.cancelServiceEdit();
  }

  protected async createService(): Promise<void> {
    await this.store.run(async () => {
      if (this.editingServiceId) await this.api.updateService(this.editingServiceId, this.serviceForm);
      else await this.api.createService(this.serviceForm);
      this.closeServiceForm();
      await this.store.loadWorkspace();
    });
  }

  protected cancelServiceDelete(): void {
    this.serviceDeleteTarget = null;
  }

  protected async confirmDeleteService(): Promise<void> {
    const service = this.serviceDeleteTarget;
    if (!service) return;
    await this.store.run(async () => {
      await this.api.deleteService(service.id);
      this.serviceDeleteTarget = null;
      await this.store.loadWorkspace();
    });
  }

  private cancelServiceEdit(): void {
    this.editingServiceId = '';
    this.serviceForm = { name: '', durationMinutes: 60, price: 0 };
  }
}
