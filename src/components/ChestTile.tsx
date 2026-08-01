/* ============================================================
   COFFRE AU TRÉSOR — case du plateau
   Animation d'ouverture : couvercle 3D, faisceau de lumière,
   particules dorées, rebond.
   ============================================================ */
import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import type { Tile } from "../lib/story";

interface ChestTileProps {
  tile: Tile;
  passed: boolean;
  open: boolean;
}

export default function ChestTile({ tile, passed, open }: ChestTileProps) {
  const bounceRef = useRef<HTMLDivElement>(null);

  // Particules dorées générées à l'ouverture
  const particles = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        id: i,
        dx: (Math.random() - 0.5) * 240,
        dy: -70 - Math.random() * 170,
        delay: Math.random() * 0.3,
        size: 5 + Math.random() * 7,
      })),
    [open] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Rebond + tremblement à l'ouverture
  useEffect(() => {
    if (open && bounceRef.current) {
      gsap.fromTo(bounceRef.current, { y: 0 }, { y: -16, duration: 0.3, yoyo: true, repeat: 3, ease: "power2.out" });
      gsap.fromTo(
        bounceRef.current,
        { rotation: -5 },
        { rotation: 5, duration: 0.12, yoyo: true, repeat: 5, ease: "sine.inOut" }
      );
    }
  }, [open]);

  return (
    <div
      className={`tile chest-tile ${passed ? "passed" : ""} ${open ? "glow" : ""}`}
      style={{ left: tile.x, top: tile.y }}
    >
      <div ref={bounceRef} className="relative" style={{ transformStyle: "preserve-3d" }}>
        <div className="chest-stage">
          <div className="chest-glow" />
          <div className={`chest ${open ? "open" : ""}`}>
            <div className="chest-light" />
            <div className="chest-body" />
            <div className="chest-strap" />
            <div className="chest-clasp" />
            <div className="chest-lid" />
          </div>
          {/* Pluie de particules dorées */}
          {open &&
            particles.map((p) => (
              <span
                key={p.id}
                className="gold-particle"
                style={
                  {
                    width: p.size,
                    height: p.size,
                    animationDelay: `${p.delay}s`,
                    "--dx": `${p.dx}px`,
                    "--dy": `${p.dy}px`,
                  } as React.CSSProperties
                }
              />
            ))}
        </div>
      </div>
    </div>
  );
}
