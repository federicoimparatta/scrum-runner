"use client";

import { useRef, useEffect, useCallback, useState } from "react";

interface GameDict {
  instructions: string;
  startPrompt: string;
  gameOver: string;
  score: string;
  highScore: string;
  restartPrompt: string;
}

const SCRUM_QUOTES = [
  "update your jira!",
  "we need to be more agile",
  "let's timebox this",
  "what's your blocker?",
  "can we take this offline?",
  "let's circle back",
  "move it to the next sprint",
  "story points, not hours!",
  "that's not in scope",
  "did you update the board?",
  "let's refine this",
  "velocity is dropping!",
  "where's your burndown?",
  "we need a retro",
  "is this a spike?",
  "parking lot!",
  "t-shirt sizing anyone?",
  "fibonacci only!",
  "who's the pig here?",
  "are we aligned?",
  "let's swarm on this",
  "what's your capacity?",
  "15 minutes, people!",
  "yesterday, today, blockers!",
  "that's a dependency",
  "increment the increment!",
  "definition of done?",
  "acceptance criteria!",
  "epic, not feature!",
  "SAFe is the way",
];

// Game constants
const GROUND_Y_RATIO = 0.75;
const PLAYER_WIDTH = 30;
const PLAYER_HEIGHT = 50;
const GRAVITY = 0.8;
const JUMP_FORCE = -12;
const INITIAL_GAME_SPEED = 4;
const SPEED_INCREMENT = 0.0006;
const OBSTACLE_MIN_GAP = 200;
const OBSTACLE_MAX_GAP = 350;
const SM_WIDTH = 40;
const SM_HEIGHT = 56;
const SM_OFFSET_X = 60;
const QUOTE_INTERVAL = 120;
const QUOTE_DURATION = 180;

const CALENDAR_EVENTS = [
  "grooming",
  "standup",
  "scrum",
  "retro",
  "sprint planning",
  "backlog refinement",
  "1:1 w/ PM",
  "sync",
  "all-hands",
  "design review",
  "demo day",
  "war room",
  "status update",
  "kickoff",
  "post-mortem",
  "roadmap review",
];

interface Obstacle {
  x: number;
  width: number;
  height: number;
  label: string;
}

interface Quote {
  text: string;
  timer: number;
}

type GameState = "idle" | "playing" | "gameover";

