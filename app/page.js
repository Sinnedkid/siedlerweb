import { useEffect, useRef, useState } from "react";

export default function Home() {
  return (
      <div className="flex flex-col items-center justify-between min-h-screen bg-black text-white p-4">
        <h1 className="text-4xl md:text-6xl font-bold mt-8 text-center">Siedler coming soon</h1>
        <div className="mt-auto w-full max-w-md aspect-square">
          <SnakeGame />
        </div>
      </div>
  );
}

function SnakeGame() {
  const canvasRef = useRef(null);
  const [direction, setDirection] = useState("RIGHT");
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [gameOver, setGameOver] = useState(false);

  const gridSize = 20;
  const tileCount = 20;

  const getNextHead = (dir, currentHead) => {
    const { x, y } = currentHead;
    switch (dir) {
      case "LEFT": return { x: x - 1, y };
      case "UP": return { x, y: y - 1 };
      case "RIGHT": return { x: x + 1, y };
      case "DOWN": return { x, y: y + 1 };
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case "ArrowLeft": if (direction !== "RIGHT") setDirection("LEFT"); break;
        case "ArrowUp": if (direction !== "DOWN") setDirection("UP"); break;
        case "ArrowRight": if (direction !== "LEFT") setDirection("RIGHT"); break;
        case "ArrowDown": if (direction !== "UP") setDirection("DOWN"); break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [direction]);

  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    };

    const handleTouchEnd = (e) => {
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && direction !== "LEFT") setDirection("RIGHT");
        else if (dx < 0 && direction !== "RIGHT") setDirection("LEFT");
      } else {
        if (dy > 0 && direction !== "UP") setDirection("DOWN");
        else if (dy < 0 && direction !== "DOWN") setDirection("UP");
      }
    };

    const canvas = canvasRef.current;
    canvas.addEventListener("touchstart", handleTouchStart);
    canvas.addEventListener("touchend", handleTouchEnd);

    return () => {
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchend", handleTouchEnd);
    };
  }, [direction]);

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");

    const interval = setInterval(() => {
      const newSnake = [...snake];
      const head = getNextHead(direction, newSnake[0]);

      if (
          head.x < 0 || head.y < 0 ||
          head.x >= tileCount || head.y >= tileCount ||
          newSnake.some((s) => s.x === head.x && s.y === head.y)
      ) {
        setGameOver(true);
        clearInterval(interval);
        return;
      }

      newSnake.unshift(head);
      if (head.x === food.x && head.y === food.y) {
        setFood({
          x: Math.floor(Math.random() * tileCount),
          y: Math.floor(Math.random() * tileCount),
        });
      } else {
        newSnake.pop();
      }
      setSnake(newSnake);

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, gridSize * tileCount, gridSize * tileCount);

      ctx.fillStyle = "lime";
      newSnake.forEach((segment) => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 1, gridSize - 1);
      });

      ctx.fillStyle = "red";
      ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 1, gridSize - 1);
    }, 150);

    return () => clearInterval(interval);
  }, [snake, direction, food]);

  return (
      <>
        <canvas
            ref={canvasRef}
            width={gridSize * tileCount}
            height={gridSize * tileCount}
            className="w-full h-full border border-white rounded"
        />
        {gameOver && <div className="text-center mt-2 text-red-500 font-bold">Game Over</div>}
      </>
  );
}

