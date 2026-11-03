import { useEffect, useRef } from 'react';

type Star = { x: number; y: number; r: number; depth: number; phase: number; speed: number; red: boolean };
type Streak = { x: number; y: number; vx: number; vy: number; life: number; max: number; red: boolean };

/** Full-viewport deep-space canvas: drifting stars + occasional signal streaks. */
export function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0, h = 0, raf = 0, last = 0;
    let stars: Star[] = [];
    let streaks: Streak[] = [];
    let nextStreakIn = 2600 + Math.random() * 5000;

    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(260, Math.round((w * h) / 8500));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: 0.3 + Math.random() * 1.3,
        depth: 0.25 + Math.random() * 0.75,
        phase: Math.random() * Math.PI * 2,
        speed: 0.35 + Math.random() * 0.9,
        red: Math.random() < 0.05,
      }));
    };

    const draw = (t: number, dt: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        s.x += 0.012 * s.depth * (dt / 16.7);
        if (s.x > w + 2) s.x = -2;
        const tw = 0.26 + 0.6 * (0.5 + 0.5 * Math.sin((t / 1000) * s.speed + s.phase));
        ctx.globalAlpha = tw;
        ctx.fillStyle = s.red ? '#ff5f58' : '#cfe4ff';
        ctx.fillRect(s.x, s.y, s.r, s.r);
      }
      ctx.globalAlpha = 1;
      if (!reduced) {
        nextStreakIn -= dt;
        if (nextStreakIn <= 0 && streaks.length < 2) {
          nextStreakIn = 7000 + Math.random() * 9000;
          const fromLeft = Math.random() < 0.5;
          streaks.push({
            x: Math.random() * w, y: Math.random() * h * 0.5,
            vx: (fromLeft ? 1 : -1) * (5 + Math.random() * 3),
            vy: 1.4 + Math.random() * 1.1,
            life: 0, max: 62 + Math.random() * 30,
            red: Math.random() < 0.35,
          });
        }
        for (const st of streaks) {
          st.x += st.vx; st.y += st.vy; st.life += 1;
          const a = Math.sin((st.life / st.max) * Math.PI) * 0.7;
          const len = 130;
          const nx = st.x - st.vx * len / 6, ny = st.y - st.vy * len / 6;
          const g = ctx.createLinearGradient(st.x, st.y, nx, ny);
          const col = st.red ? '255,77,71' : '70,240,210';
          g.addColorStop(0, `rgba(${col},${a})`);
          g.addColorStop(1, `rgba(${col},0)`);
          ctx.strokeStyle = g;
          ctx.lineWidth = 1.4;
          ctx.beginPath(); ctx.moveTo(st.x, st.y); ctx.lineTo(nx, ny); ctx.stroke();
        }
        streaks = streaks.filter((st) => st.life < st.max && st.x > -200 && st.x < w + 200 && st.y < h + 200);
      }
    };

    const loop = (t: number) => {
      const dt = Math.min(50, t - last || 16.7);
      last = t;
      draw(t, dt);
      if (!reduced) raf = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener('resize', resize);
    if (reduced) draw(0, 16.7);
    else raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas className="starfield" ref={ref} aria-hidden="true" />;
}
