import { useState, useEffect, useRef } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { supabase, VideoWithDetails, Analysis, Transcript } from './lib/supabase'
import SearchPage from './pages/SearchPage'
import LibraryPage from './pages/LibraryPage'
import SyncPage from './pages/SyncPage'

const MOCK_ITEMS = [
  { id: 1, title: "Negroni 经典配方", summary: "金酒30ml + 金巴利30ml + 甜味美思30ml，搅拌法，橙皮装饰。先加冰搅拌杯，量好三种酒倒入，搅拌30-40下至充分冷却，滤入古典杯。", tags: ["配方", "经典", "金酒"], author: "@调酒师阿杰", duration: "1:23", transcript: "大家好，今天教大家做一杯经典的Negroni。这是三种酒等比例的鸡尾酒，非常简单。金酒30ml、金巴利30ml、甜味美思30ml。先在搅拌杯里放满冰块，把三种酒倒进去，用吧勺搅拌30到40下，直到杯壁起霜。然后用隔冰器滤到放了大冰块的古典杯里，最后用橙皮在杯口挤一下油脂，擦一圈杯沿，丢进去就好了。" },
  { id: 2, title: "酸类鸡尾酒万能公式", summary: "基酒60ml + 柑橘酸30ml + 糖浆15-22ml，2:1:0.75黄金比例。摇匀双重过滤，适用于所有Sour类鸡尾酒。", tags: ["原理", "酸类", "公式"], author: "@鸡尾酒实验室", duration: "3:45", transcript: "酸类鸡尾酒是所有调酒的基础，掌握了这个公式你就能自己创作。核心比例是2:1:0.75，也就是基酒60ml、柑橘类酸汁30ml、糖浆15到22ml之间。为什么糖浆是一个范围呢？因为不同柠檬的酸度不一样，你需要根据口感微调。摇的时候一定要加蛋清，先不加冰干摇15秒让蛋清充分乳化，再加冰湿摇10秒。最后双重过滤，就是隔冰器加一个细网筛，这样泡沫才细腻。" },
  { id: 3, title: "Whiskey Sour 完整教学", summary: "波本威士忌60ml + 鲜柠檬汁30ml + 糖浆15ml + 蛋清一个。干摇15秒+湿摇10秒，双重过滤。安格斯图拉苦精3滴画花纹。", tags: ["配方", "酸类", "威士忌"], author: "@调酒师阿杰", duration: "2:30", transcript: "Whiskey Sour是酸类鸡尾酒里最经典的一款。用波本威士忌60ml，新鲜柠檬汁30ml，注意一定要现挤的，不要用那种瓶装的。糖浆15ml，蛋清一个。先把所有材料不加冰倒进摇酒壶，盖上干摇15秒，你会听到声音变化，说明蛋清开始乳化了。然后打开加满冰，湿摇10秒。用隔冰器加细网筛双重过滤到杯子里。最后滴3滴安格斯图拉苦精在泡沫上，用牙签画个花纹就好了。" },
  { id: 4, title: "Old Fashioned 三种做法对比", summary: "经典做法(方糖+苦精+威士忌) vs 预溶糖浆法 vs 日式搅拌法。三种口感差异：颗粒感/顺滑/清冽。推荐新手用糖浆法。", tags: ["配方", "经典", "威士忌", "对比"], author: "@威士忌老炮", duration: "5:12", transcript: "今天对比Old Fashioned的三种做法。第一种经典做法：方糖放杯底，滴2dash安格斯图拉苦精，加一点点水，用吧勺碾碎方糖。然后倒入60ml波本威士忌，加大冰块搅拌。这种做法有方糖的颗粒感，味道层次最丰富。第二种糖浆法：直接用5ml糖浆代替方糖，其他一样。口感更顺滑均匀，推荐新手用这个。第三种日式做法：在搅拌杯里操作，搅拌时间更长，大概60下，追求极致的冷却和稀释。口感最清冽干净。" },
  { id: 5, title: "新手必备调酒器具", summary: "5件套：波士顿摇酒壶、量酒器(双头30/45ml)、吧勺、霍桑隔冰器、细网筛。总预算200-300元。", tags: ["器具", "入门", "购买指南"], author: "@调酒师阿杰", duration: "4:10", transcript: "很多人问我新手买什么器具，今天一次说清楚。第一个，波士顿摇酒壶，推荐不锈钢加玻璃的组合，玻璃那头可以看到里面的状态。第二个，量酒器，一定要买双头的，30ml和45ml。第三个，吧勺，不用买太贵的，30块钱的够用了，关键是手感。第四个，霍桑隔冰器，就是带弹簧的那个。第五个，细网筛，做Sour类必备。这5件套加起来200到300块就能搞定，不要一上来就买一大套。" },
  { id: 6, title: "Espresso Martini 配方与技巧", summary: "伏特加45ml + 咖啡利口酒15ml + 浓缩咖啡30ml(现萃冷却)。关键：咖啡必须新鲜、用力摇18秒、三颗咖啡豆装饰。", tags: ["配方", "咖啡", "派对"], author: "@鸡尾酒实验室", duration: "2:15", transcript: "Espresso Martini这两年超火，但很多人做出来泡沫不好看。关键就三点。第一，咖啡一定要新鲜萃取的浓缩，放凉了再用，不要用速溶。第二，用力摇，至少摇18秒，比一般鸡尾酒要多摇几秒，因为你要靠咖啡的油脂打出泡沫。第三，滤好之后马上放三颗咖啡豆装饰，要趁泡沫还没定型的时候放，这样豆子会漂在泡沫上面。配方是伏特加45ml、咖啡利口酒15ml、浓缩咖啡30ml。" },
  { id: 7, title: "五味平衡原理", summary: "好喝的鸡尾酒=平衡。甜(糖浆/利口酒)中和酸(柑橘)；苦(苦精/金巴利)增加复杂度；咸(盐水)提升风味感知；辣(生姜/辣椒)刺激味蕾。", tags: ["原理", "风味", "进阶"], author: "@鸡尾酒实验室", duration: "6:30", transcript: "今天讲鸡尾酒最核心的东西：五味平衡。为什么有些酒好喝有些不好喝？就是平衡。甜味来自糖浆和利口酒，它的作用是中和酸味。酸味来自柑橘汁，它让酒变得清爽。甜和酸是一对，要互相平衡。苦味来自苦精或者金巴利这类酒，少量的苦味能让鸡尾酒更有层次感。咸味很多人忽略，其实在很多配方里加两滴盐水，能让整体风味提升一个档次。辣味就是生姜、辣椒这些，用来做特殊风格的酒。记住，任何一味过重都不行。" },
  { id: 8, title: "Mojito 及4种变体", summary: "经典版：白朗姆60ml+青柠半个+薄荷叶+糖浆15ml+苏打水。变体：草莓/百香果/青瓜/椰子。", tags: ["配方", "朗姆酒", "变体", "夏日"], author: "@调酒师阿杰", duration: "4:50", transcript: "Mojito大家都知道，但今天教你4种变体让你整个夏天不重样。先说经典版：白朗姆60ml、半个青柠切块、8到10片薄荷叶、糖浆15ml。青柠和薄荷放杯底轻轻捣几下，注意是轻捣不是碾碎，不然薄荷会苦。加碎冰倒朗姆酒和糖浆，最后加苏打水搅一下。变体一，草莓：加3颗草莓一起捣。变体二，百香果：加半个百香果的果肉。变体三，青瓜：放3片黄瓜进去捣，特别清爽。变体四，椰子：把白朗姆换成椰子朗姆，度假风满满。" },
  { id: 9, title: "Daiquiri - 被低估的经典", summary: "白朗姆60ml + 鲜青柠汁22ml + 糖浆15ml。极简三原料，考验比例和摇壶功力。", tags: ["配方", "经典", "朗姆酒"], author: "@威士忌老炮", duration: "2:00", transcript: "Daiquiri是最被低估的鸡尾酒，只有三种原料但非常考验功力。白朗姆60ml、新鲜青柠汁22ml、糖浆15ml。看起来简单对吧？难点在于比例的微调和摇壶的时间控制。加冰摇8到10秒就够了，不要超过12秒，不然水分太多味道就淡了。用双重过滤滤到提前冰镇好的碟形杯里。如果你能做好一杯Daiquiri，说明你调酒基本功到位了。" },
  { id: 10, title: "6种基酒入门指南", summary: "金酒/伏特加/朗姆酒/龙舌兰/威士忌/白兰地。新手建议先买金酒+朗姆酒+威士忌三瓶。", tags: ["入门", "基酒", "购买指南"], author: "@鸡尾酒实验室", duration: "8:20", transcript: "很多人想学调酒但不知道买什么酒，今天把六种基酒一次讲清楚。金酒，核心风味是杜松子，草本清香，做Gin Tonic、Negroni、Martini都用它。伏特加，基本没什么味道，就是纯净的酒精味，做Espresso Martini和各种果汁类鸡尾酒。朗姆酒，甘蔗酿的，有甜味，白朗姆做Mojito和Daiquiri。龙舌兰，有泥土和烟熏的味道，做Margarita。威士忌，谷物酿造橡木桶陈年，做Old Fashioned和Whiskey Sour。白兰地，葡萄蒸馏的，有果香，做Sidecar。新手预算有限的话，建议先买金酒、白朗姆、波本威士忌这三瓶，能覆盖80%的经典配方。" },
  { id: 11, title: "冰块的学问", summary: "大冰块(慢融化,搅拌类用)、标准冰块(摇酒用)、碎冰(Mojito/Julep用)。推荐买硅胶大冰块模具。", tags: ["技巧", "器具", "进阶"], author: "@调酒师阿杰", duration: "3:15", transcript: "冰块是调酒里最容易被忽略但最重要的东西。三种冰块用途不同。大冰块，就是那种方方正正的大冰，融化慢，用在Old Fashioned、Negroni这种搅拌类的酒里，不会让酒太快变淡。标准冰块，就是正常大小的冰，用来摇酒。碎冰，做Mojito和Julep必须用碎冰。自己在家做建议买硅胶大冰块模具，淘宝二三十块，做出来的冰块比外面买的透亮。想要更透明的冰块，可以用保温箱慢冻法，但比较麻烦新手不用折腾。" },
  { id: 12, title: "Margarita 及盐边技巧", summary: "龙舌兰45ml + 君度橙酒22ml + 鲜青柠汁22ml。盐边只蘸一半，可加辣椒盐做Spicy版。", tags: ["配方", "龙舌兰", "技巧"], author: "@威士忌老炮", duration: "3:00", transcript: "Margarita做法不难，但盐边是灵魂。先说配方：龙舌兰45ml、君度橙酒22ml、新鲜青柠汁22ml，加冰摇匀滤到杯子里。关键是盐边怎么做。很多人整圈都蘸盐，其实只蘸一半就好，另一半留着不蘸，这样喝的人可以选择要不要带盐。做法是拿青柠切面擦半圈杯沿，然后倾斜杯子在盐碟上蘸一半。想做Spicy版本的话，把细盐换成辣椒盐，再在摇酒壶里加两片新鲜墨西哥辣椒一起摇。" },
];

