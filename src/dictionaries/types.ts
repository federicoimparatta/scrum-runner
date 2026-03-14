export interface Dictionary {
  game: {
    title: string;
    subtitle: string;
    context: string;
    description: string;
    instructions: string;
    startPrompt: string;
    gameOver: string;
    score: string;
    highScore: string;
    restartPrompt: string;
  };
  metadata: {
    title: string;
    description: string;
    keywords: string;
  };
  languageSwitcher: {
    label: string;
  };
}
