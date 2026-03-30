import { useEffect } from 'react';

/**
 * Usage:
 * <ConfirmDialog
 *   open={showConfirm}
 *   title="Delete Venture?"
 *   message="This cannot be undone."
 *   confirmLabel="Delete"
 *   danger
 *   onConfirm={handleDelete}
 *   onCancel={() => setShowConfirm(false)}
 * />
 */
export default function ConfirmDialog({
  open, title, message,
  confirmLabel = 'Confirm', cancelLabel = 'Cancel',
  danger = false,
  onConfirm, onCancel,
}) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = e => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="modal-overlay confirm-dialog-overlay"
      onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="modal-card confirm-dialog-card">
        <div className="modal-glow confirm-dialog-glow" />

        <div className="confirm-dialog-icon">
          {danger ? '⚠️' : '❓'}
        </div>

        <h2 className="confirm-dialog-title">
          {title}
        </h2>

        {message && (
          <p className="confirm-dialog-message">
            {message}
          </p>
        )}

        <div className="confirm-dialog-actions">
          <button
            onClick={onConfirm}
            className={`${danger ? 'btn-danger' : 'btn-primary'} confirm-dialog-btn`}
          >
            {confirmLabel}
          </button>
          <button onClick={onCancel} className="btn-ghost confirm-dialog-btn">
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}