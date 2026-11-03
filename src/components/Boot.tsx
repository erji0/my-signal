import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { blip } from '../lib/audio';

type Stage = 'returning' | 'receive' | 'decode' | 'gate' | 'result';

const RECEIVE_LOGS: { at: number; text: string; warn?: boolean }[] = [
  { at: 200, text: '[SYS] 监听阵列 DEEP-SPACE #03 —— 已上线' },
  { at: 900, text: '[SYS] 频段扫描 · 1,420.4058 MHz —— 氢线' },
  { at: 1600, text: '[OCT] 捕获重复脉冲 · 间隔 7.13 s' },
  { at: 2300, text: '[WARN] 脉冲呈现语言结构 —— 它有话要说', warn: true },
  { at: 3000, text: '[SYS] 载荷截获 · 全长 433 s' },
];
const DECODE_LOGS: { at: number; text: string; warn?: boolean }[] = [
  { at: 120, text: '[SYS] 校验和通过 · 未检出恶意代码（暂时）' },
  { at: 750, text: '[SYS] 语料对齐中 … 碳基语系 · 汉语分支' },
  { at: 1350, text: '[SYS] 情感指纹解析中 … 检出「一点点中二」', warn: true },
];

export function Boot({ returning, sound, onDone }: { returning: boolean; sound: boolean; onDone: () => void }) {
  const [stage, setStage] = useState<Stage>(returning ? 'returning' : 'receive');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<{ text: string; warn?: boolean }[]>([]);
  const [choice, setChoice] = useState<'accept' | 'refuse' | null>(null);
  const alive = useRef(true);
  const acceptRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  /* progress ticker */
  useEffect(() => {
    if (stage !== 'receive' && stage !== 'decode' && stage !== 'returning') return;
    const cap = stage === 'receive' ? 62 : stage === 'decode' ? 96.7 : 100;
    const stepMs = 95;
    const speedPerStep = stage === 'receive' ? 2.1 : stage === 'decode' ? 2.0 : 9;
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= cap) return p;
        return Math.min(cap, p + speedPerStep * (0.35 + Math.random() * 0.9));
      });
    }, stepMs);
    return () => clearInterval(id);
  }, [stage]);

  /* stage advances when progress reaches its cap */
  useEffect(() => {
    if (stage === 'receive' && progress >= 62) {
      const t = setTimeout(() => alive.current && setStage('decode'), 420);
      return () => clearTimeout(t);
    }
    if (stage === 'decode' && progress >= 96.7) {
      const t = setTimeout(() => alive.current && setStage('gate'), 420);
      return () => clearTimeout(t);
    }
    if (stage === 'returning' && progress >= 100) {
      const t = setTimeout(() => alive.current && onDone(), 800);
      return () => clearTimeout(t);
    }
  }, [progress, stage, onDone]);

  /* log playback per stage */
  useEffect(() => {
    if (stage === 'receive' || stage === 'decode') {
      setLogs([]);
      const lines = stage === 'receive' ? RECEIVE_LOGS : DECODE_LOGS;
      const timers = lines.map((l) =>
        setTimeout(() => alive.current && setLogs((prev) => [...prev.slice(-4), { text: l.text, warn: l.warn }]), l.at)
      );
      return () => timers.forEach(clearTimeout);
    }
    if (stage === 'returning') {
      const t1 = setTimeout(() => alive.current && setLogs([{ text: '[SYS] 既往接触记录 · 已找到' }]), 120);
      const t2 = setTimeout(() => alive.current && setLogs((p) => [...p, { text: '[SYS] 身份核验：老朋友。直接解锁。', warn: true }]), 650);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [stage]);

  useEffect(() => {
    if (stage === 'gate') acceptRef.current?.focus();
  }, [stage]);

  const choose = (kind: 'accept' | 'refuse') => {
    blip(kind === 'accept' ? 'key' : 'error', sound);
    setChoice(kind);
    setStage('result');
    const wait = kind === 'accept' ? 1600 : 3000;
    setTimeout(() => alive.current && onDone(), wait);
  };

  return (
    <div className={`boot stage-${stage}`} role="dialog" aria-modal="true" aria-label="信号接收仪式">
      <div className="boot-top mono">
        <span>DEEP-SPACE LISTENING ARRAY #03</span>
        <span>1420.4058 MHz · HYDROGEN LINE</span>
      </div>

      <div className="boot-center">
        {stage !== 'gate' && stage !== 'result' && (
          <>
            <p className="boot-kicker mono"><i className="rec-dot" /> INCOMING TRANSMISSION</p>
            <h1 className="boot-title">
              {stage === 'returning' ? '欢迎回来。' : stage === 'receive' ? '信号接收中' : '正在解译'}
              <span className="dots-run" aria-hidden="true"><i /><i /><i /></span>
            </h1>
            <div className={`wave ${stage === 'decode' ? 'is-decoding' : ''}`} aria-hidden="true">
              {Array.from({ length: 42 }, (_, i) => (
                <i key={i} style={{ '--i': i, '--h': `${26 + ((i * 37) % 62)}%` } as CSSProperties} />
              ))}
            </div>
            <div className="boot-percent mono">{progress.toFixed(1)}<small>%</small></div>
            <div className="boot-track" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} aria-label="解译进度">
              <span style={{ width: `${progress}%` }} />
            </div>
            <div className="boot-log mono" aria-live="polite">
              {logs.map((l, i) => <p key={`${i}-${l.text}`} className={l.warn ? 'warn' : ''}>{l.text}</p>)}
            </div>
          </>
        )}

        {stage === 'gate' && (
          <div className="gate flicker-in">
            <div className="gate-triangle" aria-hidden="true">
              <svg viewBox="0 0 64 58" fill="none"><path d="M32 4 60 54H4L32 4Z" stroke="#ff4d47" strokeWidth="2.5" strokeLinejoin="round" /><path d="M32 20v14" stroke="#ff4d47" strokeWidth="3.5" strokeLinecap="round" /><circle cx="32" cy="43" r="2.6" fill="#ff4d47" /></svg>
            </div>
            <p className="gate-code mono">WARNING // UNKNOWN ORIGIN</p>
            <h1 className="gate-title">警告：未知信号源</h1>
            <p className="gate-desc">该源未在任何已知文明目录中登记。<br />完整接收此信号，将视为一次<b>主动接触</b>。</p>
            <div className="gate-actions">
              <button className="btn btn-red" onClick={() => choose('accept')} ref={acceptRef}>接收信号</button>
              <button className="btn btn-ghost" onClick={() => choose('refuse')}>保持沉默</button>
            </div>
            <p className="gate-fine mono">依据《黑暗森林接触守则》第 42 条：好奇心须自行承担全部后果。</p>
          </div>
        )}

        {stage === 'result' && (
          <div className={`boot-result flicker-in ${choice}`}>
            {choice === 'accept' ? (
              <>
                <p className="result-line mono ok" style={{ animationDelay: '0s' }}>接收确认。身份核验：碳基生命 · 友好度 98.7%</p>
                <p className="result-line mono ok" style={{ animationDelay: '.35s' }}>正在展开完整档案 ——</p>
                <p className="result-line mono ok" style={{ animationDelay: '.7s' }}>请保持冷静。它只是个普通人。</p>
              </>
            ) : (
              <>
                <p className="result-line mono bad" style={{ animationDelay: '0s' }}>静默指令已执行。</p>
                <p className="result-line mono bad" style={{ animationDelay: '.6s' }}>……无效。信号穿透了静默。</p>
                <p className="result-line mono bad" style={{ animationDelay: '1.3s' }}>它说：「没关系，我等你们。」</p>
                <p className="result-line mono dim" style={{ animationDelay: '2s' }}>监听员备注：它真的已经等了 4.24 光年。</p>
              </>
            )}
          </div>
        )}
      </div>

      {(stage === 'receive' || stage === 'decode') && (
        <button className="boot-skip mono" onClick={() => { blip('key', sound); setProgress(96.7); setStage('gate'); }}>
          跳过仪式 »»
        </button>
      )}
    </div>
  );
}
