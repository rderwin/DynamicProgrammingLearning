import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  delay: number;
}

const COLORS = ["#3b82f6", "#8b5cf6", "#22c55e", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4"];

export default function Confetti({ duration = 2500 }: { duration?: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const count = 40;
    const generated: Particle[] = [];
    for (let i = 0; i < count; i++) {
      generated.push({
        id: i,
        x: 20 + Math.random() * 60, // % from left
        y: -10 - Math.random() * 20, // start above viewport
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 6 + Math.random() * 8,
        rotation: Math.random() * 360,
        delay: Math.random() * 400,
      });
    }
    setParticles(generated);

    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute confetti-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size * 0.6,
            backgroundColor: p.color,
            borderRadius: "2px",
            transform: `rotate(${p.rotation}deg)`,
            animationDelay: `${p.delay}ms`,
          }}
        />
      ))}
    </div>
  );
}
