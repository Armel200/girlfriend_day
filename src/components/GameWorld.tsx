/* ============================================================
   MONDE MAGIQUE — le jeu narratif
   - Plateau en serpentin dans la forêt enchantée
   - Caméra qui suit le jeton (transform GSAP)
   - Dé 3D → déplacement case par case → coffres → messages
   - HUD : compteur de temps, musique, sons, souvenirs, lettres
   - Finale : pluie de cœurs
   ============================================================ */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Audio } from "../audio/AudioManager";
import {
  BOARD_H,
  BOARD_W,
  FINAL_MESSAGE,
  FINAL_TITLE,
  START_DATE,
  TILES,
  TREASURES,
} from "../lib/story";
import Scenery from "./Scenery";
import Dice from "./Dice";
import ChestTile from "./ChestTile";
import MessageModal from "./MessageModal";
import { LettersModal, MemoriesModal } from "./Modals";
import HeartRain from "./HeartRain";

/* ---------- Utilitaires d'animation ---------- */
const wait = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));
const tween = (el: gsap.TweenTarget, vars: gsap.TweenVars) =>
  new Promise<void>((res) => gsap.to(el, { ...vars, onComplete: () => res() }));

type Phase = "idle" | "rolling" | "moving" | "chest" | "finale";

const HINTS: Record<Phase, string> = {
  idle: "🎲 Lancez le dé pour écrire votre histoire",
  rolling: "✨ Le destin décide…",
  moving: "🌟 Votre histoire avance…",
  chest: "💛 Un trésor se révèle…",
  finale: "💖 Et ils vécurent heureux…",
};

/* ---------- Compteur du temps passé ensemble ---------- */
function TimeCounter() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const ms = Math.max(0, now - START_DATE.getTime());
  const s = Math.floor(ms / 1000) % 60;
  const m = Math.floor(ms / 60000) % 60;
  const h = Math.floor(ms / 3600000) % 24;
  const totalDays = Math.floor(ms / 86400000);
  const years = Math.floor(totalDays / 365.25);
  const months = Math.floor((totalDays % 365.25) / 30.44);
  const days = Math.floor((totalDays % 365.25) % 30.44);
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="chip on pointer-events-none" title="Temps passé ensemble">
      <span className="animate-pulse">❤️</span>
      <span className="font-mono tracking-normal">
        {years} an{years > 1 ? "s" : ""} · {months} mois · {days} j · {pad(h)}:{pad(m)}:{pad(s)}
      </span>
    </div>
  );
}

/* ============================================================
   COMPOSANT PRINCIPAL
   ============================================================ */
