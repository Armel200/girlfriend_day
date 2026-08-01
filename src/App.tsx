/* ============================================================
   CŒURS ENLACÉS — expérience interactive romantique
   Scène 1 : introduction cinématique (Netflix-like)
   Scène 2 : monde magique + jeu du dé 3D + coffres
   ============================================================ */
import { useState } from "react";
import CinematicIntro from "./components/CinematicIntro";
import GameWorld from "./components/GameWorld";

export default function App() {
  const [scene, setScene] = useState<"intro" | "game">("intro");

  return (
    <div className="relative h-full w-full overflow-hidden bg-night-950 font-sans text-white">
      {/* Sur-impressions cinéma permanentes */}
      <div className="grain" aria-hidden />
      <div className="vignette" aria-hidden />

      {scene === "intro" ? (
        <CinematicIntro onStart={() => setScene("game")} />
      ) : (
        <GameWorld onReplayIntro={() => setScene("intro")} />
      )}
    </div>
  );
}
