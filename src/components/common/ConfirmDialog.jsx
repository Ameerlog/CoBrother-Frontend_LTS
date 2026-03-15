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
    <div className="modal-overlay"
      onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="modal-card" style={{ maxWidth: 400, textAlign: 'center' }}>
        <div className="modal-glow" />

        <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>
          {danger ? '⚠️' : '❓'}
        </div>

        <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem',
                     marginBottom: '0.5rem' }}>
          {title}
        </h2>

        {message && (
          <p style={{ color: '#a0a0b0', fontSize: '0.875rem',
                      marginBottom: '1.5rem', lineHeight: 1.6 }}>
            {message}
          </p>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            onClick={onConfirm}
            className={danger ? 'btn-danger' : 'btn-primary'}
            style={{ minWidth: 100 }}
          >
            {confirmLabel}
          </button>
          <button onClick={onCancel} className="btn-ghost" style={{ minWidth: 80 }}>
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
}