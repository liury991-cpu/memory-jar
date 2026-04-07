# 记忆罐 (Memory Jar)

抖音收藏夹 → 可搜索的个人知识库

## 项目结构

```
memory-jar/
├── frontend/               # React + Vite + TypeScript 前端
│   ├── src/
│   │   ├── components/    # UI 组件
│   │   ├── pages/         # 页面：SearchPage, LibraryPage, SyncPage
│   │   ├── lib/           # Supabase 客户端
│   │   ├── App.tsx        # 主应用
│   │   └── main.tsx       # 入口
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
├── supabase/              # Supabase 后端
│   ├── config.toml        # 本地开发配置
│   ├── schema.sql         # 数据库表结构
│   └── functions/        # Edge Functions
│       └── parse-share/   # 解析分享文本
└── package.json
```

## 快速开始

### 前置要求

- Node.js 18+
- Supabase CLI (`npm install -g supabase`)

### 1. 启动 Supabase 本地服务

```bash
cd memory-jar
supabase start
```

### 2. 安装前端依赖

```bash
cd frontend
npm install
```

### 3. 配置环境变量

创建 `frontend/.env.local`:

```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-anon-key
```

(anon key 可在 `supabase status` 输出中找到)

### 4. 启动前端

```bash
npm run dev
```

访问 http://localhost:5173

## 功能

### 已实现 (MVP)

- [x] 搜索问答页面 - 聊天式界面 + 快捷提问
- [x] 知识库浏览 - 标签筛选 + 视频详情
- [x] 同步收藏夹 - 链接解析 + 进度显示
- [x] 视频详情弹窗 - AI摘要 + 转录原文

### 待实现 (后端服务)

- [ ] TikTokDownloader 集成 - 下载收藏夹视频
- [ ] Whisper 转录 - 语音转文字
- [ ] LLM 分析 - 结构化理解（摘要、分类、标签）
- [ ] 向量搜索 - ChromaDB + BGE embedding

## 技术栈

| 模块 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Vite + TailwindCSS |
| 后端 | Supabase (PostgreSQL + Edge Functions) |
| 部署 | Vercel |
| AI | 本地部署 Whisper + BGE (自托管) |

## 参考

- 原型文件: `/Users/ryan/Downloads/memory-jar-prototype.jsx`
- PRD 文档: 见用户提供的完整需求文档
