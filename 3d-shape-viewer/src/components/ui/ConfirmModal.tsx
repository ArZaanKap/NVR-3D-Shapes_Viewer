interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'danger',
}: ConfirmModalProps) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: (
        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      bgColor: 'bg-red-50',
      borderColor: 'border-red-100',
      confirmBg: 'bg-red-500 hover:bg-red-600',
      confirmShadow: 'shadow-red-500/25',
    },
    warning: {
      icon: (
        <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100',
      confirmBg: 'bg-amber-500 hover:bg-amber-600',
      confirmShadow: 'shadow-amber-500/25',
    },
    info: {
      icon: (
        <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      confirmBg: 'bg-blue-500 hover:bg-blue-600',
      confirmShadow: 'shadow-blue-500/25',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className={`w-12 h-12 mx-auto mb-4 rounded-xl ${styles.bgColor} ${styles.borderColor} border flex items-center justify-center`}>
          {styles.icon}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-center text-slate-800 mb-2">
          {title}
        </h3>

        {/* Message */}
        <p className="text-slate-500 text-center text-sm mb-6">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all active:scale-[0.98]"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 px-4 rounded-xl font-medium text-white ${styles.confirmBg} transition-all shadow-lg ${styles.confirmShadow} active:scale-[0.98]`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
