import { useState } from 'react'

interface VideoItem {
  id: number
  title: string
  summary: string
  tags: string[]
  author: string
  duration: string
  transcript?: string
}

interface Props {
  mockItems: VideoItem[]
}

const Tag = ({ label }: { label: string }) => (
  <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/12 text-orange-600 font-medium">{label}</span>
)

const Card = ({ item, onClick }: { item: VideoItem; onClick: () => void }) => (
  <div onClick={onClick} className="bg-white/[0.06] rounded-[14px] p-[14px_16px] mb-2.5 cursor-pointer border border-white/[0.06] hover:bg-white/[0.08] transition-all">
    <div className="flex justify-between items-start mb-1.5">
      <h3 className="text-[15px] font-semibold text-[#f0ece4] m-0 leading-snug flex-1 mr-2.5">{item.title}</h3>
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1a1a1a] text-white font-medium shrink-0">抖音</span>
    </div>
    <div className="flex gap-2 items-center mb-2">
      <span className="text-[11px] text-white/40">{item.author}</span>
      <span className="text-[11px] text-white/20">|</span>
      <span className="text-[11px] text-white/40">{item.duration}</span>
    </div>
    <p className="text-[13px] text-white/55 m-0 mb-2.5 line-clamp-2 leading-relaxed">{item.summary}</p>
    <div className="flex gap-1.5 flex-wrap">
      {item.tags.map(t => <Tag key={t} label={t} />)}
    </div>
  </div>
)

export default function LibraryPage({ mockItems }: Props) {
  const [filter, setFilter] = useState('all')
  const [selectedItem, setSelectedItem] = useState<VideoItem | null>(null)

  const filters = ['all', '配方', '原理', '入门', '器具', '技巧']
  const filtered = filter === 'all'
    ? mockItems
    : mockItems.filter(i => i.tags.some(t => t === filter))

  return (
    <div className="px-5 py-4">
      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {filters.map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-3.5 py-1 rounded-full text-[12px] cursor-pointer font-medium transition-all ${
              filter === c
                ? 'bg-[#ff9843] text-[#1a1714]'
                : 'bg-white/[0.06] text-white/50 border-none'
            }`}
          >
            {c === 'all' ? '全部 (12)' : c}
          </button>
        ))}
      </div>

      {/* Video list */}
      {filtered.map(item => (
        <Card key={item.id} item={item} onClick={() => setSelectedItem(item)} />
      ))}

      {filtered.length === 0 && (
        <p className="text-center text-white/30 text-[13px] mt-10">该分类下暂无内容</p>
      )}

      {/* Detail modal */}
      {selectedItem && (
        <div onClick={() => setSelectedItem(null)} className="fixed inset-0 bg-black/75 flex items-end justify-center z-50 backdrop-blur-sm">
          <div onClick={e => e.stopPropagation()} className="w-full max-w-[420px] bg-[#1e1b17] rounded-[20px_20px_0_0] p-6 max-h-[80vh] overflow-auto">
            <div className="w-9 h-1 rounded-sm bg-white/15 mx-auto mb-5" />
            <div className="flex gap-2 mb-2.5 flex-wrap">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1a1a1a] text-white font-medium">抖音</span>
              <span className="text-[12px] text-white/40">{selectedItem.author}</span>
              <span className="text-[12px] text-white/25">|</span>
              <span className="text-[12px] text-white/40">{selectedItem.duration}</span>
            </div>
            <h2 className="text-[18px] font-bold m-0 mb-3.5 leading-snug">{selectedItem.title}</h2>

            <div className="p-3.5 rounded-[12px] mb-4 bg-orange-500/6 border border-orange-500/12">
              <p className="text-[11px] font-semibold text-[#ff9843] m-0 mb-1.5 tracking-wide">AI 摘要</p>
              <p className="text-[14px] text-white/75 leading-relaxed m-0">{selectedItem.summary}</p>
            </div>

            <div className="p-3.5 rounded-[12px] mb-4 bg-white/[0.03] border border-white/[0.06]">
              <p className="text-[11px] font-semibold text-white/45 m-0 mb-1.5 tracking-wide">🎙 语音转录原文</p>
              <p className="text-[13px] text-white/55 leading-relaxed m-0">{selectedItem.transcript}</p>
            </div>

            <div className="flex gap-1.5 flex-wrap mb-4">
              {selectedItem.tags.map(t => <Tag key={t} label={t} />)}
            </div>

            <button
              onClick={() => setSelectedItem(null)}
              className="w-full py-3.5 rounded-[14px] bg-white/[0.08] text-[#f0ece4] border-none text-[14px] cursor-pointer"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
