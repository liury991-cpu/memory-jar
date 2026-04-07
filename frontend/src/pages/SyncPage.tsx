import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

interface Props {
  onSyncComplete: () => void
}

export default function SyncPage({ onSyncComplete }: Props) {
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'done'>('idle')
  const [syncProgress, setSyncProgress] = useState(0)
  const [collectionUrl, setCollectionUrl] = useState('')
  const [parsedLink, setParsedLink] = useState<{ url: string; type: string } | null>(null)
  const navigate = useNavigate()

  const parseShareText = (text: string) => {
    const urlMatch = text.match(/https?:\/\/[^\s\]"]+/i) || text.match(/[a-zA-Z0-9]+\.[a-zA-Z]{2,}\/[^\s\]"]+/i)
    const codeMatch = text.match(/##([^#]+)##/)
    if (urlMatch) {
      const url = urlMatch[0].startsWith('http') ? urlMatch[0] : 'https://' + urlMatch[0]
      setParsedLink({ url, type: 'link' })
    } else if (codeMatch) {
      setParsedLink({ url: codeMatch[1], type: 'code' })
    } else if (text.trim().length > 5) {
      setParsedLink({ url: text.trim(), type: 'text' })
    } else {
      setParsedLink(null)
    }
  }

  const handleSync = () => {
    if (!collectionUrl.trim()) return
    setSyncState('syncing')
    setSyncProgress(0)
    const steps = [
      { p: 8, d: 400 },
      { p: 15, d: 600 },
      { p: 25, d: 500 },
      { p: 40, d: 800 },
      { p: 55, d: 700 },
      { p: 68, d: 600 },
      { p: 78, d: 500 },
      { p: 88, d: 400 },
      { p: 95, d: 300 },
      { p: 100, d: 200 },
    ]
    let t = 0
    steps.forEach(s => {
      t += s.d
      setTimeout(() => {
        setSyncProgress(s.p)
        if (s.p === 100) {
          setTimeout(() => {
            setSyncState('done')
            onSyncComplete()
          }, 500)
        }
      }, t)
    })
  }

  const steps = [
    { icon: '🔗', text: '粘贴抖音收藏夹链接' },
    { icon: '📥', text: '自动批量下载所有视频 (TikTokDownloader)' },
    { icon: '🎙', text: 'AI语音转文字 (Whisper)' },
    { icon: '🧠', text: 'LLM理解内容：分类、标签、提取配方' },
    { icon: '🔍', text: '完成！自然语言随时搜索' },
  ]

  return (
    <div className="px-5 py-5">
      {/* Workflow explanation */}
      <div className="rounded-[16px] p-4.5 mb-5 bg-white/[0.04] border border-white/[0.06]">
        <p className="text-[14px] font-semibold m-0 mb-3.5">工作原理</p>
        {steps.map((s, i) => (
          <div key={i} className="flex gap-3 items-center mb-2.5">
            <span className="text-[18px] w-7 text-center">{s.icon}</span>
            <div className="flex-1 flex items-center gap-2">
              <span className="w-[18px] h-[18px] rounded-full shrink-0 bg-orange-500/15 text-[#ff9843] text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
              <span className="text-[13px] text-white/60">{s.text}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Sync form */}
      <div
        className={`rounded-[16px] p-4.5 transition-all ${
          syncState === 'done'
            ? 'bg-green-500/6 border border-green-500/20'
            : 'bg-orange-500/4 border border-orange-500/15'
        }`}
      >
        <p className="text-[14px] font-semibold m-0 mb-1">
          {syncState === 'done' ? '✅ 同步完成' : '同步抖音收藏夹'}
        </p>
        <p className="text-[12px] text-white/40 m-0 mb-3.5">
          {syncState === 'done'
            ? '已解析 12 条视频，识别出 8 个配方、3 条原理、1 条器具指南'
            : '在抖音App打开收藏夹 → 分享 → 复制链接 → 粘贴到下面（整段粘贴即可，AI自动识别）'}
        </p>

        {syncState !== 'done' && (
          <>
            <textarea
              value={collectionUrl}
              onChange={e => {
                setCollectionUrl(e.target.value)
                parseShareText(e.target.value)
              }}
              placeholder={`直接粘贴抖音分享的那段话...\n\n例如：长按复制此条消息，打开抖音查看精彩内容##xxx##[抖音口令]`}
              disabled={syncState === 'syncing'}
              className="w-full min-h-[80px] p-3 rounded-[12px] bg-white/[0.05] border border-white/[0.08] text-[#f0ece4] text-[13px] leading-relaxed outline-none resize-y box-border transition-opacity"
              style={{ opacity: syncState === 'syncing' ? 0.5 : 1 }}
            />

            {parsedLink && collectionUrl.trim() && syncState === 'idle' && (
              <div className="mt-2.5 p-2.5 rounded-[10px] bg-green-500/8 border border-green-500/20 flex items-center gap-2.5">
                <span className="text-[16px]">✅</span>
                <div className="flex-1">
                  <p className="text-[12px] font-semibold text-green-500/90 m-0">
                    {parsedLink.type === 'link' ? '已识别到链接' : parsedLink.type === 'code' ? '已识别到口令码' : '已识别到分享内容'}
                  </p>
                  <p className="text-[11px] text-white/40 m-0 mt-0.5 truncate">{parsedLink.url}</p>
                </div>
              </div>
            )}

            {syncState === 'syncing' && (
              <div className="mt-3.5">
                <div className="flex justify-between mb-1.5">
                  <span className="text-[12px] text-white/50">
                    {syncProgress < 30 ? '正在获取视频列表...' : syncProgress < 60 ? 'AI语音转文字中...' : syncProgress < 90 ? '智能分类和标签中...' : '即将完成...'}
                  </span>
                  <span className="text-[12px] text-[#ff9843] font-semibold">{syncProgress}%</span>
                </div>
                <div className="w-full h-1.5 rounded-sm bg-white/8 overflow-hidden">
                  <div className="h-full rounded-sm bg-gradient-to-r from-[#ff9843] to-[#ffb347] transition-all" style={{ width: `${syncProgress}%` }} />
                </div>
              </div>
            )}

            <button
              onClick={handleSync}
              disabled={syncState === 'syncing' || !collectionUrl.trim()}
              className={`w-full py-3 rounded-[12px] mt-3 text-[15px] font-semibold transition-all cursor-pointer border-none ${
                syncState === 'syncing'
                  ? 'bg-orange-500/30 text-white/30'
                  : collectionUrl.trim()
                    ? 'bg-[#ff9843] text-[#1a1714]'
                    : 'bg-white/8 text-white/30'
              }`}
            >
              {syncState === 'syncing' ? '同步中...' : '🫙 开始同步'}
            </button>
          </>
        )}

        {syncState === 'done' && (
          <div className="mt-1">
            {[
              { label: '配方类', count: 8, color: '#ff9843' },
              { label: '原理类', count: 3, color: '#60a5fa' },
              { label: '器具/入门', count: 1, color: '#a78bfa' },
            ].map((c, i) => (
              <div key={i} className="flex items-center gap-2.5 py-2 border-b border-white/4 last:border-b-0">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: c.color }} />
                <span className="text-[13px] text-white/60 flex-1">{c.label}</span>
                <span className="text-[13px] text-white/80 font-semibold">{c.count} 条</span>
              </div>
            ))}
            <button
              onClick={() => navigate('/')}
              className="w-full py-3 rounded-[12px] mt-4 bg-[#ff9843] text-[#1a1714] border-none text-[15px] font-semibold cursor-pointer"
            >
              🔍 开始搜索你的收藏
            </button>
            <button
              onClick={() => { setSyncState('idle'); setSyncProgress(0); setCollectionUrl(''); setParsedLink(null); }}
              className="w-full py-3 rounded-[12px] mt-2 bg-white/[0.06] text-white/50 border-none text-[13px] cursor-pointer"
            >
              + 同步另一个收藏夹
            </button>
          </div>
        )}
      </div>

      {/* Tech note */}
      <div className="mt-4 p-3.5 rounded-[14px] bg-white/[0.02] border border-white/[0.04]">
        <p className="text-[12px] text-white/35 m-0 leading-relaxed">
          {'💡 '}<strong className="text-white/50">技术说明：</strong>基于 TikTokDownloader 获取收藏夹视频，Whisper 语音转文字，LLM 内容理解和结构化。数据仅存储在本地。
        </p>
      </div>
    </div>
  )
}
