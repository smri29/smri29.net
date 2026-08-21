import { useEffect, useRef } from 'react';

const MIN_PARTICLES = 52;
const MAX_PARTICLES = 110;
const AREA_PER_PARTICLE = 18000;
const CONNECTION_DISTANCE = 165;
const CURSOR_RADIUS = 170;
const CURSOR_LINK_RADIUS = 210;
const SPEED_LIMIT = 1.28;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const readRgbVariable = (styles, name, fallback) => {
  const raw = styles.getPropertyValue(name).trim();
  return raw || fallback;
};

const toRgba = (rgb, alpha) => `rgba(${rgb.replace(/\s+/g, ', ')}, ${alpha})`;

const createParticle = (width, height, colors) => ({
  x: Math.random() * width,
  y: Math.random() * height,
  vx: (Math.random() - 0.5) * SPEED_LIMIT,
  vy: (Math.random() - 0.5) * SPEED_LIMIT,
  radius: 1.4 + Math.random() * 2.2,
  color: colors[Math.floor(Math.random() * colors.length)],
  phase: Math.random() * Math.PI * 2,
  drift: 0.3 + Math.random() * 0.52,
});

const InteractiveNetworkBackground = ({ className = 'fixed inset-0 z-[1]' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const context = canvas.getContext('2d', { alpha: true });
    if (!context) {
      return undefined;
    }

    const styles = window.getComputedStyle(document.documentElement);
    const palette = {
      accent: readRgbVariable(styles, '--accent-300-rgb', '74 222 255'),
      accentSoft: readRgbVariable(styles, '--accent-200-rgb', '181 240 255'),
      secondary: readRgbVariable(styles, '--secondary-300-rgb', '255 78 194'),
      glow: readRgbVariable(styles, '--glow-secondary-rgb', '51 255 136'),
      white: '236 244 255',
      whiteSoft: '208 220 236',
    };

    const particleColors = [palette.accent, palette.accentSoft, palette.secondary, palette.glow];
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = { x: 0, y: 0, active: false };

    let animationFrameId = 0;
    let width = 0;
    let height = 0;
    let particles = [];
    let isReducedMotion = mediaQuery.matches;
    let tick = 0;

    const updateCanvasSize = () => {
      const bounds = canvas.parentElement?.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.6);
      width = Math.max(1, Math.floor(bounds?.width || window.innerWidth));
      height = Math.max(1, Math.floor(bounds?.height || window.innerHeight));
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const seedParticles = () => {
      const nextCount = clamp(Math.round((width * height) / AREA_PER_PARTICLE), MIN_PARTICLES, MAX_PARTICLES);
      particles = Array.from({ length: nextCount }, () => createParticle(width, height, particleColors));
    };

    const resizeScene = () => {
      updateCanvasSize();
      seedParticles();
    };

    const handlePointerMove = (event) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      pointer.active = true;
    };

    const handlePointerLeave = () => {
      pointer.active = false;
    };

    const handleReducedMotionChange = (event) => {
      isReducedMotion = event.matches;
    };

    const updateParticles = () => {
      tick += 0.026;

      for (const particle of particles) {
        if (!isReducedMotion) {
          const driftAngle = tick + particle.phase;
          particle.vx += Math.cos(driftAngle) * particle.drift * 0.013;
          particle.vy += Math.sin(driftAngle * 1.1) * particle.drift * 0.013;
          particle.x += particle.vx;
          particle.y += particle.vy;
        }

        if (particle.x <= 0 || particle.x >= width) {
          particle.vx *= -1;
          particle.x = clamp(particle.x, 0, width);
        }

        if (particle.y <= 0 || particle.y >= height) {
          particle.vy *= -1;
          particle.y = clamp(particle.y, 0, height);
        }

        if (pointer.active) {
          const dx = pointer.x - particle.x;
          const dy = pointer.y - particle.y;
          const distance = Math.hypot(dx, dy);

          if (distance > 0 && distance < CURSOR_RADIUS) {
            const force = (CURSOR_RADIUS - distance) / CURSOR_RADIUS;
            particle.vx += (dx / distance) * force * 0.014;
            particle.vy += (dy / distance) * force * 0.014;
            particle.vx = clamp(particle.vx, -1.4, 1.4);
            particle.vy = clamp(particle.vy, -1.4, 1.4);
          }
        }

        particle.vx = clamp(particle.vx, -SPEED_LIMIT, SPEED_LIMIT);
        particle.vy = clamp(particle.vy, -SPEED_LIMIT, SPEED_LIMIT);
        particle.vx *= 0.997;
        particle.vy *= 0.997;
      }
    };

    const drawLinks = () => {
      for (let i = 0; i < particles.length; i += 1) {
        const source = particles[i];
        for (let j = i + 1; j < particles.length; j += 1) {
          const target = particles[j];
          const dx = source.x - target.x;
          const dy = source.y - target.y;
          const distance = Math.hypot(dx, dy);

          if (distance > CONNECTION_DISTANCE) {
            continue;
          }

          const alpha = (1 - distance / CONNECTION_DISTANCE) * 0.34;
          const gradient = context.createLinearGradient(source.x, source.y, target.x, target.y);
          gradient.addColorStop(0, toRgba(palette.white, alpha));
          gradient.addColorStop(0.5, toRgba(palette.whiteSoft, alpha * 0.9));
          gradient.addColorStop(1, toRgba(palette.white, alpha * 0.82));

          context.beginPath();
          context.strokeStyle = gradient;
          context.lineWidth = 0.95;
          context.moveTo(source.x, source.y);
          context.lineTo(target.x, target.y);
          context.stroke();
        }
      }
    };

    const drawCursorLinks = () => {
      if (!pointer.active) {
        return;
      }

      for (const particle of particles) {
        const dx = pointer.x - particle.x;
        const dy = pointer.y - particle.y;
        const distance = Math.hypot(dx, dy);

        if (distance > CURSOR_LINK_RADIUS) {
          continue;
        }

        const alpha = (1 - distance / CURSOR_LINK_RADIUS) * 0.4;
        context.beginPath();
        context.strokeStyle = toRgba(palette.white, alpha * 1.05);
        context.lineWidth = 1.05;
        context.moveTo(pointer.x, pointer.y);
        context.lineTo(particle.x, particle.y);
        context.stroke();
      }

      const glow = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 90);
      glow.addColorStop(0, toRgba(palette.white, 0.16));
      glow.addColorStop(0.3, toRgba(palette.accent, 0.12));
      glow.addColorStop(0.55, toRgba(palette.secondary, 0.08));
      glow.addColorStop(1, toRgba(palette.glow, 0));
      context.beginPath();
      context.fillStyle = glow;
      context.arc(pointer.x, pointer.y, 90, 0, Math.PI * 2);
      context.fill();
    };

    const drawParticles = () => {
      for (const particle of particles) {
        context.beginPath();
        context.fillStyle = toRgba(palette.white, 0.2);
        context.arc(particle.x, particle.y, particle.radius + 2.4, 0, Math.PI * 2);
        context.fill();

        context.beginPath();
        context.fillStyle = toRgba(particle.color, 0.98);
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        context.fill();
      }
    };

    const drawFrame = () => {
      context.clearRect(0, 0, width, height);
      updateParticles();
      drawLinks();
      drawCursorLinks();
      drawParticles();
      animationFrameId = window.requestAnimationFrame(drawFrame);
    };

    resizeScene();
    drawFrame();

    window.addEventListener('resize', resizeScene);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerleave', handlePointerLeave);
    mediaQuery.addEventListener('change', handleReducedMotionChange);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeScene);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handlePointerLeave);
      mediaQuery.removeEventListener('change', handleReducedMotionChange);
    };
  }, []);

  return (
    <div className={`pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
      <canvas ref={canvasRef} className="h-full w-full opacity-[1]" />
    </div>
  );
};

export default InteractiveNetworkBackground;
