import { Injectable } from '@angular/core';
import { Appointment, MassageService, Sale } from './models';

export type PosCartItem = { service: MassageService; quantity: number };

/**
 * The POS cart outlives the POS page so staff can switch menus mid-sale,
 * and Booking hands an appointment over to POS for payment through it.
 */
@Injectable({ providedIn: 'root' })
export class PosSession {
  cart: PosCartItem[] = [];
  customerId = '';
  staffId = '';
  roomId = '';
  paymentMethod: Sale['paymentMethod'] = 'Cash';
  /** Appointment being paid for; the sale is linked to it so Booking shows it as paid. */
  pendingAppointment: Appointment | null = null;
  lastSale: Sale | null = null;
  /** Service currently dragged from the POS catalog onto the Booking page. */
  draggedServiceId = '';

  startCheckout(appointment: Appointment, service: MassageService): void {
    this.customerId = appointment.customerId;
    this.staffId = appointment.staffId;
    this.roomId = appointment.roomId;
    this.cart = [{ service, quantity: 1 }];
    this.pendingAppointment = appointment;
    this.lastSale = null;
  }

  /** Empties the cart and drops the appointment it was paying for. */
  clearCart(): void {
    this.cart = [];
    this.pendingAppointment = null;
  }

  reset(): void {
    this.cart = [];
    this.customerId = '';
    this.staffId = '';
    this.roomId = '';
    this.paymentMethod = 'Cash';
    this.pendingAppointment = null;
    this.lastSale = null;
    this.draggedServiceId = '';
  }
}
