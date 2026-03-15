import { useState } from 'react';

export default function LikeButton({ liked, count, onToggle, size = 'sm' }) {
  const [animating, setAnimating] = useState(false);

  const handleClick = async (e) => {
    e.stopPropagation();
    setAnimating(true);
    await onToggle();
    setTimeout(() => setAnimating(false), 300);
  };

  return (
    <button
      onClick={handleClick}
      title={liked ? 'Unlike' : 'Like'}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
        background: liked ? 'rgba(200,110,110,0.12)' : 'rgba(255,255,255,0.05)',
        border: `1px solid ${liked ? 'rgba(200,110,110,0.35)' : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 20, padding: size === 'sm' ? '0.25rem 0.6rem' : '0.35rem 0.85rem',
        cursor: 'pointer', transition: 'all 0.2s',
        transform: animating ? 'scale(1.2)' : 'scale(1)',
      }}
    >
      <span style={{
        fontSize: size === 'sm' ? '0.85rem' : '1rem',
        filter: liked ? 'none' : 'grayscale(1)',
        transition: 'filter 0.2s',
      }}>
        ❤️
      </span>
      <span style={{
        fontSize: size === 'sm' ? '0.72rem' : '0.82rem',
        fontWeight: 600,
        color: liked ? '#c86e6e' : '#888',
        transition: 'color 0.2s',
      }}>
        {count || 0}
      </span>
    </button>
  );
}