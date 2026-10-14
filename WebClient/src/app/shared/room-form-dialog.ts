import { ChangeDetectionStrategy, Component, OnInit, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { MassageApi } from '../core/massage-api';
import { Room } from '../core/models';
import { WorkspaceStore } from '../core/workspace.store';

/** Create/edit dialog for a room, used by both the Room Board and the Team page. */
@Component({
  // Pages keep async results in their own fields; Eager lets the shell's markForCheck (via store.run) refresh them.
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [FormsModule, NgSelectModule],
  selector: 'app-room-form-dialog',
  styles: ':host { display: contents; }',
  styleUrl: '../workspace.scss',
  template: `
    <div class="user-dialog-backdrop" (click)="closed.emit()">
      <section class="user-dialog" role="dialog" aria-modal="true" aria-labelledby="room-dialog-title" (click)="$event.stopPropagation()">
        <div class="panel-heading"><div><h2 id="room-dialog-title">{{ room() ? 'แก้ไขห้องบริการ' : 'เพิ่มห้องบริการ' }}</h2><p>กำหนดห้องหรือเตียงสำหรับจัดคิว</p></div><button type="button" aria-label="ปิด" class="dialog-close" (click)="closed.emit()">×</button></div>
        <form class="form-stack" (ngSubmit)="save()">
          <label>สาขา<ng-select name="roomBranch" [(ngModel)]="form.branchId" [clearable]="false" [searchable]="false" required>@for (branch of store.activeBranches; track branch.id) { <ng-option [value]="branch.id">{{ branch.name }}</ng-option> }</ng-select></label>
          <label>ชื่อห้อง / เตียง<input name="roomName" [(ngModel)]="form.name" placeholder="เช่น ห้อง 01 หรือ เตียง A1" required maxlength="80"></label>
          <div class="form-actions"><button class="primary-button" type="submit" [disabled]="store.busy || !store.branches.length">{{ room() ? 'บันทึกการแก้ไข' : 'เพิ่มห้อง' }}</button><button class="customer-cancel-button" type="button" (click)="closed.emit()">ยกเลิก</button></div>
        </form>
      </section>
    </div>
  `,
})
export class RoomFormDialog implements OnInit {
  /** Room to edit, or null to create one in the working branch. */
  readonly room = input<Room | null>(null);
  readonly saved = output<void>();
  readonly closed = output<void>();
  protected form = { branchId: '', name: '' };

  constructor(
    protected readonly store: WorkspaceStore,
    private readonly api: MassageApi,
  ) {}

  ngOnInit(): void {
    const room = this.room();
    this.form = room ? { branchId: room.branchId, name: room.name } : { branchId: this.store.selectedBranchId, name: '' };
  }

  protected async save(): Promise<void> {
    const room = this.room();
    const error = await this.store.run(async () => {
      if (room) await this.api.updateRoom(room.id, this.form);
      else await this.api.createRoom(this.form);
      await this.store.loadWorkspace();
    });
    if (error === null) this.saved.emit();
  }
}
