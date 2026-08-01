/* ============================================================
   MODALES — « Nos souvenirs » (polaroïds) & « Lettres d'amour »
   ============================================================ */
import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { LOVE_LETTERS, MEMORIES } from "../lib/story";

/* ---------------- SOUVENIRS ---------------- */
export function MemoriesModal({ onClose }: { onClose: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(rootRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35 });
      gsap.fromTo(
        gridRef.current!.children,
        { opacity: 0, y: 44 },
        { opacity: 1, y: 0, stagger: 0.09, duration: 0.7, ease: "back.out(1.5)" }
      );
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card max-w-3xl p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Fermer">
          ✕
        </button>
        <div className="mb-7 text-center">
          <p className="mb-2 text-[10px] font-bold tracking-[0.35em] text-rose-300/80 uppercase">Galerie</p>
          <h3 className="font-script text-5xl text-gradient-gold glow-gold">Nos souvenirs</h3>
          <p className="mt-2 font-display text-white/60 italic">Chaque photo, un fragment de notre éternité</p>
        </div>

        <div ref={gridRef} className="grid grid-cols-2 gap-5 sm:grid-cols-3">
          {MEMORIES.map((m, i) => (
            <figure key={i} className="polaroid" style={{ "--rot": `${m.rot}deg` } as React.CSSProperties}>
              <img src={m.url} alt={m.caption} loading="lazy" />
              <figcaption>
                {m.caption}
                <span className="block font-sans text-[10px] tracking-[0.2em] text-[#a08bc4] uppercase">{m.date}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- LETTRES D'AMOUR ---------------- */
export function LettersModal({ onClose }: { onClose: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const letter = selected !== null ? LOVE_LETTERS[selected] : null;

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        rootRef.current,
        { opacity: 0, scale: 0.92 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.5)" }
      );
    }, rootRef);
    return () => ctx.revert();
  }, []);

  // Animation d'ouverture du papier
  useLayoutEffect(() => {
    if (paperRef.current) {
      gsap.fromTo(
        paperRef.current,
        { opacity: 0, y: 40, rotationX: -18 },
        { opacity: 1, y: 0, rotationX: 0, duration: 0.7, ease: "power3.out", transformPerspective: 800 }
      );
    }
  }, [selected]);

  return (
    <div ref={rootRef} className="modal-backdrop" onClick={onClose}>
      <div className="modal-card max-w-2xl p-8" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fermer">
          ✕
        </button>

        {!letter ? (
          <>
            <div className="mb-8 text-center">
              <p className="mb-2 text-[10px] font-bold tracking-[0.35em] text-rose-300/80 uppercase">Correspondance</p>
              <h3 className="font-script text-5xl text-gradient-gold glow-gold">Lettres d'amour</h3>
              <p className="mt-2 font-display text-white/60 italic">Des mots scellés, écrits pour toi</p>
            </div>
            <div className="flex flex-wrap justify-center gap-6">
              {LOVE_LETTERS.map((l) => (
                <button key={l.id} onClick={() => setSelected(l.id)} className="group flex w-52 flex-col items-center gap-3">
                  <div className="envelope">
                    <div className="envelope-flap" />
                    <div className="envelope-seal">💌</div>
                  </div>
                  <span className="text-center text-[10px] font-semibold tracking-[0.18em] text-white/60 uppercase transition group-hover:text-gold-300">
                    {l.title}
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="relative">
            <button
              onClick={() => setSelected(null)}
              className="mb-4 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-[10px] font-semibold tracking-[0.2em] text-white/60 uppercase backdrop-blur transition hover:border-gold-400/50 hover:text-gold-300"
            >
              ← Retour aux lettres
            </button>
            <div ref={paperRef} className="paper px-8 py-9 sm:px-12">
              <div className="mb-5 text-center">
                <span className="wax-seal">❤️</span>
              </div>
              <h4 className="mb-4 text-center font-display text-2xl font-semibold text-[#5a3d1e]">{letter.title}</h4>
              <p className="mb-4 font-script text-2xl text-[#8a2c50]">{letter.salutation}</p>
              {letter.body.map((p, i) => (
                <p key={i} className="mb-4 font-display text-[17px] leading-relaxed text-[#4a3a1f]">
                  {p}
                </p>
              ))}
              <p className="mt-6 text-right font-script text-2xl text-[#8a2c50]">{letter.sign}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
