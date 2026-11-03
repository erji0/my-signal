import { useEffect, useRef, useState } from 'react';
import { Boot } from './components/Boot';
import { Fragments } from './components/Fragments';
import { Radar } from './components/Radar';
import { Reveal } from './components/Reveal';
import { Starfield } from './components/Starfield';
import { Tuner } from './components/Tuner';
import { Uplink } from './components/Terminal';
import { blip } from './lib/audio';

const ls = {
  get(key: string) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key: string, val: string) { try { localStorage.setItem(key, val); } catch { /* private mode */ } },
};

const LOG_LINES: { text: string; kind?: 'warn' | 'dmg' | 'ok' }[] = [
  { text: '> SEG-001 ....... 「记得吃早饭，地球人。」' },
  { text: '> SEG-002 ....... 「今天的云很好看，已经拍下来了。」' },
  { text: '> SEG-003 ....... 「代码有 bug，但晚霞没有。」' },
  { text: '> SEG-004 ....... [数据损坏] —— 貌似是一段哼唱', kind: 'dmg' },
  { text: '> SEG-005 ....... 「宇宙这么大，遇见就算礼物。」' },
  { text: '> ANALYSIS ...... 结论：信号无害。情绪指纹——温暖。', kind: 'ok' },
  { text: '> NOTE .......... 剩余 3.3% 载荷鉴定为「一首诗」，信号源拒绝授权公开。', kind: 'warn' },
];

const METRICS = [
  { label: '好奇心', en: 'CURIOSITY', pct: 96, note: '阈值 80 · 已超出上限', danger: true },
  { label: '夜行性', en: 'NOCTURNAL', pct: 88, note: '峰值 23:00–02:00' },
  { label: '咖啡因依赖', en: 'CAFFEINE', pct: 74, note: '补给速率 ≈ 2.7 杯/日' },
  { label: '温和指数', en: 'GENTLENESS', pct: 92, note: '对猫时可达 100' },
];

/* — small hooks — */

function useNow(active: boolean) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [active]);
  return now;
}

function useCountUp(target: number, start: boolean, dur = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / dur);
      setVal(Math.round(target * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, start, dur]);
  return val;
}

