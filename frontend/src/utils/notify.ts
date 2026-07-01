export type ToastType = 'success' | 'error' | 'info';

export interface ToastPayload {
  id?: string;
  type: ToastType;
  title: string;
  message?: string;
}

const dispatchToast = (payload: ToastPayload) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('mkulima-toast', { detail: payload }));
};

export const notifySuccess = (title: string, message?: string) => {
  dispatchToast({ type: 'success', title, message });
};

export const notifyError = (title: string, message?: string) => {
  dispatchToast({ type: 'error', title, message });
};

export const notifyInfo = (title: string, message?: string) => {
  dispatchToast({ type: 'info', title, message });
};