const SEARCH_RESPONSES = [
  { keywords: ["威士忌"], ids: [3, 4, 10], answer: "你的收藏夹里有3条威士忌相关的内容。Whiskey Sour 走酸甜路线，需要干摇蛋清打泡沫；Old Fashioned 走经典甜苦路线，视频里对比了三种做法，推荐新手用糖浆法。基酒指南里也提到波本威士忌是新手必入的三瓶之一。" },
  { keywords: ["酸", "sour"], ids: [2, 3, 9], answer: "酸类鸡尾酒的万能公式是 2:1:0.75（基酒:酸:糖），你收藏的这条视频讲得最详细。还有 Whiskey Sour 和 Daiquiri 两个具体配方。关键技巧：干摇蛋清+双重过滤。" },
  { keywords: ["咖啡", "espresso"], ids: [6], answer: "你收藏了 Espresso Martini 的教学。三个关键点：咖啡必须新鲜现萃、用力摇至少18秒、趁泡沫没定型时放咖啡豆。配方：伏特加45ml + 咖啡利口酒15ml + 浓缩咖啡30ml。" },
  { keywords: ["新手", "入门", "开始", "买什么"], ids: [5, 10, 2], answer: "入门三件事：器具5件套200-300元搞定；基酒先买金酒+白朗姆+波本威士忌；学会酸类公式（2:1:0.75）就能做大部分经典鸡尾酒了。" },
  { keywords: ["mojito", "朗姆", "夏天", "夏日"], ids: [8, 9], answer: "朗姆酒相关你收藏了 Mojito（含4种变体：草莓/百香果/青瓜/椰子）和 Daiquiri。Mojito更清爽适合派对，Daiquiri更考验功力。注意薄荷要轻捣不要碾碎，不然会苦。" },
  { keywords: ["原理", "平衡", "理论"], ids: [2, 7], answer: "两条核心理论：酸类公式（2:1:0.75）和五味平衡原理（甜酸苦咸辣）。有个小技巧：加两滴盐水能让风味提升一个档次。" },
  { keywords: ["买", "购买", "器具", "装备"], ids: [5, 10, 11], answer: "器具5件套200-300元；基酒先买金酒+白朗姆+波本威士忌三瓶；再买个硅胶大冰块模具二三十块。总共500块以内就能开始了。" },
  { keywords: ["negroni"], ids: [1, 10], answer: "Negroni 极简配方：金酒、金巴利、甜味美思各30ml等比例，搅拌30-40下，橙皮挤油脂装饰。金酒是新手必入的三瓶基酒之一。" },
  { keywords: ["margarita", "龙舌兰"], ids: [12, 10], answer: "Margarita：龙舌兰45ml + 君度22ml + 青柠汁22ml。盐边技巧是只蘸一半。想做辣版就换辣椒盐+加墨西哥辣椒。" },
];

