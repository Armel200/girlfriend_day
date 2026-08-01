/* ============================================================
   SCENERY — décor du monde magique
   - Forêt enchantée (image générée, effet Ken Burns)
   - Lune lumineuse en CSS
   - Canvas : étoiles scintillantes, étoiles filantes, lucioles
   ============================================================ */
import { useEffect, useRef } from "react";
import forestImg from "../assets/forest.jpg";

interface SceneryProps {
  stars?: boolean;
  fireflies?: boolean;
  moon?: boolean;
  forest?: boolean;
}

export default function Scenery({ stars = true, fireflies = true, moon = true, forest = true }: SceneryProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Réflecteurs pour éviter de relancer la boucle à chaque props
  const flags = useRef({ stars, fireflies });
  flags.current = { stars, fireflies };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: 0.5, y: 0.5 };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouse);

    function onMouse(e: MouseEvent) {
      mouse.x = e.clientX / window.innerWidth;
      mouse.y = e.clientY / window.innerHeight;
    }

    // Étoiles
    const starsArr = Array.from({ length: 170 }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: 0.4 + Math.random() * 1.4,
      p: Math.random() * Math.PI * 2,
      s: 0.5 + Math.random() * 1.3,
      c: Math.random() < 0.82 ? "255,244,220" : "190,170,255",
    }));

    // Lucioles
    const flies = Array.from({ length: 15 }, () => ({
      x: Math.random(),
      y: 0.25 + Math.random() * 0.65,
      p: Math.random() * Math.PI * 2,
      v: 0.15 + Math.random() * 0.35,
      r: 1.3 + Math.random() * 1.7,
      drift: Math.random() * Math.PI * 2,
    }));

    // Étoile filante
    const shoot = { active: false, x: 0, y: 0, vx: 0, vy: 0, life: 0, max: 1, next: 4 };

    const t0 = performance.now();

    const draw = (now: number) => {
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, w, h);
      const px = (mouse.x - 0.5) * 26;
      const py = (mouse.y - 0.5) * 18;

      if (flags.current.stars) {
        for (const st of starsArr) {
          const tw = 0.5 + 0.5 * Math.sin(t * st.s + st.p);
          const a = 0.25 + 0.75 * tw;
          ctx.beginPath();
          ctx.arc(st.x * w + px, st.y * h + py, st.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${st.c},${a.toFixed(3)})`;
          ctx.fill();
          // halo pour les plus brillantes
          if (st.r > 1.4) {
            ctx.beginPath();
            ctx.arc(st.x * w + px, st.y * h + py, st.r * 3.2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${st.c},${(a * 0.12).toFixed(3)})`;
            ctx.fill();
          }
        }
      }

      if (flags.current.fireflies) {
        for (const f of flies) {
          const x = (f.x + Math.sin(t * f.v + f.p) * 0.025) * w;
          const y = (f.y + Math.cos(t * f.v * 0.8 + f.drift) * 0.03) * h;
          const glow = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.4 + f.p));
          const grad = ctx.createRadialGradient(x, y, 0, x, y, f.r * 6);
          grad.addColorStop(0, `rgba(255,231,140,${(0.85 * glow).toFixed(3)})`);
          grad.addColorStop(0.4, `rgba(255,200,90,${(0.35 * glow).toFixed(3)})`);
          grad.addColorStop(1, "rgba(255,180,60,0)");
          ctx.beginPath();
          ctx.arc(x, y, f.r * 6, 0, Math.PI * 2);
          ctx.fillStyle = grad;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x, y, f.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,250,220,${(0.9 * glow).toFixed(3)})`;
          ctx.fill();
        }
      }

      // Étoile filante
      if (t > shoot.next && !shoot.active) {
        shoot.active = true;
        shoot.x = 0.15 + Math.random() * 0.7;
        shoot.y = 0.05 + Math.random() * 0.3;
        const ang = Math.PI * (0.2 + Math.random() * 0.25);
        const sp = 0.55 + Math.random() * 0.35;
        shoot.vx = Math.cos(ang) * sp;
        shoot.vy = Math.sin(ang) * sp;
        shoot.life = 0;
        shoot.max = 0.9 + Math.random() * 0.6;
        shoot.next = t + 4 + Math.random() * 6;
      }
      if (shoot.active) {
        shoot.life += 0.016;
        const k = shoot.life / shoot.max;
        const sx = (shoot.x + shoot.vx * shoot.life) * w;
        const sy = (shoot.y + shoot.vy * shoot.life) * h;
        const tail = 90;
        const gx = sx - shoot.vx * tail;
        const gy = sy - shoot.vy * tail;
        const grad = ctx.createLinearGradient(sx, sy, gx, gy);
        grad.addColorStop(0, `rgba(255,250,235,${(0.9 * (1 - k)).toFixed(3)})`);
        grad.addColorStop(1, "rgba(255,250,235,0)");
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(gx, gy);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.stroke();
        if (k >= 1) shoot.active = false;
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return (
    <>
      {/* Forêt enchantée en arrière-plan */}
      {forest && (
        <div className="fixed inset-0 z-0">
          <img src={forestImg} alt="" className="kenburns h-full w-full object-cover opacity-85" />
          {/* Voiles d'atmosphère pour fondre le décor */}
          <div className="absolute inset-0 bg-gradient-to-t from-night-950 via-transparent to-night-900/60" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(5,1,15,0.55)_100%)]" />
        </div>
      )}

      {/* Lune */}
      {moon && (
        <div className="moon-wrap">
          <div className="moon" />
        </div>
      )}

      {/* Étoiles + lucioles */}
      <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[4]" />
    </>
  );
}
