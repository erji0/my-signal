import { useEffect, useRef, useState } from 'react';

const GLYPHS = '█▓▒░◢◣△▲<>/|01ΞΣΦΨΩλ×·';

type Props = {
  text: string;
  className?: string;
  /** Increase to replay the decode animation (e.g. on hover). */
  trigger?: number;
  speed?: number;
};

/** Text that "decodes" from signal noise into its final glyphs. */
export function ScrambleText({ text, className = '', trigger = 0, speed = 26 }: Props) {
  const [display, setDisplay] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let revealed = 0;
    const total = text.length;
    const tick = () => {
      revealed = Math.min(total, revealed + 1 + Math.floor(Math.random() * 1.6));
      let out = '';
      for (let i = 0; i < total; i++) {
        const ch = text[i];
        out += i < revealed || ch === ' ' || ch === '\n' || ch === ' '
          ? ch
          : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setDisplay(out);
      if (revealed < total) timer.current = setTimeout(tick, speed);
    };
    timer.current = setTimeout(tick, speed);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [text, trigger, speed]);

  return <span className={className} aria-label={text} style={{ whiteSpace: 'pre-line' }}>{display}</span>;
}
