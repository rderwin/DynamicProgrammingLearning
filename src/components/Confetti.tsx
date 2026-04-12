import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  delay: number;
  drift: number;
  spin: number;
  shape: "rect" | "circle";
}

const COLORS = ["#3b82f6", "#8b5cf6", "#22c55e", "#f59e0b", "#ef4444", "#ec4899", "#06b6d4", "#f97316"];

export default function Confetti({ duration = 3000 }: { duration?: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const count = 50;
    const generated: Particle[] = [];
    for (let i = 0; i < count; i++) {
      generated.push({
        id: i,
        x: Math.random() * 100,
        y: -5 - Math.random() * 15,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 6 + Math.random() * 6,
        rotation: Math.random() * 360,
        delay: Math.random() * 600,
        drift: (Math.random() - 0.5) * 120,
        spin: 360 + Math.random() * 720,
        shape: Math.random() > 0.5 ? "rect" : "circle",
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
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.shape === "circle" ? p.size : p.size * 0.5,
            backgroundColor: p.color,
            borderRadius: p.shape === "circle" ? "50%" : "2px",
            transform: `rotate(${p.rotation}deg)`,
            animation: `confettiFall ${1.8 + Math.random() * 0.8}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${p.delay}ms both`,
            // @ts-ignore — CSS custom properties
            "--confetti-drift": `${p.drift}px`,
            "--confetti-spin": `${p.spin}deg`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
