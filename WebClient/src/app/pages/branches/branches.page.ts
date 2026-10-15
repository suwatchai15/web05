import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { MassageApi } from '../../core/massage-api';
import { Branch } from '../../core/models';
import { WorkspaceStore } from '../../core/workspace.store';

const emptyBranchForm = () => ({ name: '', address: '', timeZone: 'Asia/Bangkok' });

@Component({
  // Pages keep async results in their own fields; Eager lets the shell's markForCheck (via store.run) refresh them.
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, NgSelectModule],
  selector: 'app-branches-page',
  styles: ':host { display: contents; }',
  styleUrl: '../../workspace.scss',
  templateUrl: './branches.page.html',
})
export class BranchesPage {
  protected branchForm = emptyBranchForm();
  protected editingBranchId = '';
  protected branchFormDialogOpen = false;
  protected branchDeleteTarget: Branch | null = null;

  constructor(
    protected readonly store: WorkspaceStore,
    private readonly api: MassageApi,
  ) {}

  protected openBranchCreate(): void {
    this.store.errorMessage = '';
    this.editingBranchId = '';
    this.branchForm = emptyBranchForm();
    this.branchFormDialogOpen = true;
  }

  protected editBranch(branch: Branch): void {
    this.editingBranchId = branch.id;
    this.branchForm = { name: branch.name, address: branch.address ?? '', timeZone: branch.timeZone };
    this.branchFormDialogOpen = true;
  }

  protected closeBranchForm(): void {
    this.branchFormDialogOpen = false;
    this.editingBranchId = '';
    this.branchForm = emptyBranchForm();
    this.store.errorMessage = '';
  }

  protected async createBranch(): Promise<void> {
    await this.store.run(async () => {
      const createdBranch = this.editingBranchId ? null : await this.api.createBranch(this.branchForm);
      if (this.editingBranchId) await this.api.updateBranch(this.editingBranchId, this.branchForm);
      this.editingBranchId = '';
      this.branchForm = emptyBranchForm();
      this.branchFormDialogOpen = false;
      await this.store.loadWorkspace();
      // Offer to switch to the branch that was just created.
      if (createdBranch) this.store.openBranchDialog(createdBranch.id);
    });
  }

  protected openBranchDeleteConfirm(branch: Branch): void {
    this.store.errorMessage = '';
    this.branchDeleteTarget = branch;
  }

  protected cancelBranchDelete(): void {
    if (!this.store.busy) this.branchDeleteTarget = null;
  }

  protected async confirmDeleteBranch(): Promise<void> {
    const branch = this.branchDeleteTarget;
    if (!branch) return;
    const error = await this.store.run(async () => {
      await this.api.deleteBranch(branch.id);
      await this.store.loadWorkspace();
    });
    if (error === null) this.branchDeleteTarget = null;
  }
}
