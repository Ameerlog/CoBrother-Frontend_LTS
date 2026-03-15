export default function Pagination({ page, totalPages, onPage, totalCount, pageSize = 20 }) {
    if (totalPages <= 1) return null;
  
    const from = (page - 1) * pageSize + 1;
    const to   = Math.min(page * pageSize, totalCount);
  
    // Build page numbers with ellipsis
    const getPages = () => {
      const pages = [];
      if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
        return pages;
      }
      pages.push(1);
      if (page > 3) pages.push('…');
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push('…');
      pages.push(totalPages);
      return pages;
    };
  
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: '0.75rem', marginTop: '2rem' }}>
        {/* Result count */}
        <div style={{ fontSize: '0.78rem', color: '#666' }}>
          Showing {from}–{to} of {totalCount} results
        </div>
  
        {/* Page buttons */}
        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center',
                      flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* Prev */}
          <PageBtn
            label="←"
            disabled={page === 1}
            onClick={() => onPage(page - 1)}
          />
  
          {getPages().map((p, i) =>
            p === '…' ? (
              <span key={`ellipsis-${i}`}
                style={{ color: '#555', padding: '0 0.25rem', fontSize: '0.85rem' }}>
                …
              </span>
            ) : (
              <PageBtn
                key={p}
                label={p}
                active={p === page}
                onClick={() => onPage(p)}
              />
            )
          )}
  
          {/* Next */}
          <PageBtn
            label="→"
            disabled={page === totalPages}
            onClick={() => onPage(page + 1)}
          />
        </div>
      </div>
    );
  }
  
  function PageBtn({ label, active, disabled, onClick }) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        style={{
          width: label === '←' || label === '→' ? 36 : 36,
          height: 36,
          borderRadius: 8,
          border: active
            ? '1px solid rgba(200,169,110,0.5)'
            : '1px solid rgba(255,255,255,0.08)',
          background: active
            ? 'rgba(200,169,110,0.15)'
            : disabled
            ? 'transparent'
            : 'rgba(255,255,255,0.03)',
          color: active ? '#c8a96e' : disabled ? '#444' : '#a0a0b0',
          fontWeight: active ? 700 : 400,
          fontSize: '0.85rem',
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {label}
      </button>
    );
  }