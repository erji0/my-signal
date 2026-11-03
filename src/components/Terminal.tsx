import { useEffect, useRef, useState } from 'react';
import { blip } from '../lib/audio';

type Msg = { id: number; from: 'signal' | 'you'; text: string };

const DEFAULT_REPLIES = [
  '收到。这句话已被存入「今夜星空 · 23:47」文件夹。',
  '信号强度 +1。请继续。',
  '这条讯息正以光速飞往杭州，预计……已经到了。',
  '（信号源没有回复，但你能感觉到 ta 在点头。）',
];

function answer(raw: string, serial: number): { text: string; alert?: boolean } {
  const q = raw.toLowerCase();
  if (/不要回答|别回答/.test(q)) return { text: '晚了，已经回答了。放心——我对你们的星系没有企图，只对奶茶配方有。', alert: true };
  if (/你是谁|名字|叫什么/.test(q)) return { text: '编号 LX-0713，碳基智人。朋友们叫 ta 小林。认证状态：未经证实，但很真诚。' };
  if (/(^|\s)(hi|hello|hey)(\s|$)/.test(q) || /你好|嗨|在吗|在么/.test(q)) return { text: '在。从你打开这个页面的第一秒起，信道就一直在等你。' };
  if (/在干嘛|在干什么/.test(q)) return { text: '正在给一盆多肉讲冷笑话。它没笑，但我还在坚持。' };
  if (/三体|黑暗森林|虫子|面壁|破壁/.test(q)) return { text: '「我们都是阴沟里的虫子，但总还是得有人仰望星空。」——所以我把天线架好了。' };
  if (/二向箔|降维/.test(q)) return { text: '请勿在本信道讨论二向箔。上一个提起的群聊已经被压平了。' };
  if (/咖啡|奶茶|茶/.test(q)) return { text: '检测到补给关键词。信号源精神指数 +50%。' };
  if (/无聊|笑话|好玩|讲个/.test(q)) return { text: '为什么程序员总分不清万圣节和圣诞节？因为 Oct 31 == Dec 25。……笑了就欢迎加入本频段。' };
  if (/喜欢|爱好|兴趣/.test(q)) return { text: '拍云、追猫、收集好听的前奏。以及在深夜，认真地做一个夸张的个人主页。' };
  if (/再见|拜拜|晚安/.test(q)) return { text: '已收到告别。信道保持常开——宇宙不关门。' };
  if (/喜欢.*(这个|页面|主页)|好看|厉害|酷/.test(q)) return { text: '谢谢。这大概是本频段收到过最好的信号。已设为循环播放。' };
  return { text: DEFAULT_REPLIES[serial % DEFAULT_REPLIES.length] };
}

const CHIPS = ['你是谁？', '你在干嘛？', '说个好玩的', '不要回答。'];

export function Uplink({ sound, onDontAnswer }: { sound: boolean; onDontAnswer: () => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: 0, from: 'signal', text: '回应信道已建立。延迟约 0.0001 光年（本页内）。问点什么，或者，只说「在吗」。' },
  ]);
  const [typing, setTyping] = useState(false);
  const [val, setVal] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const serial = useRef(0);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, typing]);

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text || typing) return;
    blip('send', sound);
    setMsgs((m) => [...m.slice(-28), { id: Date.now(), from: 'you', text }]);
    setVal('');
    setTyping(true);
    const reply = answer(text, serial.current++);
    window.setTimeout(() => {
      setTyping(false);
      if (reply.alert) onDontAnswer();
      setMsgs((m) => [...m.slice(-28), { id: Date.now() + 1, from: 'signal', text: reply.text }]);
      blip(reply.alert ? 'alert' : 'key', sound);
    }, reply.alert ? 1400 : 950 + Math.random() * 650);
  };

  return (
    <div className="uplink hud-frame">
      <div className="panel-head">
        <span className="dots-3" aria-hidden="true"><i /><i /><i /></span>
        <span className="panel-title mono">UPLINK · 回应信道</span>
        <span className="channel-id mono">CH-1420 · ENCRYPTED（自称）</span>
      </div>
      <div className="uplink-list" ref={listRef} aria-live="polite" aria-label="与信号源的对话记录">
        {msgs.map((m) => (
          <div key={m.id} className={`msg ${m.from}`}>
            <span className="msg-tag mono">{m.from === 'signal' ? 'LX-0713' : '访客'}</span>
            <p>{m.text}</p>
          </div>
        ))}
        {typing && (
          <div className="msg signal is-typing">
            <span className="msg-tag mono">LX-0713</span>
            <p className="typing-dots" aria-label="信号源正在输入"><i /><i /><i /></p>
          </div>
        )}
      </div>
      <div className="uplink-chips">
        {CHIPS.map((c) => (
          <button key={c} className={`chip ${c === '不要回答。' ? 'danger' : ''}`} onClick={() => send(c)} disabled={typing}>
            {c}
          </button>
        ))}
      </div>
      <form className="uplink-form" onSubmit={(e) => { e.preventDefault(); send(val); }}>
        <span className="prompt mono" aria-hidden="true">&gt;</span>
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="向信号源发送讯息……"
          aria-label="向信号源发送讯息"
          maxLength={120}
        />
        <button type="submit" className="btn btn-teal" disabled={typing || !val.trim()}>
          发送 <SendIcon />
        </button>
      </form>
    </div>
  );
}

function SendIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7Z" />
    </svg>
  );
}