export default function App() {
  const [phase, setPhase] = useState<'boot' | 'main'>('boot');
  const [returning] = useState(() => ls.get('lx0713-received') === '1');
  const [sound, setSound] = useState(() => ls.get('lx0713-sound') !== '0');
  const [alertN, setAlertN] = useState(0);
  const [fr7, setFr7] = useState(() => ls.get('lx0713-fr7') === '1');
  const [logCount, setLogCount] = useState(0);
  const [replaySeed, setReplaySeed] = useState(0);
  const now = useNow(phase === 'main');
  const bootKey = useRef(0);
  const alertTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const unlock = () => {
    ls.set('lx0713-received', '1');
    setPhase('main');
  };

  const raiseAlert = () => {
    setAlertN((n) => n + 1);
    blip('alert', sound);
    if (alertTimer.current) clearTimeout(alertTimer.current);
    alertTimer.current = setTimeout(() => setAlertN(0), 2500);
  };

  /* lock scroll during the receiving ritual */
  useEffect(() => {
    document.body.style.overflow = phase === 'boot' ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [phase]);

  useEffect(() => () => { if (alertTimer.current) clearTimeout(alertTimer.current); }, []);

  /* decode log typewriter */
  useEffect(() => {
    if (phase !== 'main') return;
    setLogCount(0);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setLogCount(i);
      if (i >= LOG_LINES.length) clearInterval(id);
    }, 560);
    return () => clearInterval(id);
  }, [phase, replaySeed]);

  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    ls.set('lx0713-sound', next ? '1' : '0');
    if (next) blip('key', true);
  };

  const replay = () => {
    blip('key', sound);
    bootKey.current += 1;
    setPhase('boot');
    window.scrollTo({ top: 0 });
  };

  const cst = new Date(now.getTime() + (480 + now.getTimezoneOffset()) * 60000);
  const p2 = (n: number) => String(n).padStart(2, '0');
  const clock = `${String(cst.getFullYear()).slice(2)}.${p2(cst.getMonth() + 1)}.${p2(cst.getDate())} — ${p2(cst.getHours())}:${p2(cst.getMinutes())}:${p2(cst.getSeconds())}`;

  return (
    <>
      <Starfield />
      <div className="fx-scanlines" aria-hidden="true" />
      <div className="fx-vignette" aria-hidden="true" />
      {alertN > 0 && <AlertOverlay key={alertN} />}

      {phase === 'boot' && (
        <Boot key={bootKey.current} returning={returning && bootKey.current === 0} sound={sound} onDone={unlock} />
      )}

      {phase === 'main' && (
        <div className="shell">
          <header className="topbar">
            <a className="brand" href="#signal">
              <RadarMark />
              <span className="brand-text mono">SIGNAL://<b>LX-0713</b></span>
              <span className="brand-status mono"><i />已锁定</span>
            </a>
            <nav className="topnav mono" aria-label="档案导航">
              <a href="#signal">信号</a>
              <a href="#fragments">碎片</a>
              <a href="#tuner">调谐</a>
              <a href="#uplink">回应</a>
            </nav>
            <div className="topside">
              <span className="clock mono" aria-label="当前北京时间">{clock} <em>UTC+8</em></span>
              <span className="strength" aria-hidden="true"><i /><i /><i /><i /><i /></span>
              <button className="icon-btn" onClick={toggleSound} aria-label={sound ? '关闭音效' : '开启音效'} title={sound ? '关闭音效' : '开启音效'}>
                {sound ? <IconVolume /> : <IconMute />}
              </button>
              <button className="icon-btn" onClick={replay} aria-label="重播接收仪式" title="重播接收仪式"><IconRefresh /></button>
            </div>
          </header>

          <main>
            {/* ———————— HERO ———————— */}
            <section id="signal" className="hero container">
              <div className="hero-left">
                <p className="hero-kicker mono rise"><span className="rec-pill mono">TRANSMISSION // L-03</span> 第一接触档案 <span className="dim">NO.017</span></p>
                <h1 className="hero-title rise d1">
                  <span className="g-line glitch" data-text="你好，">你好，</span>
                  <span className="g-line glitch" data-text="碳基访客。">碳基访客。</span>
                </h1>
                <p className="hero-sub mono rise d2">// 这不是求救信号。这只是一份自我介绍。</p>
                <p className="hero-desc rise d3">
                  这段信号全长 7 分 13 秒——没有携带坐标、武器或野心，只携带了一个普通碳基生命认真生活过的证明。
                  监听员解译到最后，得出的唯一结论是：<b>它值得被听完。</b>
                </p>
                <div className="hero-cta rise d4">
                  <a className="btn btn-teal" href="#decode" onClick={() => blip('key', sound)}>展开档案 <IconDown /></a>
                  <a className="btn btn-ghost" href="#uplink" onClick={() => blip('key', sound)}>回应信号 <IconArrow /></a>
                </div>
                <ul className="hero-data mono rise d5">
                  <li>信号源自称 · <b>「小林」</b><em>（未经证实）</em></li>
                  <li>栖息地 · <b>东经 120.15° / 北纬 30.27°</b></li>
                  <li>威胁等级 · <b className="ok">无害</b><em>（对甜品除外）</em></li>
                </ul>
              </div>
              <div className="hero-right rise d3">
                <Radar />
              </div>
            </section>

            {/* ———————— TELEMETRY ———————— */}
            <section className="metrics container" aria-label="遥测数据">
              <SectionTag index="01" name="遥测" en="TELEMETRY" note="信号源主动提交的身体参数。真实性：自称。" />
              <div className="metric-grid">
                {METRICS.map((m, i) => <Metric key={m.label} {...m} delay={i * 90} />)}
              </div>
            </section>

            {/* ———————— DECODE LOG ———————— */}
            <section id="decode" className="decode container">
              <SectionTag index="02" name="解译记录" en="DECODE LOG" note="从噪声里打捞出来的、一个普通人想说的话。" />
              <Reveal className="term-wrap">
                <div className="term hud-frame">
                  <div className="panel-head">
                    <span className="dots-3" aria-hidden="true"><i /><i /><i /></span>
                    <span className="panel-title mono">DECODE.LOG — 433s_payload.txt</span>
                    <button className="term-replay mono" onClick={() => { blip('key', sound); setReplaySeed((s) => s + 1); }} aria-label="重放解译记录">[ 重放 ]</button>
                  </div>
                  <div className="term-body mono" aria-live="polite">
                    {LOG_LINES.slice(0, logCount).map((l, i) => (
                      <p key={`${replaySeed}-${i}`} className={`log-line ${l.kind ?? ''}`}>
                        {l.text}
                        {i === Math.min(logCount, LOG_LINES.length) - 1 && <span className="caret" aria-hidden="true" />}
                      </p>
                    ))}
                  </div>
                </div>
              </Reveal>
            </section>

            {/* ———————— FRAGMENTS ———————— */}
            <section id="fragments" className="frags container">
              <SectionTag index="03" name="档案碎片" en="ARCHIVE FRAGMENTS" note="已通过校验的碎片。悬停可重新解译——内容不会变，但仪式感会。" />
              <Reveal><Fragments sound={sound} /></Reveal>
            </section>

            {/* ———————— TUNER ———————— */}
            <section id="tuner" className="tuner-sec container">
              <SectionTag index="04" name="频段调谐器" en="FREQUENCY TUNER" note="监听员的直觉说：氢线附近还藏着一块碎片。把它找出来。" />
              <Reveal>
                <Tuner sound={sound} unlocked={fr7} onUnlock={() => { setFr7(true); ls.set('lx0713-fr7', '1'); }} />
              </Reveal>
            </section>

            {/* ———————— UPLINK ———————— */}
            <section id="uplink" className="uplink-sec container">
              <SectionTag index="05" name="回应信道" en="UPLINK" note="本页内光速约为 0.0001 秒。尽管开口。" />
              <Reveal><Uplink sound={sound} onDontAnswer={raiseAlert} /></Reveal>
            </section>
          </main>

          <footer className="footer container">
            <button className="dont-answer glitch" data-text="不要回答。" onClick={raiseAlert} aria-label="不要回答（不建议点击）">
              不要回答。
            </button>
            <p className="footer-sub mono">// ……除非，你想认识这个信号源。</p>
            <div className="footer-cta">
              <a className="btn btn-red" href="mailto:hi@xiaolin.me?subject=%E4%BF%A1%E5%8F%B7%E5%B7%B2%E6%8E%A5%E6%94%B6" onClick={() => blip('send', sound)}>建立通讯 <IconArrow /></a>
              <a className="btn btn-ghost" href="#signal" onClick={() => blip('key', sound)}>回到入口</a>
            </div>
            <p className="footer-note mono">
              SIGNAL://LX-0713 · 由好奇心与 42% 咖啡因驱动 · 本档案正以光速离开本页<br />
              © {now.getFullYear()} 监听站 #03 —— 频道常开，宇宙不关门。
            </p>
          </footer>
        </div>
      )}
    </>
  );
}

