import { Appointment, Sale } from './models';

export function localDateValue(date: Date): string {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

/** Local-midnight bounds of a `YYYY-MM-DD` day, as ISO strings for API range queries. */
export function dayRange(dateValue: string): { from: string; to: string } {
  const from = new Date(`${dateValue}T00:00:00`);
  const to = new Date(from);
  to.setDate(to.getDate() + 1);
  return { from: from.toISOString(), to: to.toISOString() };
}

export function dateLabel(dateValue: string): string {
  return new Intl.DateTimeFormat('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })
    .format(new Date(`${dateValue}T12:00:00`));
}

export function timeLabel(value: string): string {
  return new Intl.DateTimeFormat('th-TH', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}

export function statusLabel(status: Appointment['status']): string {
  return status === 'Scheduled' ? 'นัดหมายแล้ว'
    : status === 'InProgress' ? 'กำลังให้บริการ'
      : status === 'Completed' ? 'เสร็จสิ้น' : 'ยกเลิก';
}

export function paymentMethodLabel(method: Sale['paymentMethod']): string {
  return { Cash: 'เงินสด', BankTransfer: 'QR พร้อมเพย์', Card: 'บัตรเครดิต' }[method];
}
