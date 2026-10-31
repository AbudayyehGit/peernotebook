/**
 * Peer Notebook - Centralized Toast Notification & Error Feedback Service
 * GA #8 Standard • Client-Side Event-Driven Architecture • Plain-English Terminology
 * Forces visible frontend feedback for all email dispatch, registration, and network failures.
 */

export type ToastType = 'error' | 'warning' | 'success' | 'info';

export interface ToastPayload {
  id?: string;
  title: string;
  message: string;
  type?: ToastType;
  technicalDetail?: string;
  smtpCode?: string | number;
  durationMs?: number;
  actionLabel?: string;
  onAction?: () => void;
}

export interface ActiveToast extends ToastPayload {
  id: string;
  type: ToastType;
  timestamp: string;
}

class ToastService {
  private history: ActiveToast[] = [];

  /**
   * Dispatch a generic toast notification
   */
  public show(toast: ToastPayload): string {
    const id = toast.id || `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const fullToast: ActiveToast = {
      ...toast,
      id,
      type: toast.type || 'info',
      timestamp: new Date().toISOString()
    };

    this.history.unshift(fullToast);
    if (this.history.length > 50) {
      this.history = this.history.slice(0, 50);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('peernotebook:toast', {
          detail: fullToast
        })
      );
    }

    return id;
  }

  /**
   * Error toast - prominent alert with technical code if present
   */
  public error(title: string, message: string, technicalDetail?: string, smtpCode?: string | number): string {
    return this.show({
      title,
      message,
      type: 'error',
      technicalDetail,
      smtpCode,
      durationMs: 8000 // Error alerts persist longer for user review
    });
  }

  /**
   * Warning toast
   */
  public warning(title: string, message: string, technicalDetail?: string): string {
    return this.show({
      title,
      message,
      type: 'warning',
      technicalDetail,
      durationMs: 6500
    });
  }

  /**
   * Success toast
   */
  public success(title: string, message: string): string {
    return this.show({
      title,
      message,
      type: 'success',
      durationMs: 4500
    });
  }

  /**
   * Informational toast
   */
  public info(title: string, message: string): string {
    return this.show({
      title,
      message,
      type: 'info',
      durationMs: 5000
    });
  }

  /**
   * Get toast notification history
   */
  public getHistory(): ActiveToast[] {
    return [...this.history];
  }

  /**
   * Clear history
   */
  public clearHistory(): void {
    this.history = [];
  }
}

export const toastService = new ToastService();
