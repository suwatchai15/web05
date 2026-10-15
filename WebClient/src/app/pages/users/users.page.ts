import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { MassageApi } from '../../core/massage-api';
import { TenantUser } from '../../core/models';
import { WorkspaceStore } from '../../core/workspace.store';

type UserForm = { email: string; password: string; role: TenantUser['role'] };

const emptyUserForm = (): UserForm => ({ email: '', password: '', role: 'Staff' });

@Component({
  // Pages keep async results in their own fields; Eager lets the shell's markForCheck (via store.run) refresh them.
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, NgSelectModule],
  selector: 'app-users-page',
  styles: ':host { display: contents; }',
  styleUrl: '../../workspace.scss',
  templateUrl: './users.page.html',
})
export class UsersPage implements OnInit {
  protected users: TenantUser[] = [];
  protected userForm = emptyUserForm();
  protected editingUserId = '';
  protected userDialogOpen = false;
  protected userDeleteTarget: TenantUser | null = null;

  constructor(
    protected readonly store: WorkspaceStore,
    private readonly api: MassageApi,
  ) {}

  ngOnInit(): void {
    if (!this.store.canManage) return;
    void this.store.run(async () => {
      this.users = await this.api.users();
    });
  }

  protected openUserCreate(): void {
    this.store.errorMessage = '';
    this.editingUserId = '';
    this.userForm = emptyUserForm();
    this.userDialogOpen = true;
  }

  protected editUser(user: TenantUser): void {
    this.store.errorMessage = '';
    this.editingUserId = user.id;
    this.userForm = { email: user.email, password: '', role: user.role };
    this.userDialogOpen = true;
  }

  protected closeUserDialog(): void {
    this.store.errorMessage = '';
    this.userDialogOpen = false;
    this.editingUserId = '';
    this.userForm = emptyUserForm();
  }

  protected async saveUser(): Promise<void> {
    await this.store.run(async () => {
      if (this.editingUserId) {
        const update = { email: this.userForm.email, role: this.userForm.role, ...(this.userForm.password ? { password: this.userForm.password } : {}) };
        await this.api.updateUser(this.editingUserId, update);
      } else {
        await this.api.createUser({ ...this.userForm, role: this.userForm.role as 'Manager' | 'Staff' });
      }
      this.users = await this.api.users();
      this.closeUserDialog();
    });
  }

  protected async toggleUserActive(user: TenantUser): Promise<void> {
    await this.store.run(async () => {
      await this.api.setUserActive(user.id, !user.isActive);
      this.users = await this.api.users();
    });
  }

  protected openUserDeleteConfirm(user: TenantUser): void {
    this.store.errorMessage = '';
    this.userDeleteTarget = user;
  }

  protected cancelUserDelete(): void {
    if (!this.store.busy) this.userDeleteTarget = null;
  }

  protected async confirmDeleteUser(): Promise<void> {
    const user = this.userDeleteTarget;
    if (!user || user.role === 'Owner' || user.id === this.store.currentUserId) return;
    const error = await this.store.run(async () => {
      await this.api.deleteUser(user.id);
      this.users = await this.api.users();
    });
    if (error === null) this.userDeleteTarget = null;
  }
}
