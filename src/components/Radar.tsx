import { useEffect, useState } from 'react';

/** Deep-space scope panel: rotating sweep, locked target, jittering telemetry. */
export function Radar() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((v) => v + 1), 900);
    return () => clearInterval(id);
  }, []);

  const az = (214.62 + Math.sin(tick * 0.7) * 0.06).toFixed(2);
  const snr = (142.0 + Math.sin(tick * 1.3) * 0.5).toFixed(1);
  const el = (62.34 + Math.cos(tick * 0.9) * 0.04).toFixed(2);

  return (
    <div className="radar-panel hud-frame">
      <div className="panel-head">
        <span className="dots-3" aria-hidden="true"><i /><i /><i /></span>
        <span className="panel-title mono">DEEP-SPACE SCOPE · L-03</span>
        <span className="target-lock mono"><i className="lock-dot" />TARGET LOCKED</span>
      </div>
      <div className="radar-body">
        <svg className="radar-svg" viewBox="0 0 320 320" role="img" aria-label="深空示波器，已锁定信号源 LX-0713">
          <defs>
            <radialGradient id="sweep" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(55,226,196,0.35)" />
              <stop offset="100%" stopColor="rgba(55,226,196,0)" />
            </radialGradient>
          </defs>
          <circle cx="160" cy="160" r="150" className="rg-ring" />
          <circle cx="160" cy="160" r="112" className="rg-ring" />
          <circle cx="160" cy="160" r="74" className="rg-ring" />
          <circle cx="160" cy="160" r="37" className="rg-ring" />
          <path d="M160 10v300M10 160h300" className="rg-cross" />
          <path d="M54 54l212 212M266 54 54 266" className="rg-cross dim" />
          <g className="radar-sweep">
            <path d="M160 160 160 12 A148 148 0 0 1 236 32 Z" fill="url(#sweep)" />
            <path d="M160 160 160 12" stroke="#37e2c4" strokeWidth="1.6" strokeLinecap="round" />
          </g>
          <circle cx="236" cy="196" r="3.2" className="blip b1" />
          <circle cx="112" cy="102" r="2.4" className="blip b2" />
          <circle cx="198" cy="88" r="2" className="blip b3" />
          <g className="target">
            <circle cx="236" cy="196" r="11" className="target-ring" />
            <path d="M236 181v8m0 14v8M221 196h8m14 0h8" stroke="#ff4d47" strokeWidth="1.2" />
          </g>
          <circle cx="160" cy="160" r="3" fill="#37e2c4" />
          <text x="160" y="168" textAnchor="middle" dy="16" className="radar-label">ORIGIN</text>
          <text x="298" y="166" textAnchor="end" className="radar-label">0°</text>
          <text x="166" y="24" className="radar-label">90°</text>
        </svg>
      </div>
      <div className="radar-readout mono" aria-hidden="true">
        <span>AZ <b>{az}°</b></span>
        <span>EL <b>{el}°</b></span>
        <span>SNR <b>{snr} dB</b></span>
        <span>DIST <b>4.24 ly</b></span>
      </div>
    </div>
  );
}
