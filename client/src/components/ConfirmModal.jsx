import './ConfirmModal.css';

const ConfirmModal = ({ title, message, confirmLabel = 'Delete', cancelLabel = 'Cancel', onConfirm, onCancel, loading = false, variant = 'danger' }) => {
  return (
    <div className="confirm-modal-backdrop" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
        {/* this is forIcon */}
        <div className={`confirm-modal-icon ${variant}`}>
          {variant === 'danger' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
        </div>

        {/* this is for Content */}
        <h3 className="confirm-modal-title">{title || 'Are you sure?'}</h3>
        <p className="confirm-modal-message">{message}</p>

        {/* this is forActions */}
        <div className="confirm-modal-actions">
          <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </button>
          <button className={`btn btn-${variant}`} onClick={onConfirm} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner spinner-sm"></span>
                Deleting...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