export default function GameWorld({ onReplayIntro }: { onReplayIntro: () => void }) {
  const worldRef = useRef<HTMLDivElement>(null);
  const tokenRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<SVGPolylineElement>(null);
  const chapterRef = useRef<HTMLDivElement>(null);

  const [passed, setPassed] = useState(0);
  const [opened, setOpened] = useState<number[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [activeTreasure, setActiveTreasure] = useState<number | null>(null);
  const [showMemories, setShowMemories] = useState(false);
  const [showLetters, setShowLetters] = useState(false);
  const [showChapter, setShowChapter] = useState(true);
  const [showEnd, setShowEnd] = useState(false);
  const [musicOn, setMusicOn] = useState(true);
  const [sfxOn, setSfxOn] = useState(true);

  // Références mutables pour éviter les fermetures obsolètes
  const posRef = useRef(0);
  const openedRef = useRef<number[]>([]);

  /* ----- Caméra : centre le monde sur le jeton ----- */
  const centerOn = useCallback((idx: number, zoom = 1, duration = 0.9) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    // Sur petit écran, on zoome davantage (la caméra suit le jeton)
    const fit = Math.min(vw / BOARD_W, vh / BOARD_H) * 1.05;
    const minScale = vw < 900 ? vw / 850 : 0;
    const s = Math.max(fit, minScale) * zoom;
    const x = vw / 2 - TILES[idx].x * s;
    const y = vh / 2 - TILES[idx].y * s;
    gsap.to(worldRef.current, { x, y, scale: s, duration, ease: "power2.inOut" });
  }, []);

  /* ----- Déplacement du jeton, case par case ----- */
  const moveTo = async (to: number) => {
    setPhase("moving");
    for (let i = posRef.current + 1; i <= to; i++) {
      const tile = TILES[i];
      await tween(tokenRef.current, { x: tile.x, y: tile.y, duration: 0.62, ease: "power2.inOut" });
      setPassed(i);
      posRef.current = i;
      Audio.playStep();
      centerOn(i, 1, 0.65);
      await wait(160);
    }
    const tile = TILES[to];
    if (tile.kind === "chest" && !openedRef.current.includes(tile.chestId!)) {
      // Ouverture du coffre : lumière + particules dorées
      openedRef.current = [...openedRef.current, tile.chestId!];
      setOpened(openedRef.current);
      setPhase("chest");
      Audio.playChest();
      centerOn(to, 1.08, 1.3);
      await wait(1000);
      setActiveTreasure(tile.chestId!);
    } else if (to === TILES.length - 1) {
      startFinale();
    } else {
      setPhase("idle");
    }
  };

  /* ----- Lancement du dé ----- */
  const handleRollStart = () => {
    setPhase("rolling");
    Audio.playRoll();
  };

  const handleRollEnd = (n: number) => {
    setLastRoll(n);
    const to = Math.min(posRef.current + n, TILES.length - 1);
    void moveTo(to);
  };

  /* ----- Grande finale ----- */
  const startFinale = () => {
    setPhase("finale");
    Audio.playWin();
    centerOn(TILES.length - 1, 1, 1.8);
    window.setTimeout(() => {
      Audio.playHearts();
      setShowEnd(true);
    }, 1500);
  };

  const handleTreasureClose = () => {
    setActiveTreasure(null);
    if (posRef.current === TILES.length - 1) {
      startFinale();
    } else {
      centerOn(posRef.current, 1, 1);
      setPhase("idle");
    }
  };

  /* ----- Rejouer ----- */
  const handleReplay = () => {
    setShowEnd(false);
    setOpened([]);
    openedRef.current = [];
    setPassed(0);
    posRef.current = 0;
    setLastRoll(null);
    setPhase("idle");
    gsap.set(tokenRef.current, { x: TILES[0].x, y: TILES[0].y });
    centerOn(0, 1, 0);
  };

  /* ----- Montage : position initiale, chapitre, resize ----- */
  useLayoutEffect(() => {
    gsap.set(worldRef.current, { x: 0, y: 0, scale: 1, transformOrigin: "0 0" });
    gsap.set(tokenRef.current, { x: TILES[0].x, y: TILES[0].y });
    centerOn(0, 1, 1.4);

    const onResize = () => centerOn(posRef.current, 1, 0.4);
    window.addEventListener("resize", onResize);

    // Carton « Chapitre I »
    const chT = window.setTimeout(() => {
      if (chapterRef.current) {
        gsap.to(chapterRef.current, {
          opacity: 0,
          y: -24,
          duration: 1.1,
          ease: "power2.in",
          onComplete: () => setShowChapter(false),
        });
      }
    }, 2800);

    return () => {
      window.removeEventListener("resize", onResize);
      window.clearTimeout(chT);
      gsap.killTweensOf(worldRef.current);
      gsap.killTweensOf(tokenRef.current);
    };
  }, [centerOn]);

  /* ----- Progression du sentier lumineux ----- */
  useEffect(() => {
    if (progressRef.current) {
      const p = passed / (TILES.length - 1);
      gsap.to(progressRef.current, { attr: { strokeDashoffset: 1 - p }, duration: 0.7, ease: "power2.inOut" });
    }
  }, [passed]);

  const treasure = activeTreasure !== null ? TREASURES.find((t) => t.id === activeTreasure) ?? null : null;
  const trailPoints = TILES.map((t) => `${t.x},${t.y}`).join(" ");

  return (
    <div className="fixed inset-0 overflow-hidden bg-night-950">
      {/* Décor : forêt, lune, étoiles, lucioles */}
      <Scenery />

      {/* ===== Monde (plateau) déplacé par la caméra ===== */}
      <div ref={worldRef} className="pointer-events-none absolute top-0 left-0" style={{ width: BOARD_W, height: BOARD_H }}>
        {/* Sentier lumineux */}
        <svg
          className="absolute inset-0"
          width={BOARD_W}
          height={BOARD_H}
          viewBox={`0 0 ${BOARD_W} ${BOARD_H}`}
          fill="none"
        >
          <polyline points={trailPoints} stroke="rgba(124,92,255,0.28)" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
          <polyline
            ref={progressRef}
            points={trailPoints}
            stroke="#f3c96b"
            strokeWidth={7}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1}
            style={{ filter: "drop-shadow(0 0 8px rgba(243,201,107,0.9))" }}
          />
        </svg>

        {/* Cases + coffres */}
        {TILES.map((tile, i) =>
          tile.kind === "chest" ? (
            <ChestTile key={i} tile={tile} passed={i <= passed} open={opened.includes(tile.chestId!)} />
          ) : (
            <div
              key={i}
              className={`tile tile-base ${i === 0 ? "tile-start" : ""} ${i <= passed ? "passed" : ""}`}
              style={{ left: tile.x, top: tile.y }}
            >
              {i <= passed && i !== 0 && <span className="tile-spark gold" />}
              {i === 0 && !(i <= passed) && <span className="tile-spark" />}
              <span className="tile-icon">{tile.icon}</span>
              {i === 0 && (
                <span className="absolute top-full mt-1.5 -translate-x-1/2 font-script text-xl whitespace-nowrap text-rose-300 drop-shadow-[0_0_8px_rgba(255,143,176,0.8)]">
                  Départ
                </span>
              )}
            </div>
          )
        )}

        {/* Jeton du joueur */}
        <div ref={tokenRef} className="token-mover">
          <div className="token">
            <div className="token-halo" />
            <span className="token-emoji">💛</span>
          </div>
        </div>
      </div>

      {/* ===== HUD ===== */}
      <div className="hud">
        <div className="flex flex-col items-start gap-2">
          <div className="font-script text-3xl text-gold-300 glow-gold">Cœurs Enlacés</div>
          <div className="text-[10px] font-semibold tracking-[0.35em] text-white/45 uppercase">
            Chapitre I — La forêt des souvenirs
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <TimeCounter />
          <button className={`chip ${musicOn ? "on" : ""}`} onClick={() => { const v = !musicOn; setMusicOn(v); Audio.setMusic(v); }} title="Musique">
            <span>{musicOn ? "🎵" : "🎵"}</span> {musicOn ? "Musique" : "Coupée"}
          </button>
          <button className={`chip ${sfxOn ? "on" : ""}`} onClick={() => { const v = !sfxOn; setSfxOn(v); Audio.setSfx(v); }} title="Effets sonores">
            <span>{sfxOn ? "🔊" : "🔈"}</span> Sons
          </button>
          <button className="chip" onClick={() => setShowMemories(true)} title="Nos souvenirs">
            📸 Souvenirs
          </button>
          <button className="chip" onClick={() => setShowLetters(true)} title="Lettres d'amour">
            💌 Lettres
          </button>
        </div>
      </div>

      {/* ===== Zone du dé ===== */}
      <div className="dice-zone">
        <Dice
          disabled={phase !== "idle" || showEnd}
          onRollStart={handleRollStart}
          onRollEnd={handleRollEnd}
        />
      </div>

      {/* ===== Indications ===== */}
      <div className="hint-zone">
        <div className="chip pointer-events-none flex-col items-start gap-0.5">
          <span className="text-white/85">{HINTS[phase]}</span>
          {lastRoll !== null && (
            <span className="text-[10px] text-gold-300/80 normal-case">
              Dernier lancer : {lastRoll}
            </span>
          )}
        </div>
      </div>

      {/* ===== Carton de chapitre ===== */}
      {showChapter && (
        <div ref={chapterRef} className="pointer-events-none fixed inset-0 z-[88] flex flex-col items-center justify-center bg-night-950/80 backdrop-blur-sm">
          <p className="mb-3 text-[11px] font-bold tracking-[0.4em] text-rose-300/80 uppercase">Cœurs Enlacés présente</p>
          <h2 className="font-script text-6xl text-gradient-gold glow-gold sm:text-7xl">Chapitre I</h2>
          <p className="mt-4 font-display text-xl text-white/75 italic">La forêt des souvenirs</p>
        </div>
      )}

      {/* ===== Modales ===== */}
      {treasure && (
        <MessageModal treasure={treasure} isFinal={activeTreasure === TREASURES.length - 1} onClose={handleTreasureClose} />
      )}
      {showMemories && <MemoriesModal onClose={() => setShowMemories(false)} />}
      {showLetters && <LettersModal onClose={() => setShowLetters(false)} />}

      {/* ===== Finale : pluie de cœurs + fin ===== */}
      {showEnd && (
        <>
          <div className="fixed inset-0 z-[94] flex items-center justify-center bg-night-950/60 p-6 backdrop-blur-[6px]">
            <div className="fade-in-soft w-full max-w-2xl rounded-[30px] border border-gold-400/25 bg-gradient-to-b from-night-700/90 to-night-900/95 p-10 text-center shadow-[0_30px_90px_rgba(0,0,0,0.7),0_0_80px_rgba(243,201,107,0.15)]">
              <div className="mb-4 text-5xl">👑</div>
              <h2 className="font-script text-6xl text-gradient-gold glow-gold sm:text-7xl">{FINAL_TITLE}</h2>
              <p className="mx-auto mt-6 max-w-xl font-display text-lg leading-relaxed text-white/85 italic">
                {FINAL_MESSAGE}
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                <button onClick={handleReplay} className="btn-gold">
                  <span className="text-base">🔄</span> Rejouer l'aventure
                </button>
                <button
                  onClick={onReplayIntro}
                  className="chip px-6! py-3.5! text-[12px]"
                >
                  🎬 Revoir l'intro
                </button>
              </div>
            </div>
          </div>
          <HeartRain />
        </>
      )}
    </div>
  );
}
