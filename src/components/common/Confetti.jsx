const COLORS = ['#9440dd', '#7c3aed', '#6366f1', '#00C3FF', '#fbbf24', '#ec4899', '#10b981', '#f97316'];
const SHAPES = ['circle', 'square', 'rectangle'];

function randomBetween(a, b) {
  return a + Math.random() * (b - a);
}

export default function Confetti({ show }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {[...Array(120)].map((_, i) => {
        const shape = SHAPES[i % SHAPES.length];
        const color = COLORS[i % COLORS.length];
        const size = randomBetween(6, 14);
        const left = randomBetween(0, 100);
        const delay = randomBetween(0, 1.2);
        const duration = randomBetween(3.5, 6);
        const rotation = randomBetween(-360, 360);

        const style = {
          left: `${left}%`,
          top: '-20px',
          backgroundColor: color,
          animationDelay: `${delay}s`,
          '--duration': `${duration}s`,
          '--rotation': `${rotation}deg`,
          borderRadius: shape === 'circle' ? '50%' : shape === 'square' ? '2px' : '2px',
          width:  shape === 'rectangle' ? `${size * 1.8}px` : `${size}px`,
          height: shape === 'rectangle' ? `${size * 0.6}px` : `${size}px`,
          opacity: 0.9,
        };

        return (
          <div
            key={i}
            className="absolute animate-confetti-fall"
            style={style}
          />
        );
      })}
    </div>
  );
}
