import { Component, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, ConfirmDialog } from '../../../services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirm-dialog',
  imports: [CommonModule],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDialogComponent implements OnDestroy {
  private dialogSubscription?: Subscription;

  constructor(public notificationService: NotificationService) {}

  ngOnDestroy() {
    this.dialogSubscription?.unsubscribe();
  }

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