/* ———————— pieces ———————— */

function SectionTag({ index, name, en, note }: { index: string; name: string; en: string; note: string }) {
  return (
    <div className="sec-head">
      <p className="sec-tag mono">[ SEC-{index} // {en} ]</p>
      <div className="sec-title-row">
        <h2>{name}</h2>
        <span className="sec-line" aria-hidden="true" />
        <p className="sec-note">{note}</p>
      </div>
    </div>
  );
}

function Metric({ label, en, pct, note, danger, delay }: { label: string; en: string; pct: number; note: string; danger?: boolean; delay: number }) {
  const [seen, setSeen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const val = useCountUp(pct, seen);
  return (
    <div className={`metric hud-frame ${seen ? 'seen' : ''}`} ref={ref} style={{ transitionDelay: `${delay}ms` }}>
      <p className="metric-label">{label}<span className="mono dim"> {en}</span></p>
      <p className="metric-val mono">{val}<small>%</small></p>
      <div className="metric-track"><i style={{ width: seen ? `${pct}%` : 0 }} className={danger ? 'danger' : ''} /></div>
      <p className={`metric-note mono ${danger ? 'warn' : ''}`}>{note}</p>
    </div>
  );
}

function AlertOverlay() {
  return (
    <div className="alert-overlay" aria-hidden="true">
      <div className="alert-inner">
        <p className="mono alert-code">ALERT // DARK-FOREST PROTOCOL</p>
        <p className="alert-big glitch">不要回答！</p>
        <p className="mono alert-sub">侦测到主动接触行为……不过，既然都点了，交个朋友？</p>
      </div>
    </div>
  );
}

/* ———————— icons ———————— */

function RadarMark() {
  return (
    <svg className="brand-mark" width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="#2b4a47" strokeWidth="1.2" />
      <circle cx="12" cy="12" r="5" stroke="#2b4a47" strokeWidth="1" />
      <path d="M12 12 19 5" stroke="#37e2c4" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="16" cy="15" r="1.6" fill="#ff4d47" />
    </svg>
  );
}
function IconVolume() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5Z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" /></svg>;
}
function IconMute() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 5 6 9H2v6h4l5 4V5Z" /><path d="m16 9 6 6m0-6-6 6" /></svg>;
}
function IconRefresh() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.6-6.3M21 3v6h-6" /></svg>;
}
function IconDown() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4v16m-6-6 6 6 6-6" /></svg>;
}
function IconArrow() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 18 18 6M7 6h11v11" /></svg>;
}
