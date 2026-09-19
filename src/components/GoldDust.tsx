import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  alpha: number;
  vx: number;
  vy: number;
  phase: number;
  phaseSpeed: number;
  color: string;
  isSparkle: boolean;
  sparkleSize: number;
}

export const GoldDust: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Premium gold palette for particles
    const goldColors = [
      '#D4AF37', // Primary gold
      '#C9A227', // Royal metallic gold
      '#F5E7A8', // Light gold highlight
      '#A67C00', // Dark deep gold
      '#E6CA65', // Shimmer gold
    ];

    const particleCount = prefersReducedMotion ? 25 : Math.min(65, Math.floor((width * height) / 28000));
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const isSparkle = Math.random() < 0.18;
      const baseAlpha = isSparkle ? 0.4 + Math.random() * 0.5 : 0.2 + Math.random() * 0.5;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: isSparkle ? 1.2 + Math.random() * 1.5 : 0.6 + Math.random() * 1.6,
        baseAlpha,
        alpha: baseAlpha,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -0.15 - Math.random() * 0.35,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.015 + Math.random() * 0.025,
        color: goldColors[Math.floor(Math.random() * goldColors.length)],
        isSparkle,
        sparkleSize: 2 + Math.random() * 3,
      });
    }

    const drawSparkle = (cx: number, cy: number, size: number, alpha: number, color: string) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.shadowColor = '#D4AF37';
      ctx.shadowBlur = 6;

      // 4-point subtle star sparkle
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        const x1 = cx + Math.cos(angle) * size;
        const y1 = cy + Math.sin(angle) * size;
        const x2 = cx + Math.cos(angle + Math.PI / 4) * (size * 0.25);
        const y2 = cy + Math.sin(angle + Math.PI / 4) * (size * 0.25);
        if (i === 0) ctx.moveTo(x1, y1);
        else ctx.lineTo(x1, y1);
        ctx.lineTo(x2, y2);
      }
      ctx.closePath();
      ctx.fill();

      // Central core dot
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.phase += p.phaseSpeed;
        p.alpha = Math.max(0.1, p.baseAlpha + Math.sin(p.phase) * (p.baseAlpha * 0.6));

        if (!prefersReducedMotion) {
          p.x += p.vx + Math.sin(p.phase * 0.5) * 0.15;
          p.y += p.vy;

          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
        }

        if (p.isSparkle && p.alpha > 0.45) {
          drawSparkle(p.x, p.y, p.sparkleSize * (p.alpha / p.baseAlpha), p.alpha, p.color);
        } else {
          ctx.save();
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.shadowColor = '#D4AF37';
          ctx.shadowBlur = 3;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 opacity-80"
      style={{
        mixBlendMode: 'multiply',
      }}
    />
  );
};
