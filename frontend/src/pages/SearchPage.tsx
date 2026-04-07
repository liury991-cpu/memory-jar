import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface SearchResponse {
  keywords: string[]
  ids: number[]
  answer: string
}

interface VideoItem {
  id: number
  title: string
  summary: string
  tags: string[]
  author: string
  duration: string
  transcript?: string
}

interface ChatMessage {
  role: 'user' | 'ai'
  text: string
  items?: VideoItem[]
}

interface Props {
  mockItems: VideoItem[]
  searchResponses: SearchResponse[]
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

export default function SearchPage({ mockItems, searchResponses }: Props) {
  const [searchText, setSearchText] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'ai', text: '你好！我是你的调酒记忆罐 🫙 你的抖音收藏夹里有 12 条调酒视频已经解析完成。直接问我，比如「威士忌怎么调」「新手该买什么」「酸类公式」' }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, isTyping])

  const handleSearch = (overrideText?: string) => {
    const q = (overrideText || searchText).trim()
    if (!q) return
    setChatMessages(prev => [...prev, { role: 'user', text: q }])
    setSearchText('')
    setIsTyping(true)

    setTimeout(() => {
      const match = searchResponses.find(r => r.keywords.some(k => q.toLowerCase().includes(k)))
      if (match) {
        const items = match.ids.map(id => mockItems.find(i => i.id === id)).filter(Boolean) as VideoItem[]
        setChatMessages(prev => [...prev, { role: 'ai', text: match.answer, items }])
      } else {
        const fuzzy = mockItems.filter(i =>
          i.title.toLowerCase().includes(q.toLowerCase()) ||
          i.summary.includes(q) ||
          i.tags.some(t => t.includes(q)) ||
          i.transcript?.includes(q)
        ).slice(0, 3)
        setChatMessages(prev => [...prev, {
          role: 'ai',
          text: fuzzy.length > 0 ? `找到${fuzzy.length}条相关内容：` : `没找到和「${q}」直接相关的收藏。试试具体的酒名或者「入门」「原理」这类词。`,
          items: fuzzy.length > 0 ? fuzzy : undefined
        }])
      }
      setIsTyping(false)
    }, 600 + Math.random() * 500)
  }

  const quickQuestions = ['威士忌怎么调', '新手入门买什么', '酸类公式', 'Mojito变体']

  return (
    <div className="flex flex-col h-[calc(100vh-160px)]">
      <div className="flex-1 overflow-auto px-5 py-4">
        {chatMessages.map((msg, i) => (
          <div key={i} className="mb-4 flex flex-col items-end">
            <div className={`max-w-[88%] px-3 py-3 rounded-[18px] text-[14px] leading-relaxed ${
              msg.role === 'user'
                ? 'bg-gradient-to-br from-[#ff9843] to-[#e07a2a] text-[#1a1714]'
                : 'bg-white/[0.08] text-[#f0ece4]'
            } ${msg.role === 'user' ? 'rounded-br-[4px]' : 'rounded-bl-[4px]'}`}>
              {msg.text}
            </div>
            {msg.items && msg.items.length > 0 && (
              <div className="max-w-[88%] mt-2 w-full">
                {msg.items.map(item => <Card key={item.id} item={item} onClick={() => navigate('/library')} />)}
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-1 py-2">
            {[0,1,2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-orange-500/50 animate-pulse" style={{ animationDelay: `${i*0.15}s` }} />
            ))}
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="px-5 pb-5 border-t border-white/6 pt-3">
        <div className="flex gap-2.5 bg-white/[0.06] rounded-full px-4 py-1.5 items-center">
          <input
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="问问你的调酒记忆..."
            className="flex-1 bg-transparent border-none outline-none text-[#f0ece4] text-[14px] py-2"
          />
          <button
            onClick={() => handleSearch()}
            disabled={!searchText.trim()}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              searchText.trim() ? 'bg-[#ff9843]' : 'bg-white/10'
            } border-none cursor-pointer`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={searchText.trim() ? '#1a1714' : 'rgba(240,236,228,0.3)'} strokeWidth="2.5" strokeLinecap="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
        <div className="flex gap-1.5 mt-2.5 flex-wrap">
          {quickQuestions.map(q => (
            <button
              key={q}
              onClick={() => handleSearch(q)}
              className="px-3 py-1.5 rounded-full text-[12px] bg-orange-500/8 text-orange-500/70 border border-orange-500/15 cursor-pointer hover:bg-orange-500/15"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
