import { useState } from 'react';
import { blip } from '../lib/audio';
import { ScrambleText } from './Scramble';

/* ————————————————— individual card ————————————————— */

function Card({
  no, tag, integrity, title, children, damaged = false, className = '',
}: {
  no: string; tag: string; integrity: number; title: string;
  children?: React.ReactNode; damaged?: boolean; className?: string;
}) {
  const [hover, setHover] = useState(0);
  return (
    <article
      className={`frag hud-frame ${damaged ? 'is-damaged' : ''} ${className}`}
      onMouseEnter={() => setHover((v) => v + 1)}
    >
      <header className="frag-head mono">
        <span className="frag-no">{no}</span>
        <span className="frag-tag">{tag}</span>
        <span className={`frag-int ${integrity < 60 ? 'bad' : ''}`}>完整度 {integrity}%</span>
      </header>
      <h3 className="frag-title"><ScrambleText text={title} trigger={hover} speed={17} /></h3>
      <div className="frag-body">{children}</div>
      <span className="frag-deco" aria-hidden="true" />
    </article>
  );
}

const bars = (items: [string, number][]) => (
  <div className="bars">
    {items.map(([label, pct]) => (
      <div className="bar-row" key={label}>
        <span className="bar-label mono">{label}</span>
        <span className="bar-track"><i style={{ width: `${pct}%` }} /></span>
        <span className="bar-pct mono">{pct}%</span>
      </div>
    ))}
  </div>
);

/* ————————————————— the set ————————————————— */

export function Fragments({ sound }: { sound: boolean }) {
  const [repairing, setRepairing] = useState(false);
  const [repairPct, setRepairPct] = useState(0);
  const [repaired, setRepaired] = useState(false);

  const repair = () => {
    if (repairing || repaired) return;
    blip('key', sound);
    setRepairing(true);
    let p = 0;
    const id = setInterval(() => {
      p += 4 + Math.random() * 9;
      if (p >= 100) {
        clearInterval(id);
        setRepairPct(100);
        setRepaired(true);
        blip('lock', sound);
      } else setRepairPct(Math.round(p));
    }, 90);
  };

  return (
    <div className="frag-grid">
      <Card no="FR-01" tag="存在周期" integrity={100} title="约 9,400 个昼夜">
        <p>其中约三分之一用于睡眠——信号源郑重建议全宇宙推广此作息。<br />剩余时间，用于把日子过成想要的样子。</p>
        <p className="frag-note mono">备注：已执行「赖床协议」约 3,000 次，无一后悔。</p>
      </Card>

      <Card no="FR-02" tag="能量构成" integrity={100} title="补给分析报告">
        {bars([['咖啡因', 42], ['好奇心', 38], ['音乐', 12], ['未申报之摸鱼', 8]])}
        <p className="frag-note mono">警告：去除咖啡因后，该个体大概率无法正常启动。</p>
      </Card>

      <Card no="FR-03" tag="活动规律" integrity={97} title="夜行 · 峰值 23:00 – 02:00">
        <p>白天伪装成普通人类，表现良好，无暴露风险。</p>
        <p className="frag-note mono warn">警告：起床后一小时内，请勿对信号源发起任何语音通讯。</p>
      </Card>

      <Card no="FR-04" tag="高频行为" integrity={100} title="观测到的日常脉冲">
        <ul className="frag-list">
          <li>拍摄云、猫、以及「今晚的路灯很好看」</li>
          <li>把脑洞记下来，然后真的做出来</li>
          <li>给游戏角色起名「晚饭吃啥」</li>
          <li>雨天散步，并拒绝携带雨伞</li>
        </ul>
      </Card>

      <Card no="FR-05" tag="特殊能力" integrity={89} title="三项未经证实的能力">
        <ul className="frag-list">
          <li>与猫进行眼神交流，并达成共识</li>
          <li>把任何一句话调成渐变色</li>
          <li>排队时，精准选中最慢的一列（自称为诅咒）</li>
        </ul>
        <p className="frag-note mono">能力边界：对「早点睡」这一指令持续免疫。</p>
      </Card>

      <Card
        no="FR-06"
        tag="碎片损坏"
        integrity={repaired ? 99 : 41}
        title={repaired ? '流星愿望 · 已还原' : '[ 数据损坏 ]'}
        damaged={!repaired}
      >
        {!repaired ? (
          <div className="repair-box">
            <p className="garbled mono" aria-hidden="true">▓▒░ 0x1F4A1 ░▒▓ Ψ-7 流▓▓ 愿░ 已加▓ ……先▒░告诉▓</p>
            {repairing ? (
              <div className="repair-progress">
                <span className="mono">修复中 {repairPct}%</span>
                <span className="repair-track"><i style={{ width: `${repairPct}%` }} /></span>
              </div>
            ) : (
              <button className="btn btn-red sm" onClick={repair}>尝试修复碎片</button>
            )}
          </div>
        ) : (
          <p className="repaired-body">
            碎片内容：该个体曾在山顶向一颗流星许愿，愿望已加密存储。<br />
            只留下一句备注——「先不告诉你。」
          </p>
        )}
      </Card>
    </div>
  );
}
