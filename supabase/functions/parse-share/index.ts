/**
 * Parse Share Text - Edge Function
 * 解析抖音分享文本，提取链接或口令码
 */

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
    const { share_text } = await req.json()

    if (!share_text || !share_text.trim()) {
      return new Response(
        JSON.stringify({ error: 'share_text is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    const text = share_text.trim()

    // 1. 尝试匹配口令码 ##...## 格式
    const codeMatch = text.match(/##([^#]+)##/)
    if (codeMatch) {
      const code = codeMatch[1].trim()
      if (code.length >= 4) {
        return new Response(
          JSON.stringify({
            code,
            parsed_type: 'code',
            url: null,
          }),
          {
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }
    }

    // 2. 尝试匹配URL
    const urlPatterns = [
      /https?:\/\/[a-zA-Z0-9]+\.[a-zA-Z]{2,}\/[^\s\]"]+/gi,
      /https?:\/\/v\.douyin\.com\/[^\s\]"]+/gi,
    ]

    for (const pattern of urlPatterns) {
      const urlMatch = text.match(pattern)
      if (urlMatch) {
        let url = urlMatch[0].trim()
        // 清理URL末尾的引号
        url = url.replace(/["')]+$/, '')
        return new Response(
          JSON.stringify({
            url,
            parsed_type: 'link',
            code: null,
          }),
          {
            headers: { 'Content-Type': 'application/json' },
          }
        )
      }
    }

    // 3. 尝试匹配短链格式
    const shortLinkMatch = text.match(/([a-zA-Z0-9]+\.[a-zA-Z]{2,}\/[a-zA-Z0-9]+)/)
    if (shortLinkMatch) {
      const url = `https://${shortLinkMatch[1]}`
      return new Response(
        JSON.stringify({
          url,
          parsed_type: 'link',
          code: null,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // 4. 返回原始文本作为尝试
    return new Response(
      JSON.stringify({
        url: text,
        parsed_type: 'text',
        code: null,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
})
