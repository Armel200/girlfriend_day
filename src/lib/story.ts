/* ============================================================
   HISTOIRE — données du jeu narratif
   Toutes les données modifiables (dates, messages, photos…)
   ============================================================ */

/* ❤️ MODIFIEZ ICI : la date du début de votre histoire.
   Le compteur « temps passé ensemble » se calcule depuis cette date. */
export const START_DATE = new Date("2024-02-14T20:00:00");

/* ------------------------------------------------------------
   PLATEAU — sentier en serpentin dans la forêt enchantée
   Coordonnées dans un espace logique de 1500 x 820
   ------------------------------------------------------------ */
export const BOARD_W = 1500;
export const BOARD_H = 820;

export interface Tile {
  x: number;
  y: number;
  kind: "start" | "path" | "chest";
  icon?: string;
  chestId?: number; // index du trésor contenu (si kind === "chest")
}

export const TILES: Tile[] = [
  { x: 110, y: 660, kind: "start", icon: "💖" },
  { x: 270, y: 660, kind: "path", icon: "🌸" },
  { x: 430, y: 660, kind: "path", icon: "✨" },
  { x: 590, y: 660, kind: "chest", chestId: 0 },
  { x: 750, y: 660, kind: "path", icon: "🦋" },
  { x: 910, y: 660, kind: "path", icon: "🍃" },
  { x: 1070, y: 660, kind: "chest", chestId: 1 },
  { x: 1230, y: 600, kind: "path", icon: "🌙" },
  { x: 1300, y: 460, kind: "path", icon: "💫" },
  { x: 1300, y: 320, kind: "chest", chestId: 2 },
  { x: 1230, y: 180, kind: "path", icon: "🌸" },
  { x: 1070, y: 140, kind: "path", icon: "✨" },
  { x: 910, y: 140, kind: "chest", chestId: 3 },
  { x: 750, y: 140, kind: "path", icon: "🦋" },
  { x: 590, y: 140, kind: "path", icon: "🍃" },
  { x: 430, y: 140, kind: "path", icon: "🌙" },
  { x: 270, y: 140, kind: "path", icon: "💫" },
  { x: 110, y: 180, kind: "path", icon: "🌸" },
  { x: 70, y: 330, kind: "chest", chestId: 4 }, // coffre final
];

/* ------------------------------------------------------------
   TRÉSORS — messages romantiques + photos souvenirs
   Chaque coffre contient un message tapé à la machine à écrire
   ------------------------------------------------------------ */
export interface Treasure {
  id: number;
  title: string;
  message: string;
  photo: string;
  caption: string;
}

export const TREASURES: Treasure[] = [
  {
    id: 0,
    title: "Le premier regard",
    message:
      "Je me souviens encore de ce premier regard, celui qui a fait basculer le monde. Dans tes yeux, j'ai trouvé une maison que je ne savais pas chercher. Depuis ce jour, chaque battement de mon cœur porte ton nom.",
    photo:
      "https://images.pexels.com/photos/22938527/pexels-photo-22938527.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    caption: "Le jour où tout a commencé",
  },
  {
    id: 1,
    title: "Nos mains qui se cherchent",
    message:
      "Tes mains sont devenues mes endroits préférés au monde. Dans les tempêtes comme dans les plus beaux soleils, elles me rappellent que je ne suis jamais seul(e). Tant que tu me tiens la main, je peux tout traverser.",
    photo:
      "https://images.pexels.com/photos/29564805/pexels-photo-29564805.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    caption: "Tenir ta main, mon refuge",
  },
  {
    id: 2,
    title: "Sous la même lune",
    message:
      "Même quand la distance nous sépare, nous contemplons la même lune. Elle sait tous nos secrets, toutes nos promesses murmurées. Un jour, nous ne compterons plus les kilomètres, seulement les étoiles filantes que nous attraperons ensemble.",
    photo:
      "https://images.pexels.com/photos/14839227/pexels-photo-14839227.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    caption: "La lune est témoin de notre amour",
  },
  {
    id: 3,
    title: "L'étincelle éternelle",
    message:
      "Ce que nous avons n'a pas besoin de feu d'artifice pour briller : c'est une flamme douce et constante, celle qui réchauffe sans jamais consumer. Avec toi, chaque jour ordinaire devient un souvenir extraordinaire.",
    photo:
      "https://images.pexels.com/photos/15497271/pexels-photo-15497271.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    caption: "Chaque instant avec toi est magique",
  },
  {
    id: 4,
    title: "Et si c'était le plus beau trésor ?",
    message:
      "J'ai ouvert tous les coffres, marché sur tous les chemins, et le plus beau trésor n'était ni l'or ni les pierres précieuses… C'était toi. Toi, exactement comme tu es. Alors voici ma promesse : tant que je vivrai, je t'aimerai. C'est la seule fin que je veux pour notre histoire.",
    photo:
      "https://images.pexels.com/photos/6410240/pexels-photo-6410240.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    caption: "Le trésor, c'est nous",
  },
];

