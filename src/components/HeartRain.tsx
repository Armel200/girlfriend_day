/* ============================================================
   PLUIE DE CŒURS — grande finale
   ============================================================ */
import { useMemo } from "react";

const EMOJIS = ["❤️", "💖", "💕", "💘", "💝", "💗", "💞"];

export default function HeartRain({ count = 46 }: { count?: number }) {
  const hearts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x: Math.random() * 100,
        size: 16 + Math.random() * 30,
        dur: 5 + Math.random() * 6,
        delay: Math.random() * 9,
        drift: (Math.random() - 0.5) * 220,
        rot: 160 + Math.random() * 380,
        o: 0.5 + Math.random() * 0.5,
        emoji: EMOJIS[i % EMOJIS.length],
      })),
    [count]
  );

  return (
    <div className="heart-rain" aria-hidden>
      {hearts.map((h, i) => (
        <span
          key={i}
          className="heart"
          style={
            {
              "--x": `${h.x}%`,
              "--size": `${h.size}px`,
              "--dur": `${h.dur}s`,
              "--delay": `${h.delay}s`,
              "--drift": `${h.drift}px`,
              "--rot": `${h.rot}deg`,
              "--o": h.o,
            } as React.CSSProperties
          }
        >
          {h.emoji}
        </span>
      ))}
    </div>
  );
}
