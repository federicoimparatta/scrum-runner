import { ScrumMasterGame } from "@/components/ScrumMasterGame";

export default function GamePage() {
  return (
    <div className="max-w-content mx-auto px-6 py-16">
      <section className="mb-10">
        <h1 className="text-3xl font-bold mb-4">scrum runner</h1>
        <p className="text-muted text-lg mb-4">
          dodge calendar events. outrun the scrum master. survive corporate agile.
        </p>
        <p className="text-foreground/60 text-sm leading-relaxed">
          you&apos;re a developer trying to get actual work done. jump over the endless stream of
          calendar invites while the scrum master chases you with agile wisdom.
        </p>
      </section>

      <ScrumMasterGame
        dict={{
          instructions: "space / tap to jump",
          startPrompt: "press space or tap to start",
          gameOver: "game over",
          score: "score",
          highScore: "best",
          restartPrompt: "press space or tap to restart",
        }}
      />
    </div>
  );
}
