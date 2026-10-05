import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { Room, Branch, RoomFormComponent } from '@app/core';

@Component({
  selector: 'app-rooms-page',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  template: `
    <div class="rooms-page">
      <div class="rooms-header">
        <h1>ห้อง / เตียง</h1>
        <div class="rooms-controls">
          <input type="text" 
            class="rooms-search-input"
            placeholder="ค้นหาห้อง" 
            [(ngModel)]="roomSearch"
            (ngModelChange)="onSearchChange()">
          <select [(ngModel)]="roomBoardFilter" (ngModelChange)="onFilterChange()" class="rooms-filter">
            <option value="all">ทั้งหมด ({{ roomStatusCounts['all'] }})</option>
            <option value="available">ว่าง ({{ roomStatusCounts['available'] }})</option>
            <option value="busy">ใช้งาน ({{ roomStatusCounts['busy'] }})</option>
            <option value="booked">จอง ({{ roomStatusCounts['booked'] }})</option>
            <option value="disabled">ปิด ({{ roomStatusCounts['disabled'] }})</option>
          </select>
          <button class="rooms-create-button" (click)="openCreateRoom()">+ สร้างห้องใหม่</button>
        </div>
      </div>
      <div class="rooms-grid">
        @for (room of filteredRooms; track room.id) {
          <div class="room-card" [class]="'room-status-' + getRoomStatus(room)">
            <div class="room-header">
              <h3>{{ room.name }}</h3>
              <span class="room-status-badge">{{ getRoomStatusLabel(room) }}</span>
            </div>
            <div class="room-actions">
              <button class="room-edit-button" (click)="editRoom(room)">แก้ไข</button>
              <button class="room-delete-button" (click)="deleteRoom(room)">ลบ</button>
            </div>
          </div>
        }
      </div>
      @if (roomCreateOpen) {
        <div class="rooms-dialog-overlay" (click)="closeDialog()">
          <div class="rooms-dialog-content" (click)="$event.stopPropagation()">
            <h2>{{ editingRoomId ? 'แก้ไขห้อง' : 'สร้างห้องใหม่' }}</h2>
            <p>Room form dialog - TBD</p>
            <button (click)="closeDialog()">ปิด</button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .rooms-page { padding: 24px; background: #f5f6f2; min-height: calc(100vh - 78px); }
    .rooms-header { margin-bottom: 24px; }
    .rooms-header h1 { margin: 0 0 16px 0; font-size: 24px; }
    .rooms-controls { display: flex; gap: 12px; }
    .rooms-search-input, .rooms-filter { padding: 8px 12px; border: 1px solid #d0d8cf; border-radius: 4px; }
    .rooms-create-button { padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .rooms-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
    .room-card { padding: 16px; background: white; border-radius: 8px; border-left: 4px solid #10b981; }
    .room-status-available { border-left-color: #10b981; }
    .room-status-busy { border-left-color: #f59e0b; }
    .room-status-booked { border-left-color: #6366f1; }
    .room-status-disabled { border-left-color: #ef4444; }
    .room-header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px; }
    .room-header h3 { margin: 0; font-size: 16px; }
    .room-status-badge { font-size: 11px; padding: 4px 8px; background: #e5e7eb; border-radius: 4px; }
    .room-actions { display: flex; gap: 8px; }
    .room-edit-button, .room-delete-button { padding: 6px 12px; border: 1px solid #d0d8cf; border-radius: 4px; cursor: pointer; }
    .room-delete-button { color: #dc2626; border-color: #fecaca; }
    .rooms-dialog-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10; }
    .rooms-dialog-content { background: white; padding: 24px; border-radius: 8px; max-width: 500px; width: 90vw; }
  `],
})
export class RoomsPageComponent {
  @Input() filteredRooms: Room[] = [];
  @Input() roomSearch = '';
  @Input() roomBoardFilter: 'all' | 'available' | 'busy' | 'booked' | 'disabled' = 'all';
  @Input() roomStatusCounts: Record<string, number> = {};
  @Input() roomCreateOpen = false;
  @Input() editingRoomId = '';

  @Output() searchChange = new EventEmitter<string>();
  @Output() filterChange = new EventEmitter<string>();
  @Output() createRoom = new EventEmitter<void>();
  @Output() editRoomEvent = new EventEmitter<Room>();
  @Output() deleteRoomEvent = new EventEmitter<Room>();
  @Output() closeDialogEvent = new EventEmitter<void>();

  onSearchChange(): void { this.searchChange.emit(this.roomSearch); }
  onFilterChange(): void { this.filterChange.emit(this.roomBoardFilter); }
  openCreateRoom(): void { this.createRoom.emit(); }
  editRoom(room: Room): void { this.editRoomEvent.emit(room); }
  deleteRoom(room: Room): void { this.deleteRoomEvent.emit(room); }
  closeDialog(): void { this.closeDialogEvent.emit(); }
  getRoomStatus(room: Room): string { return 'available'; }
  getRoomStatusLabel(room: Room): string { return 'ว่าง'; }
}
