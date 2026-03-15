import type { Dictionary } from "./types";

const en: Dictionary = {
  game: {
    title: "run from the scrum master",
    subtitle: "how long will you survive the daily?",
    context:
      "i made this as an internal joke about how dailys feel, fifteen minutes dodging calendar invites, surviving process theater, and trying not to get caught without a jira update. not serious, like most standups.",
    description:
      "A browser game where you run from an overzealous Scrum Master. Jump over obstacles and avoid getting caught.",
    instructions: "space / tap to jump",
    startPrompt: "press space or tap to start",
    gameOver: "caught!",
    score: "score",
    highScore: "best",
    restartPrompt: "press space or tap to restart",
  },
  metadata: {
    title: "scrum runner — run from the scrum master",
    description:
      "A fun browser game where you run from an overzealous Scrum Master. Jump over obstacles, avoid getting caught, and see how long you survive the daily standup.",
    keywords:
      "standup simulator, scrum master game, agile browser game, product management game, daily standup game",
  },
  languageSwitcher: {
    label: "es",
  },
} satisfies Dictionary;

export default en;
