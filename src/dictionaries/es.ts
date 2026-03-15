import type { Dictionary } from "./types";

const es: Dictionary = {
  game: {
    title: "escapando del scrum master",
    subtitle: "¿cuánto tiempo sobreviviras la daily?",
    context:
      "lo hice como un chiste interno sobre cómo se sienten las dailys, quince minutos esquivando invitaciones de calendario, sobreviviendo teatro de procesos e intentando que no te agarren sin actualizar jira. no es serio, como la mayoría de los standups.",
    description:
      "Un juego donde escapas de un Scrum Master obsesivo. Salta obstaculos y no dejes que te atrape.",
    instructions: "espacio / toca para saltar",
    startPrompt: "presiona espacio o toca para empezar",
    gameOver: "atrapado!",
    score: "puntos",
    highScore: "mejor",
    restartPrompt: "presiona espacio o toca para reiniciar",
  },
  metadata: {
    title: "scrum runner — escapando del scrum master",
    description:
      "Un divertido juego de navegador donde escapás de un Scrum Master obsesivo. Saltá obstáculos, evitá que te atrapen y sobreviví la daily standup.",
    keywords:
      "simulador de daily, juego scrum master, juego ágil navegador, juego gestión de producto, juego daily standup",
  },
  languageSwitcher: {
    label: "en",
  },
} as const;

export default es;
