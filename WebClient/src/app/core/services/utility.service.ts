import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UtilityService {
  /**
   * Convert date to local date string (YYYY-MM-DD)
   */
  localDateValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Get empty week schedule (7 days with empty shifts)
   */
  emptyWeek() {
    return Array.from({ length: 7 }, (_, i) => ({ dayOfWeek: i, shifts: [] }));
  }

  /**
   * Format time label from ISO string
   */
  timeLabel(isoString: string): string {
    return new Date(isoString).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Get status label in Thai
   */
  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      'Scheduled': 'นัดหมายแล้ว',
      'InProgress': 'กำลังให้บริการ',
      'Completed': 'เสร็จสิ้น',
      'Cancelled': 'ยกเลิกแล้ว',
      'Paid': 'ชำระแล้ว',
    };
    return labels[status] ?? status;
  }

  /**
   * Format currency (Thai Baht)
   */
  formatCurrency(amount: number): string {
    return `฿${amount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  /**
   * Get formatted date label in Thai
   */
  getDateLabel(date: Date, format: 'short' | 'long' = 'short'): string {
    if (format === 'short') {
      return new Intl.DateTimeFormat('th-TH', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(date);
    }
    return new Intl.DateTimeFormat('th-TH', {
      day: 'numeric',
      month: 'long',
      weekday: 'long',
      year: 'numeric',
    }).format(date);
  }

  /**
   * Generate time slots (30-minute intervals)
   */
  generateTimeSlots(startHour: number = 9, endHour: number = 22): string[] {
    return Array.from({ length: (endHour - startHour) * 2 + 1 }, (_, index) => {
      const minutes = (startHour * 60 + index * 30);
      return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
    });
  }

  /**
   * Check if time slot is available
   */
  isTimeAvailable(startTime: Date, endTime: Date, appointments: any[], staffId: string, roomId: string): boolean {
    return !appointments.some((apt) =>
      apt.staffId === staffId &&
      apt.roomId === roomId &&
      apt.status !== 'Cancelled' &&
      new Date(apt.startsAt) < endTime &&
      new Date(apt.endsAt) > startTime
    );
  }
}
