/**
 * Search Videos - Edge Function
 * 向量语义搜索 + LLM 生成回答
 *
 * 依赖: ChromaDB + BGE embedding
 * 需要服务端部署
 */

const BGE_MODEL_PATH = '/path/to/bge-large-zh'

const ANSWER_PROMPT = `你是用户的私人知识助手。用户收藏了一些抖音视频，以下是与用户问题相关的视频内容。
请基于这些内容回答用户的问题，回答要具体实用，引用具体的配方和数据。
如果内容不足以回答，如实告知。

用户问题：{query}

相关视频内容：
{context}

请用自然语言回答，并在适当处提及视频来源。`

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
    const { query } = await req.json()

    if (!query || !query.trim()) {
      return new Response(
        JSON.stringify({ error: 'query is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // TODO: 实现向量搜索
    // 需要服务端部署 ChromaDB + BGE embedding
    // pip install chromadb sentence-transformers

    /*
    // 伪代码实现:
    // 1. 生成 query embedding
    const encoder = new SentenceEncoder(BGE_MODEL_PATH)
    const queryEmbedding = await encoder.encode(query)

    // 2. 向量检索
    const chroma = new ChromaDBClient('http://localhost:8000')
    const results = await chroma.collection('videos').query(
      query_embeddings=[queryEmbedding],
      n_results=5
    )

    // 3. 构建上下文
    const context = results.documents[0].map((doc, i) => {
      const meta = results.metadatas[0][i]
      return `【${meta.title}】${meta.summary}`
    }).join('\n\n')

    // 4. 调用 LLM 生成回答
    const answer = await llm.chat(ANSWER_PROMPT
      .replace('{query}', query)
      .replace('{context}', context))
    */

    // 返回模拟搜索结果（用于开发）
    const mockVideos = [
      { id: '1', title: 'Negroni 经典配方', summary: '金酒30ml + 金巴利30ml + 甜味美思30ml', author: '@调酒师阿杰' },
      { id: '3', title: 'Whiskey Sour 完整教学', summary: '波本威士忌60ml + 鲜柠檬汁30ml + 糖浆15ml', author: '@调酒师阿杰' },
      { id: '4', title: 'Old Fashioned 三种做法对比', summary: '经典做法 vs 糖浆法 vs 日式搅拌法', author: '@威士忌老炮' },
    ]

    const mockAnswer = `找到3条威士忌相关的内容。Whiskey Sour 走酸甜路线，需要干摇蛋清打泡沫；Old Fashioned 走经典甜苦路线，视频里对比了三种做法，推荐新手用糖浆法。Negroni 是经典的三等分鸡尾酒，金酒、金巴利、甜味美思各30ml，搅拌30-40下即可。`

    return new Response(
      JSON.stringify({
        query,
        answer: mockAnswer,
        sources: mockVideos.map((v, i) => ({
          video_id: v.id,
          title: v.title,
          author: v.author,
          summary: v.summary,
          relevance_score: 0.95 - i * 0.1
        }))
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
