# SIGNAL://LX-0713 — 三体风「信号解译档案」个人主页

> 检测到一段来自未知信号源的传输……

一个《三体》×《无期迷途》联动预告风格的微惊悚个人主页：信号接收仪式、故障字、CRT 扫描线、氢线调谐器、可对话的回应信道。

---

## ⚠️ 双击根目录的 index.html 会白屏？

**根目录的 `index.html` 是开发模板**，需要构建后才能运行。请按下面步骤操作。

## 快速开始

```bash
# 1. 安装 Node.js（https://nodejs.org，LTS 版本）

# 2. 安装依赖（只需一次）
npm install

# 3a. 开发预览 —— 浏览器访问 http://localhost:5173
npm run dev

# 3b. 构建成品
npm run build
```

构建完成后，**双击打开 `dist/index.html`** 即可——所有 JS/CSS 已内联，单文件离线可运行。

## 技术栈

React 19 · TypeScript · Vite 7 · Tailwind CSS 4 · vite-plugin-singlefile

特效全部由代码手写：Canvas 星空、Web Audio 合成音效、纯 CSS 故障字/扫描线、localStorage 进度记忆。

## 互动提示

- 「保持沉默」按钮拦不住信号
- 把调谐器拖到 **1420.406 MHz**（氢线）解锁隐藏碎片
- 在回应信道里输入「不要回答」……
- 页脚巨大的「不要回答。」也是可以点的
