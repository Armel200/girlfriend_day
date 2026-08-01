/* ============================================================
   INTRODUCTION CINÉMATIQUE — digne d'une production Netflix
   Scène : noir → letterbox → logo → « Une création originale »
   → étoiles → titre révélé lettre par lettre → bouton CTA
   ============================================================ */
import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Audio } from "../audio/AudioManager";
import Scenery from "./Scenery";

/** Texte découpé en caractères pour un effet cinéma */
function CinemaText({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className} aria-label={text}>
      {text.split("").map((c, i) => (
        <span key={i} className="cinema-char">
          {c === " " ? "\u00A0" : c}
        </span>
      ))}
    </span>
  );
}

export default function CinematicIntro({ onStart }: { onStart: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const brandRef = useRef<HTMLDivElement>(null);
  const originalRef = useRef<HTMLDivElement>(null);
  const title1Ref = useRef<HTMLDivElement>(null);
  const title2Ref = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);
  const topBarRef = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);

  const [soundOn, setSoundOn] = useState(false);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      tlRef.current = tl;

      // Letterbox façon cinéma
      tl.fromTo(topBarRef.current, { yPercent: -100 }, { yPercent: 0, duration: 1.1, ease: "power4.out" }, 0.15)
        .fromTo(bottomBarRef.current, { yPercent: 100 }, { yPercent: 0, duration: 1.1, ease: "power4.out" }, 0.15)
        // Logo de la « production »
        .fromTo(
          brandRef.current,
          { opacity: 0, scale: 0.6, rotationX: 25 },
          { opacity: 1, scale: 1, rotationX: 0, duration: 1.2, ease: "back.out(1.7)" },
          0.8
        )
        .call(() => Audio.playChime(), [], 0.85)
        .to(brandRef.current, { opacity: 0, scale: 0.9, duration: 0.6, ease: "power2.in" }, 3.2)
        // « Une création originale »
        .fromTo(originalRef.current, { opacity: 0, letterSpacing: "0.6em" }, { opacity: 1, letterSpacing: "0.32em", duration: 1.1 }, 3.7)
        .to(originalRef.current, { opacity: 0, duration: 0.5 }, 5.0)
        // Le ciel s'illumine
        .fromTo(starsRef.current, { opacity: 0 }, { opacity: 1, duration: 1.8 }, 4.8)
        // Titre principal, caractère par caractère
        .fromTo(
          title1Ref.current!.children,
          { opacity: 0, y: 34, filter: "blur(12px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", stagger: 0.04, duration: 0.85 },
          5.7
        )
        .fromTo(
          title2Ref.current!.children,
          { opacity: 0, y: 28, filter: "blur(12px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", stagger: 0.03, duration: 0.85 },
          6.9
        )
        .fromTo(subtitleRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1 }, 8.4)
        .fromTo(ctaRef.current, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.9, ease: "back.out(1.4)" }, 9.0)
        .fromTo(skipRef.current, { opacity: 0 }, { opacity: 1, duration: 0.8 }, 1.2);
    }, rootRef);

    return () => ctx.revert();
  }, []);

  /** Active le son (geste utilisateur requis par les navigateurs) */
  const handleEnableSound = async () => {
    await Audio.ensure();
    Audio.setMusic(true);
    Audio.setSfx(true);
    setSoundOn(true);
  };

  /** Lance l'aventure avec fondu de sortie */
  const handleStart = async () => {
    if (tlRef.current) tlRef.current.progress(1);
    await Audio.ensure();
    if (!soundOn) Audio.setMusic(true);
    gsap.to(rootRef.current, {
      opacity: 0,
      duration: 0.9,
      ease: "power2.in",
      onComplete: onStart,
    });
  };

  const handleSkip = async () => {
    if (tlRef.current) tlRef.current.progress(1);
    await Audio.ensure();
    if (!soundOn) Audio.setMusic(true);
    gsap.to(rootRef.current, {
      opacity: 0,
      duration: 0.6,
      ease: "power2.in",
      onComplete: onStart,
    });
  };

  return (
    <div ref={rootRef} className="fixed inset-0 z-50 overflow-hidden bg-night-950">
      {/* Ciel étoilé (révélé progressivement) */}
      <div ref={starsRef} className="absolute inset-0 opacity-0">
        <Scenery stars fireflies={false} moon={false} forest={false} />
      </div>

      {/* Letterbox */}
      <div ref={topBarRef} className="letterbox letterbox-top" />
      <div ref={bottomBarRef} className="letterbox letterbox-bottom" />

      {/* Barre supérieure : son + passer */}
      <div className="fixed top-4 left-4 z-[70] flex items-center gap-3">
        <button
          onClick={handleEnableSound}
          className={`chip ${soundOn ? "on" : ""}`}
          title="Activer la musique"
        >
          <span>{soundOn ? "🔊" : "🔇"}</span> {soundOn ? "Musique active" : "Activer le son"}
        </button>
      </div>
      <button
        ref={skipRef}
        onClick={handleSkip}
        style={{ opacity: 0 }}
        className="fixed top-4 right-4 z-[70] rounded-full border border-white/20 bg-white/5 px-5 py-2 text-[11px] font-medium tracking-[0.25em] text-white/60 uppercase backdrop-blur-md transition hover:border-rose-300/50 hover:text-white"
      >
        Passer l'intro →
      </button>

      {/* Scène centrale */}
      <div className="relative z-[60] flex h-full flex-col items-center justify-center px-6 text-center">
        {/* Logo production */}
        <div ref={brandRef} className="mb-10 flex flex-col items-center gap-5" style={{ opacity: 0 }}>
          <div className="logo-mark float-y">
            <span className="text-4xl">💛</span>
          </div>
          <div className="text-[13px] font-bold tracking-[0.55em] text-gold-300 uppercase glow-gold">
            Cœurs&nbsp;Enlacés
          </div>
        </div>

        {/* Création originale */}
        <div
          ref={originalRef}
          className="mb-8 text-[11px] font-semibold tracking-[0.32em] text-white/55 uppercase"
          style={{ opacity: 0 }}
        >
          ✦ Une création originale ✦
        </div>

        {/* Titre principal */}
        <h1 className="font-script text-[clamp(3rem,10vw,7.5rem)] leading-tight text-gradient-gold glow-gold">
          <div ref={title1Ref}>
            <CinemaText text="Il était une fois" />
          </div>
        </h1>
        <h2 className="mt-4 max-w-4xl font-display text-[clamp(1.4rem,4.4vw,3rem)] font-medium text-white/95 italic glow-rose">
          <div ref={title2Ref}>
            <CinemaText text="une histoire écrite par deux cœurs…" />
          </div>
        </h2>

        {/* Sous-titre */}
        <p
          ref={subtitleRef}
          className="mt-8 max-w-xl text-[12px] font-medium tracking-[0.3em] text-rose-300/80 uppercase"
          style={{ opacity: 0 }}
        >
          L'amour est la plus belle des aventures
        </p>

        {/* Bouton CTA */}
        <div ref={ctaRef} className="mt-12" style={{ opacity: 0 }}>
          <button onClick={handleStart} className="btn-gold">
            <span className="cta-ring" />
            <span className="text-lg">💫</span> Commencer l'aventure
          </button>
          <p className="mt-5 text-[11px] tracking-[0.2em] text-white/40 uppercase">
            🎧 Casque recommandé pour une immersion totale
          </p>
        </div>
      </div>
    </div>
  );
}
