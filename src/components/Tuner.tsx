import { useState } from 'react';
import { blip } from '../lib/audio';
import { ScrambleText } from './Scramble';

const TARGET = 1420.406;
const MIN = 1418;
const MAX = 1422;

export function Tuner({ sound, unlocked, onUnlock }: { sound: boolean; unlocked: boolean; onUnlock: () => void }) {
  const [freq, setFreq] = useState(1419.2);

  const distance = Math.abs(freq - TARGET);
  const quality = Math.max(0, 1 - distance / 0.6);
  const litBars = Math.round(quality * 14);
  const hint = unlocked
    ? '已锁定 · 隐藏碎片 FR-07 已收录'
    : quality > 0.85
      ? '信道快要闭合了。再轻轻推一点。'
      : quality > 0.5
        ? '方向正确。噪声正在退去。'
        : '大部分频段里只有宇宙的呼吸声。继续找。';

  const change = (v: number) => {
    if (unlocked) { setFreq(TARGET); return; }
    if (Math.abs(v - TARGET) < 0.05) {
      setFreq(TARGET);
      onUnlock();
      try { navigator.vibrate?.(30); } catch { /* optional */ }
      blip('lock', sound);
      return;
    }
    setFreq(v);
  };

  return (
    <div className={`tuner hud-frame ${unlocked ? 'is-locked' : ''}`}>
      <div className="panel-head">
        <span className="dots-3" aria-hidden="true"><i /><i /><i /></span>
        <span className="panel-title mono">FREQUENCY TUNER · 频段调谐器</span>
        <span className={`tuner-state mono ${unlocked ? 'ok' : ''}`}>{unlocked ? 'LOCKED' : 'SEARCHING'}</span>
      </div>

      <div className="tuner-face">
        <div className="tuner-readout">
          <span className="tuner-freq mono">{freq.toFixed(3)}</span>
          <span className="tuner-unit mono">MHz</span>
          <span className="tuner-ref mono">氢线 HYDROGEN LINE —— 1420.406</span>
        </div>
        <div className="signal-meter" aria-hidden="true">
          {Array.from({ length: 14 }, (_, i) => (
            <i key={i} className={i < litBars ? (i > 10 ? 'hot' : 'on') : ''} />
          ))}
          <span className="meter-label mono">SIGNAL</span>
        </div>
      </div>

      <input
        className="tuner-range"
        type="range"
        min={MIN}
        max={MAX}
        step={0.001}
        value={freq}
        disabled={unlocked}
        onChange={(e) => change(Number(e.target.value))}
        aria-label="频段调谐，把指针推向 1420.406 MHz"
        aria-valuetext={`${freq.toFixed(3)} MHz`}
      />
      <div className="tuner-ticks mono" aria-hidden="true">
        {[1418, 1419, 1420, 1421, 1422].map((t) => <span key={t}>{t}</span>)}
      </div>
      <p className="tuner-hint mono" aria-live="polite">{hint}</p>

      {unlocked && (
        <div className="fr07 flicker-in">
          <span className="stamp mono" aria-hidden="true">绝密</span>
          <p className="mono fr07-no">FR-07 // 信号源自白</p>
          <blockquote>
            <ScrambleText
              text={'「我知道这只是一个个人主页。但如果连介绍自己都不敢搞得浪漫一点，那宇宙未免太无聊了。」'}
              speed={24}
            />
          </blockquote>
          <p className="fr07-verdict mono">最终评级：有趣 · 建议与该文明建立长期联系 [ 已确认 ]</p>
        </div>
      )}
    </div>
  );
}
