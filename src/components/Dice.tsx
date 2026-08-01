/* ============================================================
   DÉ MAGIQUE 3D — animation réaliste avec GSAP
   6 faces en CSS 3D, rotation multi-axes, rebond, son.
   ============================================================ */
import { useRef, useState } from "react";
import gsap from "gsap";

/* Positions des points selon la valeur (grille 3x3) */
const PIPS: Record<number, [number, number][]> = {
  1: [[1, 1]],
  2: [[0, 2], [2, 0]],
  3: [[0, 2], [1, 1], [2, 0]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
};

/* Orientation finale (rotationX, rotationY) pour afficher chaque face */
const BASE: Record<number, { x: number; y: number }> = {
  1: { x: 0, y: 0 },
  2: { x: 0, y: 90 },
  3: { x: -90, y: 0 },
  4: { x: 90, y: 0 },
  5: { x: 0, y: -90 },
  6: { x: 0, y: 180 },
};

/* Transform 3D de chaque face du cube (dé opposé : 1-6, 2-5, 3-4) */
const FACE_TRANSFORMS = [
  "rotateY(0deg) translateZ(48px)", // 1 — avant
  "rotateY(90deg) translateZ(48px)", // 2 — droite
  "rotateY(180deg) translateZ(48px)", // 6 — arrière
  "rotateY(-90deg) translateZ(48px)", // 5 — gauche
  "rotateX(90deg) translateZ(48px)", // 3 — haut
  "rotateX(-90deg) translateZ(48px)", // 4 — bas
];

function Face({ value }: { value: number }) {
  const pips = PIPS[value];
  return (
    <div className="dice-face" style={{ transform: FACE_TRANSFORMS[value - 1] }}>
      <div className="grid grid-cols-3 grid-rows-3 gap-2">
        {Array.from({ length: 9 }, (_, i) => {
          const row = Math.floor(i / 3);
          const col = i % 3;
          const on = pips.some(([r, c]) => r === row && c === col);
          return <div key={i} className="flex h-5 w-5 items-center justify-center">{on ? <div className="dice-pip" /> : null}</div>;
        })}
      </div>
    </div>
  );
}

interface DiceProps {
  disabled: boolean;
  onRollStart: () => void;
  onRollEnd: (value: number) => void;
}

export default function Dice({ disabled, onRollStart, onRollEnd }: DiceProps) {
  const sceneRef = useRef<HTMLDivElement>(null);
  const cubeRef = useRef<HTMLDivElement>(null);
  const [rolling, setRolling] = useState(false);

  const roll = () => {
    if (disabled || rolling) return;
    setRolling(true);
    onRollStart();

    const value = 1 + Math.floor(Math.random() * 6);
    const base = BASE[value];
    const spins = 2 + Math.floor(Math.random() * 3);
    const dirX = Math.random() < 0.5 ? -1 : 1;
    const dirY = Math.random() < 0.5 ? -1 : 1;
    const rx = base.x + 360 * spins * dirX;
    const ry = base.y + 360 * spins * dirY;
    const rz = 360 * (1 + Math.floor(Math.random() * 2)) * (Math.random() < 0.5 ? -1 : 1);

    const tl = gsap.timeline({
      onComplete: () => {
        setRolling(false);
        onRollEnd(value);
      },
    });

    // Rotation rapide et réaliste + rebonds
    tl.to(cubeRef.current, {
      rotationX: rx,
      rotationY: ry,
      rotationZ: rz,
      transformPerspective: 900,
      duration: 1.5,
      ease: "power3.inOut",
    })
      .to(sceneRef.current, { scale: 1.18, duration: 0.16, yoyo: true, repeat: 1, ease: "power2.out" }, 0)
      .to(sceneRef.current, { scale: 0.92, duration: 0.2, yoyo: true, repeat: 1, ease: "power2.in" }, 0.9)
      .to(cubeRef.current, { scale: 1.06, duration: 0.12, yoyo: true, repeat: 1 }, 1.45);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={sceneRef}
        onClick={roll}
        className={`dice-scene ${disabled || rolling ? "cursor-not-allowed opacity-70" : "transition-transform hover:scale-105"}`}
        title={disabled ? "Attendez votre tour…" : "Lancez le dé"}
        style={{ perspective: 900 }}
      >
        <div ref={cubeRef} className="dice-cube" style={{ transformStyle: "preserve-3d" }}>
          <Face value={1} />
          <Face value={2} />
          <Face value={6} />
          <Face value={5} />
          <Face value={3} />
          <Face value={4} />
        </div>
      </div>
      <div className="text-[11px] font-semibold tracking-[0.28em] text-gold-300/90 uppercase glow-gold">
        {rolling ? "Le destin décide…" : "Lancez le dé"}
      </div>
    </div>
  );
}