/* ------------------------------------------------------------
   SOUVENIRS — galerie polaroïd
   ------------------------------------------------------------ */
export interface Memory {
  url: string;
  caption: string;
  date: string;
  rot: number;
}

export const MEMORIES: Memory[] = [
  {
    url: "https://images.pexels.com/photos/22938527/pexels-photo-22938527.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    caption: "Notre premier baiser",
    date: "14 février",
    rot: -3,
  },
  {
    url: "https://images.pexels.com/photos/29564805/pexels-photo-29564805.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    caption: "Mains unies, toujours",
    date: "1er juin",
    rot: 2,
  },
  {
    url: "https://images.pexels.com/photos/14839222/pexels-photo-14839222.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    caption: "Ce soir-là, sous le ciel",
    date: "21 août",
    rot: -2,
  },
  {
    url: "https://images.pexels.com/photos/15497271/pexels-photo-15497271.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    caption: "Un éternel instant",
    date: "3 octobre",
    rot: 3,
  },
  {
    url: "https://images.pexels.com/photos/6410240/pexels-photo-6410240.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    caption: "L'amour au coucher du soleil",
    date: "24 décembre",
    rot: -1,
  },
  {
    url: "https://images.pexels.com/photos/14839193/pexels-photo-14839193.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
    caption: "Et puis, l'éternité",
    date: "À jamais",
    rot: 2,
  },
];

/* ------------------------------------------------------------
   LETTRES D'AMOUR
   ------------------------------------------------------------ */
export interface LoveLetter {
  id: number;
  title: string;
  salutation: string;
  body: string[];
  sign: string;
}

export const LOVE_LETTERS: LoveLetter[] = [
  {
    id: 0,
    title: "Lettre n°1 — À la personne qui a changé ma vie",
    salutation: "Mon amour, mon tout,",
    body: [
      "Si quelqu'un m'avait dit, il y a quelques années, que le simple fait de penser à toi pouvait illuminer une journée entière, je ne l'aurais pas cru. Et pourtant, te voilà, bouleversant chacune de mes certitudes avec un simple sourire.",
      "Tu es la mélodie que je fredonne sans m'en rendre compte, le rêve dont je ne veux jamais me réveiller, la raison pour laquelle les mots « toujours » ont enfin un sens.",
      "Je t'aime, pas seulement pour ce que tu es, mais pour ce que je deviens quand tu me regardes.",
    ],
    sign: "À toi, pour toujours — Ton âme sœur",
  },
  {
    id: 1,
    title: "Lettre n°2 — Les petits riens qui sont tout",
    salutation: "Ma douce moitié,",
    body: [
      "Ce ne sont pas les grands gestes qui font notre histoire, mais les petits riens : ton rire au milieu de la nuit, nos silences confortables, la façon dont tu poses ta tête sur mon épaule après une longue journée.",
      "J'ai collectionné chacun de ces instants comme d'autres collectionnent les étoiles. Et crois-moi, mon ciel est si plein qu'il ne connaîtra jamais la nuit.",
      "Merci d'exister. Merci d'être toi. Merci de m'avoir choisi(e).",
    ],
    sign: "Tendrement, éternellement — Ton amoureux(se)",
  },
  {
    id: 2,
    title: "Lettre n°3 — Promesse pour demain",
    salutation: "À celui/celle qui fait battre mon cœur,",
    body: [
      "Je ne sais pas où la route nous mènera, mais je sais une chose : je veux la parcourir à tes côtés. À travers les doutes, les rires, les larmes et les victoires.",
      "Je te promets de choisir notre amour chaque matin, même les jours où ce sera difficile. Je te promets de te regarder avec les mêmes yeux émerveillés du premier jour. Je te promets de vieillir avec toi, main dans la main, en nous rappelant que tout a commencé par une simple histoire écrite par deux cœurs.",
      "Et si le destin s'amuse à nous tester, qu'il sache que nous sommes invincibles. Parce que nous, c'est pour la vie.",
    ],
    sign: "Éternellement vôtre — Ton autre moitié",
  },
];

/* ------------------------------------------------------------
   FINALE
   ------------------------------------------------------------ */
export const FINAL_TITLE = "Et ils vécurent heureux…";

export const FINAL_MESSAGE =
  "L'aventure touche à sa fin, mais notre histoire, elle, ne fait que commencer. Chaque coffre ouvert, chaque pas sur ce sentier enchanté n'était qu'une métaphore de notre voyage : semé d'embûches, mais toujours illuminé par l'amour. Merci d'être mon/ma co-aventurier·ère pour l'éternité. Je t'aime. ❤️";
