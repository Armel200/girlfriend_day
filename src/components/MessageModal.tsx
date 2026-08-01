/* ============================================================
   MODALE TRÉSOR — message romantique en machine à écrire
   ============================================================ */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Audio } from "../audio/AudioManager";
import type { Treasure } from "../lib/story";

/** Effet machine à écrire avec tic sonore */
function useTypewriter(text: string, speed = 24) {
  const [out, setOut] = useState("");
  useEffect(() => {
    setOut("");
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setOut(text.slice(0, i));
      if (i % 5 === 0) Audio.playType();
      if (i >= text.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [text, speed]);
  return out;
}

interface MessageModalProps {
  treasure: Treasure;
  isFinal: boolean;
  onClose: () => void;
}

export default function MessageModal({ treasure, isFinal, onClose }: MessageModalProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const typed = useTypewriter(treasure.message);
  const typing = typed.length < treasure.message.length;

  // Animation d'entrée cinématique
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(rootRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35 });
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 70, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.85, ease: "back.out(1.6)" }
      );
      gsap.fromTo(photoRef.current, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.35 });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="modal-backdrop" onClick={onClose}>
      <div ref={cardRef} className="modal-card p-8 sm:p-10" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fermer">
          ✕
        </button>

        {/* En-tête du trésor */}
        <div className="mb-6 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-gold-400/40 bg-gold-400/10 px-4 py-1.5 text-[10px] font-bold tracking-[0.3em] text-gold-300 uppercase">
            💛 Coffre n°{treasure.id + 1} {isFinal && "· Trésor ultime"}
          </div>
          <h3 className="font-script text-4xl text-gradient-gold glow-gold sm:text-5xl">{treasure.title}</h3>
        </div>

        {/* Photo souvenir */}
        <div ref={photoRef} className="mx-auto mb-7 w-56 sm:w-64">
          <figure className="polaroid" style={{ "--rot": "-2.5deg" } as React.CSSProperties}>
            <img src={treasure.photo} alt={treasure.caption} />
            <figcaption>{treasure.caption}</figcaption>
          </figure>
        </div>

        {/* Message tapé à la machine */}
        <p
          className={`min-h-[120px] text-center font-display text-lg leading-relaxed text-white/90 italic sm:text-xl ${
            typing ? "type-caret" : ""
          }`}
        >
          {typed}
        </p>

        <div className="mt-8 text-center">
          <button onClick={onClose} className="btn-gold">
            <span className="text-base">✦</span> {isFinal ? "Découvrir la finale" : "Continuer l'aventure"}
          </button>
        </div>
      </div>
    </div>
  );
}