export interface VideoItem {
  id: number
  title: string
  summary: string
  tags: string[]
  author: string
  duration: string
  transcript?: string
}

function App() {
  const [tab, setTab] = useState<'search' | 'kb' | 'import'>('search')
  const [videoCount, setVideoCount] = useState(12)
  const location = useLocation()
  const navigate = useNavigate()

  // Sync tab with URL
  useEffect(() => {
    if (location.pathname === '/') setTab('search')
    else if (location.pathname === '/library') setTab('kb')
    else if (location.pathname === '/sync') setTab('import')
  }, [location.pathname])

  // Load video count from Supabase on mount
  useEffect(() => {
    async function loadVideoCount() {
      const { count } = await supabase
        .from('videos')
        .select('*', { count: 'exact', head: true })
      if (count !== null && count > 0) {
        setVideoCount(count)
      }
    }
    loadVideoCount()
  }, [])

  const tabBtn = (active: boolean) => ({
    flex: 1,
    padding: '10px 0',
    textAlign: 'center' as const,
    fontSize: '13px',
    fontWeight: active ? 600 : 400,
    color: active ? '#ff9843' : 'rgba(240,236,228,0.4)',
    cursor: 'pointer' as const,
    background: 'none' as const,
    border: 'none' as const,
    borderBottom: `2px solid ${active ? '#ff9843' : 'transparent'}`,
    transition: 'all 0.2s',
  })

  return (
    <div className="w-full max-w-[420px] mx-auto min-h-screen bg-gradient-to-b from-[#1a1714] to-[#0f0d0a] text-[#f0ece4] flex flex-col relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-30 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-radial-gradient(from-orange-500/8 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="px-5 pt-4 relative z-10">
        <div className="flex items-center gap-2.5 mb-1">
          <span className="text-[26px]">🫙</span>
          <h1 className="text-[22px] font-bold m-0 tracking-tight">记忆罐</h1>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/15 text-[#ff9843] font-medium">{videoCount} 条视频已解析</span>
        </div>
        <p className="text-[12px] text-white/35 m-0 mb-3">抖音收藏 → AI语音转录 → 智能问答</p>

        <div className="flex border-b border-white/6">
          <button style={tabBtn(tab === 'search')} onClick={() => { setTab('search'); navigate('/') }}>🔍 问记忆</button>
          <button style={tabBtn(tab === 'kb')} onClick={() => { setTab('kb'); navigate('/library') }}>📚 知识库</button>
          <button style={tabBtn(tab === 'import')} onClick={() => { setTab('import'); navigate('/sync') }}>📥 同步</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto relative z-10">
        <Routes>
          <Route path="/" element={<SearchPage mockItems={MOCK_ITEMS} searchResponses={SEARCH_RESPONSES} />} />
          <Route path="/library" element={<LibraryPage mockItems={MOCK_ITEMS} />} />
          <Route path="/sync" element={<SyncPage onSyncComplete={() => setVideoCount(12)} />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
