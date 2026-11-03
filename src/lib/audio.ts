let ctx: AudioContext | null = null;

function ensureCtx(): AudioContext | null {
  if (ctx) return ctx;
  const AC: typeof AudioContext | undefined =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  try { ctx = new AC(); } catch { return null; }
  return ctx;
}

type Kind = 'key' | 'lock' | 'alert' | 'send' | 'error';

/** Tiny synthesized UI sounds. Only ever fired from user gestures. */
export function blip(kind: Kind, enabled: boolean) {
  if (!enabled) return;
  const c = ensureCtx();
  if (!c) return;
  if (c.state === 'suspended') void c.resume().catch(() => undefined);
  const t = c.currentTime;
  const master = c.createGain();
  master.gain.value = 0.05;
  master.connect(c.destination);

  const tone = (freq: number, start: number, dur: number, type: OscillatorType, vol = 1) => {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t + start);
    g.gain.setValueAtTime(0, t + start);
    g.gain.linearRampToValueAtTime(vol, t + start + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + start + dur);
    o.connect(g); g.connect(master);
    o.start(t + start); o.stop(t + start + dur + 0.05);
  };

  switch (kind) {
    case 'key':
      tone(1140, 0, 0.07, 'square', 0.5);
      tone(2280, 0, 0.04, 'square', 0.18);
      break;
    case 'send': {
      const o = c.createOscillator(); const g = c.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(520, t);
      o.frequency.exponentialRampToValueAtTime(1240, t + 0.16);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.8, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
      o.connect(g); g.connect(master);
      o.start(t); o.stop(t + 0.25);
      break;
    }
    case 'lock': {
      const o = c.createOscillator(); const g = c.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(660, t);
      o.frequency.exponentialRampToValueAtTime(1580, t + 0.28);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.9, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42);
      o.connect(g); g.connect(master);
      o.start(t); o.stop(t + 0.5);
      tone(2100, 0.3, 0.12, 'square', 0.25);
      break;
    }
    case 'alert':
      for (let i = 0; i < 3; i++) {
        tone(196, i * 0.24, 0.16, 'sawtooth', 0.55);
        tone(392, i * 0.24 + 0.1, 0.12, 'sawtooth', 0.35);
      }
      break;
    case 'error':
      tone(140, 0, 0.22, 'sawtooth', 0.7);
      tone(98, 0.1, 0.3, 'square', 0.4);
      break;
  }
}
