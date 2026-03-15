export default function SkeletonCard() {
    return (
      <div className="venture-card" style={{ pointerEvents: 'none' }}>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem',
                      alignItems: 'center' }}>
          <Bone style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <Bone style={{ height: 12, width: '60%', borderRadius: 6 }} />
            <Bone style={{ height: 10, width: '40%', borderRadius: 6 }} />
          </div>
        </div>
        <Bone style={{ height: 14, width: '80%', borderRadius: 6, marginBottom: '0.5rem' }} />
        <Bone style={{ height: 10, width: '100%', borderRadius: 6, marginBottom: '0.3rem' }} />
        <Bone style={{ height: 10, width: '90%', borderRadius: 6, marginBottom: '1rem' }} />
        <Bone style={{ height: 10, width: '35%', borderRadius: 6, marginBottom: '1.25rem' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Bone style={{ height: 10, width: '25%', borderRadius: 6 }} />
          <Bone style={{ height: 30, width: '30%', borderRadius: 8 }} />
        </div>
      </div>
    );
  }
  
  function Bone({ style }) {
    return (
      <div style={{
        background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.5s infinite',
        ...style,
      }} />
    );
  }
  
  // Add to your global CSS:
  // @keyframes skeleton-shimmer {
  //   0%   { background-position: 200% 0; }
  //   100% { background-position: -200% 0; }
  // }