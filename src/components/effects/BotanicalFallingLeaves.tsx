import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  swayAngle: number;
  swaySpeed: number;
  swayWidth: number;
  rotation: number;
  rotationSpeed: number;
  flipAngle: number;
  flipSpeed: number;
  opacity: number;
  type: "petal" | "leaf";
  colorIdx: number;
}

const PETAL_COLORS = [
  { main: "rgba(243, 216, 210, ", shadow: "rgba(212, 155, 149, " }, // blush
  { main: "rgba(248, 226, 220, ", shadow: "rgba(224, 172, 166, " }, // soft peach-blush
  { main: "rgba(255, 243, 238, ", shadow: "rgba(235, 195, 188, " }, // ivory-blush
];

const LEAF_COLORS = [
  { main: "rgba(190, 201, 183, ", vein: "rgba(138, 153, 130, " }, // sage
  { main: "rgba(175, 189, 167, ", vein: "rgba(122, 138, 114, " }, // muted olive
  { main: "rgba(206, 216, 200, ", vein: "rgba(152, 168, 145, " }, // soft light sage
];

interface BotanicalFallingLeavesProps {
  className?: string;
}

export function BotanicalFallingLeaves({
  className = "pointer-events-none absolute inset-0 z-10 h-full w-full",
}: BotanicalFallingLeavesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    const container = canvas.parentElement || document.body;

    let width = (canvas.width = container.clientWidth || window.innerWidth);
    let height = (canvas.height = container.clientHeight || window.innerHeight);

    const updateSize = () => {
      if (!canvas) return;
      const c = canvas.parentElement || document.body;
      width = canvas.width = c.clientWidth || window.innerWidth;
      height = canvas.height = c.clientHeight || window.innerHeight;
    };

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && canvas.parentElement) {
      resizeObserver = new ResizeObserver(() => updateSize());
      resizeObserver.observe(canvas.parentElement);
    } else {
      window.addEventListener("resize", updateSize, { passive: true });
    }

    // Density: ~18 particles on desktop, ~10 on mobile
    const count = width >= 768 ? 18 : 10;
    const particles: Particle[] = [];

    const createParticle = (initialY?: number): Particle => {
      const isPetal = Math.random() > 0.4;
      return {
        x: Math.random() * width,
        y: initialY !== undefined ? initialY : Math.random() * height,
        size: isPetal ? 14 + Math.random() * 10 : 12 + Math.random() * 10,
        speedY: 0.5 + Math.random() * 0.7,
        speedX: -0.2 + Math.random() * 0.4,
        swayAngle: Math.random() * Math.PI * 2,
        swaySpeed: 0.012 + Math.random() * 0.018,
        swayWidth: 0.6 + Math.random() * 1.0,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.015,
        flipAngle: Math.random() * Math.PI * 2,
        flipSpeed: 0.01 + Math.random() * 0.02,
        opacity: 0.55 + Math.random() * 0.35,
        type: isPetal ? "petal" : "leaf",
        colorIdx: Math.floor(Math.random() * 3),
      };
    };

    for (let i = 0; i < count; i++) {
      particles.push(createParticle());
    }

    let isVisible = true;
    const handleVisibilityChange = () => {
      isVisible = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const drawPetal = (p: Particle) => {
      const colors = PETAL_COLORS[p.colorIdx];
      const s = p.size;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.scale(Math.cos(p.flipAngle), 1);

      ctx.beginPath();
      ctx.moveTo(0, -s * 0.6);
      ctx.bezierCurveTo(s * 0.55, -s * 0.55, s * 0.65, s * 0.3, 0, s * 0.7);
      ctx.bezierCurveTo(-s * 0.65, s * 0.3, -s * 0.55, -s * 0.55, 0, -s * 0.6);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, -s * 0.6, 0, s * 0.7);
      grad.addColorStop(0, `${colors.main}${p.opacity})`);
      grad.addColorStop(1, `${colors.shadow}${p.opacity * 0.85})`);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.restore();
    };

    const drawLeaf = (p: Particle) => {
      const colors = LEAF_COLORS[p.colorIdx];
      const s = p.size;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.scale(Math.cos(p.flipAngle), 1);

      ctx.beginPath();
      ctx.moveTo(0, -s * 0.75);
      ctx.bezierCurveTo(s * 0.42, -s * 0.35, s * 0.42, s * 0.35, 0, s * 0.75);
      ctx.bezierCurveTo(-s * 0.42, s * 0.35, -s * 0.42, -s * 0.35, 0, -s * 0.75);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, -s * 0.75, 0, s * 0.75);
      grad.addColorStop(0, `${colors.main}${p.opacity})`);
      grad.addColorStop(1, `${colors.vein}${p.opacity * 0.9})`);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(0, -s * 0.6);
      ctx.lineTo(0, s * 0.65);
      ctx.strokeStyle = `${colors.vein}${p.opacity * 0.6})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.restore();
    };

    const render = () => {
      if (!isVisible) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.swayAngle += p.swaySpeed;
        p.flipAngle += p.flipSpeed;
        p.rotation += p.rotationSpeed;

        p.x += p.speedX + Math.sin(p.swayAngle) * p.swayWidth;
        p.y += p.speedY;

        if (p.y > height + 30) {
          particles[i] = createParticle(-30);
        } else if (p.x < -30) {
          p.x = width + 20;
        } else if (p.x > width + 30) {
          p.x = -20;
        }

        if (p.type === "petal") {
          drawPetal(p);
        } else {
          drawLeaf(p);
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", updateSize);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
    />
  );
}
