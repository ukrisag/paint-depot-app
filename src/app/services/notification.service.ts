import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface ConfirmDialog {
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  private confirmDialogSubject = new BehaviorSubject<ConfirmDialog | null>(null);
  public confirmDialog$ = this.confirmDialogSubject.asObservable();

  private toastIdCounter = 0;
  private readonly MAX_TOASTS = 3; // จำนวน toast สูงสุดที่แสดงพร้อมกัน
  private toastTimeouts: Map<number, any> = new Map(); // เก็บ timeout ของแต่ละ toast

  constructor() {}

  /**
   * Show success toast
   */
  success(message: string) {
    this.showToast(message, 'success');
  }

  /**
   * Show error toast
   */
  error(message: string) {
    this.showToast(message, 'error');
  }

  /**
   * Show info toast
   */
  info(message: string) {
    this.showToast(message, 'info');
  }

  /**
   * Show toast notification
   */
  private showToast(message: string, type: 'success' | 'error' | 'info') {
    const currentToasts = this.toastsSubject.value;

    // ตรวจสอบว่ามี toast ข้อความเดียวกันอยู่แล้วหรือไม่
    const duplicateToast = currentToasts.find(
      t => t.message === message && t.type === type
    );

    if (duplicateToast) {
      // ถ้ามี toast ข้อความเดียวกันอยู่แล้ว ไม่เพิ่มใหม่
      return;
    }

    // ลบ timeout ของ toast เก่าทั้งหมด
    currentToasts.forEach(t => {
      const timeout = this.toastTimeouts.get(t.id);
      if (timeout) {
        clearTimeout(timeout);
        this.toastTimeouts.delete(t.id);
      }
    });

    const toast: Toast = {
      id: ++this.toastIdCounter,
      message,
      type
    };

    // ถ้ามี toast เกิน MAX_TOASTS ให้ลบอันเก่าสุดออก
    let newToasts = [...currentToasts, toast];
    if (newToasts.length > this.MAX_TOASTS) {
      const removedToasts = newToasts.slice(0, newToasts.length - this.MAX_TOASTS);
      removedToasts.forEach(t => {
        const timeout = this.toastTimeouts.get(t.id);
        if (timeout) {
          clearTimeout(timeout);
          this.toastTimeouts.delete(t.id);
        }
      });
      newToasts = newToasts.slice(-this.MAX_TOASTS);
    }

    this.toastsSubject.next(newToasts);

    // Auto remove after 3 seconds
    const timeout = setTimeout(() => {
      this.removeToast(toast.id);
    }, 3000);

    this.toastTimeouts.set(toast.id, timeout);
  }

  /**
   * Remove toast by id
   */
  removeToast(id: number) {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter(t => t.id !== id));

    // ลบ timeout ของ toast ที่ถูกลบ
    const timeout = this.toastTimeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this.toastTimeouts.delete(id);
    }
  }

  /**
   * Show confirm dialog
   */
  confirm(
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText: string = 'ยืนยัน',
    cancelText: string = 'ยกเลิก'
  ) {
    this.confirmDialogSubject.next({
      message,
      confirmText,
      cancelText,
      onConfirm,
      onCancel
    });
  }

  /**
   * Close confirm dialog
   */
  closeConfirmDialog() {
    this.confirmDialogSubject.next(null);
  }
}
