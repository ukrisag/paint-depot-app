import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, ConfirmDialog } from '../../../services/notification.service';

@Component({
  selector: 'app-confirm-dialog',
  imports: [CommonModule],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
})
export class ConfirmDialogComponent {
  constructor(public notificationService: NotificationService) {}

  confirm(dialog: ConfirmDialog) {
    if (dialog?.onConfirm) {
      dialog.onConfirm();
    }
    this.close();
  }

  cancel(dialog: ConfirmDialog) {
    if (dialog?.onCancel) {
      dialog.onCancel();
    }
    this.close();
  }

  close() {
    this.notificationService.closeConfirmDialog();
  }
}
