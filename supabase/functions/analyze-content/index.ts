/**
 * Analyze Content - Edge Function
 * 使用 LLM 对视频内容进行结构化分析
 *
 * 依赖: minimax API 或自托管 LLM
 */

const MINIMAX_API_KEY = Deno.env.get('MINIMAX_API_KEY') || ''
const MINIMAX_API_BASE = Deno.env.get('MINIMAX_API_BASE') || 'https://api.minimax.chat/v1'

const ANALYSIS_PROMPT = `你是一个内容分析助手。请分析以下抖音视频的转录内容，输出JSON格式的结构化数据。

视频信息：
- 标题：{title}
- 作者：{author}
- 描述：{description}
- 转录文本：{transcript}

请输出以下JSON：
{
  "summary": "100字以内的内容摘要，提取核心要点",
  "category": "一级分类，如：配方、原理、技巧、器具、入门指南、评测、合集",
  "tags": ["标签1", "标签2", "标签3"],
  "key_info": {
    // 根据内容类型提取关键信息
  },
  "related_keywords": ["关键词1", "关键词2"]
}`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    const { video_id, title, author, description, transcript } = await req.json()

    if (!transcript) {
      return new Response(
        JSON.stringify({ error: 'transcript is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 如果没有配置 minimax API，返回模拟数据
    if (!MINIMAX_API_KEY) {
      return new Response(
        JSON.stringify({
          video_id,
          summary: 'AI分析服务开发中...',
          category: '配方',
          tags: ['示例标签'],
          key_info: {},
          related_keywords: [],
          message: '需要配置 MINIMAX_API_KEY'
        }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    // 调用 minimax API 进行分析
    const prompt = ANALYSIS_PROMPT
      .replace('{title}', title || '')
      .replace('{author}', author || '')
      .replace('{description}', description || '')
      .replace('{transcript}', transcript.slice(0, 4000))  // 限制长度

    const response = await fetch(`${MINIMAX_API_BASE}/text/chatcompletion_v2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MINIMAX_API_KEY}`
      },
      body: JSON.stringify({
        model: 'abab6.5s-chat',
        messages: [
          { role: 'system', content: '你是一个内容分析助手，擅长提取视频的核心信息和标签。' },
          { role: 'user', content: prompt }
        ]
      })
    })

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''

    // 尝试解析 JSON
    let analysis
    try {
      analysis = JSON.parse(content)
    } catch {
      analysis = {
        summary: content.slice(0, 200),
        category: '未分类',
        tags: [],
        key_info: {},
        related_keywords: []
      }
    }

    return new Response(
      JSON.stringify({
        video_id,
        ...analysis,
        llm_raw_response: content
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
