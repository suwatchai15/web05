import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Branch } from '@app/core';

type Section = 'overview' | 'pos' | 'booking' | 'rooms' | 'appointments' | 'services' | 'team' | 'customers' | 'branches' | 'users';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="topbar">
      <div class="mobile-brand">
        <span class="brand-mark">S</span>
        <strong>SABAI</strong>
      </div>
      <div class="topbar-heading">
        <p>{{ todayLabel }}</p>
        <h1>{{ activeSectionLabel }}</h1>
      </div>
      <div class="topbar-actions">
        <button class="current-branch-button" 
          type="button" 
          (click)="openBranch()" 
          [disabled]="!branches.length" 
          aria-label="เปลี่ยนสาขา">
          <span aria-hidden="true">⌖</span>
          <span>{{ currentBranchName }}</span>
          <small>เปลี่ยนสาขา</small>
        </button>
        <span class="connected-badge">
          <span></span> เชื่อมต่อแล้ว
        </span>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      position: sticky;
      top: 0;
      z-index: 3;
      display: grid;
      grid-template-columns: 227px 1fr auto;
      align-items: center;
      gap: 24px;
      height: 78px;
      padding: 0 24px;
      border-bottom: 1px solid #e5e9e3;
      background: #fff;
      box-shadow: 0 2px 4px rgb(0 0 0 / 2%);
    }
  `],
})
export class TopbarComponent {
  @Input() todayLabel = '';
  @Input() activeSectionLabel = '';
  @Input() currentBranchName = 'เลือกสาขา';
  @Input() branches: Branch[] = [];

  @Output() branchOpen = new EventEmitter<void>();

  openBranch(): void {
    this.branchOpen.emit();
  }
}