export function ScrumMasterGame({ dict }: { dict: GameDict }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameState = useRef<GameState>("idle");
  const score = useRef(0);
  const [displayScore, setDisplayScore] = useState(0);
  const [displayHighScore, setDisplayHighScore] = useState(0);
  const [uiState, setUiState] = useState<GameState>("idle");

  // Player state
  const playerY = useRef(0);
  const playerVelocity = useRef(0);
  const isJumping = useRef(false);

  // World state
  const gameSpeed = useRef(INITIAL_GAME_SPEED);
  const obstacles = useRef<Obstacle[]>([]);
  const distSinceObstacle = useRef(0);
  const nextObstacleGap = useRef(OBSTACLE_MIN_GAP + Math.random() * (OBSTACLE_MAX_GAP - OBSTACLE_MIN_GAP));
  const groundOffset = useRef(0);

  // Scrum master state
  const smX = useRef(0);
  const smBobTimer = useRef(0);
  const currentQuote = useRef<Quote | null>(null);
  const quoteTimer = useRef(QUOTE_INTERVAL);

  // Animation
  const frameRef = useRef(0);
  const runFrame = useRef(0);
  const runTimer = useRef(0);

  const highScore = useRef(0);

  const getGroundY = useCallback((canvas: HTMLCanvasElement) => {
    return canvas.height * GROUND_Y_RATIO;
  }, []);

  const resetGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const groundY = getGroundY(canvas);
    score.current = 0;
    gameSpeed.current = INITIAL_GAME_SPEED;
    playerY.current = groundY - PLAYER_HEIGHT;
    playerVelocity.current = 0;
    isJumping.current = false;
    obstacles.current = [];
    distSinceObstacle.current = 0;
    nextObstacleGap.current = OBSTACLE_MIN_GAP + Math.random() * (OBSTACLE_MAX_GAP - OBSTACLE_MIN_GAP);
    groundOffset.current = 0;
    smX.current = -SM_OFFSET_X;
    smBobTimer.current = 0;
    currentQuote.current = null;
    quoteTimer.current = QUOTE_INTERVAL;
    runFrame.current = 0;
    runTimer.current = 0;
    setDisplayScore(0);
  }, [getGroundY]);

  const jump = useCallback(() => {
    if (!isJumping.current && gameState.current === "playing") {
      playerVelocity.current = JUMP_FORCE;
      isJumping.current = true;
    }
  }, []);

  const startOrRestart = useCallback(() => {
    if (gameState.current === "idle" || gameState.current === "gameover") {
      resetGame();
      gameState.current = "playing";
      setUiState("playing");
    } else {
      jump();
    }
  }, [resetGame, jump]);

  const drawPlayer = useCallback(
    (ctx: CanvasRenderingContext2D, x: number, y: number, frame: number) => {
      const isInAir = isJumping.current;
      ctx.save();

      // Body
      ctx.fillStyle = getComputedStyle(ctx.canvas).getPropertyValue("color");
      ctx.fillRect(x + 8, y + 12, 14, 20);

      // Head
      ctx.beginPath();
      ctx.arc(x + 15, y + 8, 8, 0, Math.PI * 2);
      ctx.fill();

      // Legs - running animation
      if (isInAir) {
        // Tucked legs in air
        ctx.fillRect(x + 8, y + 32, 5, 10);
        ctx.fillRect(x + 17, y + 32, 5, 10);
      } else {
        const legSwing = Math.sin(frame * 0.4) * 8;
        // Left leg
        ctx.fillRect(x + 8 + legSwing, y + 32, 5, 16);
        // Right leg
        ctx.fillRect(x + 17 - legSwing, y + 32, 5, 16);
      }

      // Arms - swinging
      const armSwing = isInAir ? -4 : Math.sin(frame * 0.4 + Math.PI) * 6;
      ctx.fillRect(x + 2, y + 14 + armSwing, 6, 4);
      ctx.fillRect(x + 22, y + 14 - armSwing, 6, 4);

      ctx.restore();
    },
    [],
  );

  const drawScrumMaster = useCallback(
    (ctx: CanvasRenderingContext2D, x: number, y: number, bobOffset: number, frame: number) => {
      ctx.save();
      const smY = y - SM_HEIGHT + bobOffset;

      // Body (slightly bigger, menacing)
      ctx.fillStyle = getComputedStyle(ctx.canvas).getPropertyValue("color");
      ctx.globalAlpha = 0.85;
      ctx.fillRect(x + 6, smY + 14, 28, 24);

      // Head
      ctx.beginPath();
      ctx.arc(x + 20, smY + 10, 10, 0, Math.PI * 2);
      ctx.fill();

      // Glasses (two circles)
      ctx.strokeStyle = ctx.canvas.classList.contains("dark-mode")
        ? "rgb(10, 10, 10)"
        : "rgb(255, 255, 255)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x + 16, smY + 9, 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + 24, smY + 9, 4, 0, Math.PI * 2);
      ctx.stroke();
      // Bridge
      ctx.beginPath();
      ctx.moveTo(x + 20, smY + 9);
      ctx.lineTo(x + 20, smY + 9);
      ctx.stroke();

      // Clipboard in hand
      ctx.fillStyle = getComputedStyle(ctx.canvas).getPropertyValue("color");
      ctx.globalAlpha = 0.6;
      ctx.fillRect(x - 4, smY + 18, 10, 14);
      ctx.globalAlpha = 0.85;

      // Legs - chasing animation
      const legSwing = Math.sin(frame * 0.5) * 10;
      ctx.fillStyle = getComputedStyle(ctx.canvas).getPropertyValue("color");
      ctx.fillRect(x + 10 + legSwing, smY + 38, 6, 16);
      ctx.fillRect(x + 24 - legSwing, smY + 38, 6, 16);

      ctx.globalAlpha = 1;
      ctx.restore();
    },
    [],
  );

  const drawObstacle = useCallback(
    (ctx: CanvasRenderingContext2D, obs: Obstacle, groundY: number) => {
      ctx.save();
      const fgColor = getComputedStyle(ctx.canvas).getPropertyValue("color");
      const x = obs.x;
      const y = groundY - obs.height;

      // Calendar event block
      ctx.globalAlpha = 0.7;
      ctx.fillStyle = fgColor;
      ctx.beginPath();
      ctx.roundRect(x, y, obs.width, obs.height, 3);
      ctx.fill();

      // Left accent bar
      ctx.globalAlpha = 1;
      ctx.fillStyle = fgColor;
      ctx.fillRect(x, y, 3, obs.height);

      // Event label
      ctx.globalAlpha = 0.9;
      const bgColor = getComputedStyle(document.body)
        .getPropertyValue("background-color")
        .trim();
      ctx.fillStyle = bgColor || "#ffffff";
      ctx.font = "bold 9px 'JetBrains Mono', monospace";
      ctx.fillText(obs.label, x + 7, y + obs.height / 2 + 3, obs.width - 10);

      ctx.globalAlpha = 1;
      ctx.restore();
    },
    [],
  );

  const drawQuoteBubble = useCallback(
    (ctx: CanvasRenderingContext2D, quote: Quote, smXPos: number, smYPos: number) => {
      ctx.save();
      const text = quote.text;
      ctx.font = "11px 'JetBrains Mono', monospace";
      const metrics = ctx.measureText(text);
      const padding = 8;
      const bubbleWidth = metrics.width + padding * 2;
      const bubbleHeight = 22;
      const bx = smXPos + SM_WIDTH + 6;
      const by = smYPos - SM_HEIGHT - bubbleHeight - 4;

      // Bubble fade
      const fadeAlpha =
        quote.timer > QUOTE_DURATION - 20
          ? (QUOTE_DURATION - quote.timer) / 20
          : quote.timer < 20
            ? quote.timer / 20
            : 1;

      ctx.globalAlpha = fadeAlpha * 0.9;

      // Background
      const bgColor = getComputedStyle(ctx.canvas)
        .getPropertyValue("color")
        .trim();
      ctx.fillStyle = bgColor;
      ctx.beginPath();
      ctx.roundRect(bx, by, bubbleWidth, bubbleHeight, 4);
      ctx.fill();

      // Tail
      ctx.beginPath();
      ctx.moveTo(bx + 6, by + bubbleHeight);
      ctx.lineTo(bx - 2, by + bubbleHeight + 6);
      ctx.lineTo(bx + 14, by + bubbleHeight);
      ctx.closePath();
      ctx.fill();

      // Text — use body background since canvas background is transparent
      const fgColor = getComputedStyle(document.body)
        .getPropertyValue("background-color")
        .trim();
      ctx.fillStyle = fgColor || "#ffffff";
      ctx.fillText(text, bx + padding, by + 15);

      ctx.globalAlpha = 1;
      ctx.restore();
    },
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Load high score
    try {
      const saved = localStorage.getItem("scrumRunnerHighScore");
      if (saved) {
        highScore.current = parseInt(saved, 10);
        setDisplayHighScore(highScore.current);
      }
    } catch {
      // ignore
    }

    const resize = () => {
      const container = canvas.parentElement;
      if (!container) return;
      const dpr = window.devicePixelRatio || 1;
      const w = container.clientWidth;
      const h = Math.min(400, Math.max(280, window.innerHeight * 0.4));
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
      // Reset player position on resize
      if (gameState.current === "idle") {
        playerY.current = h * GROUND_Y_RATIO - PLAYER_HEIGHT;
      }
    };

    resize();
    window.addEventListener("resize", resize);

    const gameLoop = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const groundY = h * GROUND_Y_RATIO;

      // Clear
      ctx.clearRect(0, 0, w, h);

      // Draw ground
      ctx.strokeStyle = getComputedStyle(canvas).getPropertyValue("color");
      ctx.globalAlpha = 0.2;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(w, groundY);
      ctx.stroke();

      // Ground details (dashes scrolling)
      if (gameState.current === "playing") {
        groundOffset.current = (groundOffset.current + gameSpeed.current) % 20;
      }
      for (let gx = -groundOffset.current; gx < w; gx += 20) {
        ctx.fillStyle = getComputedStyle(canvas).getPropertyValue("color");
        ctx.globalAlpha = 0.1;
        ctx.fillRect(gx, groundY + 4, 8, 1);
        ctx.fillRect(gx + 10, groundY + 8, 5, 1);
      }
      ctx.globalAlpha = 1;

      if (gameState.current === "playing") {
        // Update speed
        gameSpeed.current += SPEED_INCREMENT;

        // Update player
        playerVelocity.current += GRAVITY;
        playerY.current += playerVelocity.current;

        if (playerY.current >= groundY - PLAYER_HEIGHT) {
          playerY.current = groundY - PLAYER_HEIGHT;
          playerVelocity.current = 0;
          isJumping.current = false;
        }

        // Update score
        score.current += 1;
        if (score.current % 5 === 0) {
          setDisplayScore(Math.floor(score.current / 5));
        }

        // Spawn obstacles
        distSinceObstacle.current += gameSpeed.current;
        if (distSinceObstacle.current > nextObstacleGap.current) {
          const label = CALENDAR_EVENTS[Math.floor(Math.random() * CALENDAR_EVENTS.length)];
          const obsW = 45 + Math.random() * 15;
          const obsH = 20 + Math.random() * 10;

          obstacles.current.push({
            x: w + 20,
            width: obsW,
            height: obsH,
            label,
          });
          distSinceObstacle.current = 0;
          nextObstacleGap.current =
            OBSTACLE_MIN_GAP +
            Math.random() * (OBSTACLE_MAX_GAP - OBSTACLE_MIN_GAP);
        }

        // Update obstacles
        for (let i = obstacles.current.length - 1; i >= 0; i--) {
          obstacles.current[i].x -= gameSpeed.current;
          if (obstacles.current[i].x + obstacles.current[i].width < -20) {
            obstacles.current.splice(i, 1);
          }
        }

        // Update scrum master
        smBobTimer.current += 0.08;
        quoteTimer.current--;

        if (quoteTimer.current <= 0) {
          currentQuote.current = {
            text: SCRUM_QUOTES[
              Math.floor(Math.random() * SCRUM_QUOTES.length)
            ],
            timer: QUOTE_DURATION,
          };
          quoteTimer.current =
            QUOTE_INTERVAL + Math.floor(Math.random() * 100);
        }

        if (currentQuote.current) {
          currentQuote.current.timer--;
          if (currentQuote.current.timer <= 0) {
            currentQuote.current = null;
          }
        }

        // Collision detection
        const playerBox = {
          x: w * 0.15 + 6,
          y: playerY.current + 4,
          w: PLAYER_WIDTH - 12,
          h: PLAYER_HEIGHT - 4,
        };

        for (const obs of obstacles.current) {
          const obsBox = {
            x: obs.x + 2,
            y: groundY - obs.height + 2,
            w: obs.width - 4,
            h: obs.height - 2,
          };

          if (
            playerBox.x < obsBox.x + obsBox.w &&
            playerBox.x + playerBox.w > obsBox.x &&
            playerBox.y < obsBox.y + obsBox.h &&
            playerBox.y + playerBox.h > obsBox.y
          ) {
            // Game over
            gameState.current = "gameover";
            setUiState("gameover");

            if (Math.floor(score.current / 5) > highScore.current) {
              highScore.current = Math.floor(score.current / 5);
              setDisplayHighScore(highScore.current);
              try {
                localStorage.setItem(
                  "scrumRunnerHighScore",
                  String(highScore.current),
                );
              } catch {
                // ignore
              }
            }
            setDisplayScore(Math.floor(score.current / 5));
            break;
          }
        }

        // Update run animation
        runTimer.current += gameSpeed.current;
        if (runTimer.current > 6) {
          runFrame.current++;
          runTimer.current = 0;
        }
      }

      // Draw obstacles
      for (const obs of obstacles.current) {
        drawObstacle(ctx, obs, groundY);
      }

      // Draw player
      const playerX = w * 0.15;
      drawPlayer(ctx, playerX, playerY.current, runFrame.current);

      // Draw scrum master
      const smBob = Math.sin(smBobTimer.current) * 3;
      drawScrumMaster(ctx, smX.current + 10, groundY, smBob, runFrame.current);

      // Draw quote bubble
      if (currentQuote.current) {
        drawQuoteBubble(
          ctx,
          currentQuote.current,
          smX.current + 10,
          groundY + smBob,
        );
      }

      // Draw idle / game over overlay
      if (gameState.current === "idle" || gameState.current === "gameover") {
        ctx.fillStyle = getComputedStyle(canvas).getPropertyValue("color");
        ctx.globalAlpha = 0.7;
        ctx.font = "13px 'JetBrains Mono', monospace";
        ctx.textAlign = "center";

        if (gameState.current === "gameover") {
          ctx.font = "bold 20px 'JetBrains Mono', monospace";
          ctx.globalAlpha = 1;
          ctx.fillText(dict.gameOver, w / 2, h * 0.35);

          ctx.font = "13px 'JetBrains Mono', monospace";
          ctx.globalAlpha = 0.7;
          ctx.fillText(dict.restartPrompt, w / 2, h * 0.35 + 30);
        } else {
          ctx.fillText(dict.startPrompt, w / 2, h * 0.4);
        }

        ctx.textAlign = "left";
        ctx.globalAlpha = 1;
      }

      frameRef.current = requestAnimationFrame(gameLoop);
    };

    frameRef.current = requestAnimationFrame(gameLoop);

    // Initialize player position
    playerY.current = getGroundY(canvas) - PLAYER_HEIGHT;

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [
    dict,
    getGroundY,
    drawPlayer,
    drawScrumMaster,
    drawObstacle,
    drawQuoteBubble,
  ]);

  // Input handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        startOrRestart();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [startOrRestart]);

  const handleTouch = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      e.preventDefault();
      startOrRestart();
    },
    [startOrRestart],
  );

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4 font-mono text-sm">
        <p className="text-muted">{dict.instructions}</p>
        <div className="flex gap-4 text-muted shrink-0 ml-4">
          <span>
            {dict.score}: {displayScore}
          </span>
          {displayHighScore > 0 && (
            <span>
              {dict.highScore}: {displayHighScore}
            </span>
          )}
        </div>
      </div>
      <div className="relative border border-foreground/10 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full cursor-pointer"
          style={{ touchAction: "none" }}
          onMouseDown={handleTouch}
          onTouchStart={handleTouch}
        />
        {uiState === "gameover" && (
          <div className="absolute top-3 right-3 font-mono text-sm text-muted">
            {dict.score}: {displayScore}
          </div>
        )}
      </div>
    </div>
  );
}
