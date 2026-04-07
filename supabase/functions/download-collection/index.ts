/**
 * Download Collection - Edge Function
 * 使用 TikTokDownloader 批量下载收藏夹视频
 *
 * 依赖: TikTokDownloader (JoeanAmier/TikTokDownloader)
 * 需要在服务端安装并配置
 */

const TIKTOK_DOWNLOADER_PATH = '/path/to/TikTokDownloader'

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
    const { url, code, cookie } = await req.json()

    if (!url && !code) {
      return new Response(
        JSON.stringify({ error: 'url or code is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // TODO: 实现 TikTokDownloader 调用
    // 这个功能需要服务端安装 TikTokDownloader
    // 参考: https://github.com/JoeanAmier/TikTokDownloader

    /*
    // 伪代码实现:
    const input = url || code
    const cmd = new Deno.Command('python', {
      args: [
        'main.py',
        '--url', input,
        '--cookie', cookie,
        '--mode', 'collection',
        '--output', './data/temp'
      ],
      cwd: TIKTOK_DOWNLOADER_PATH
    })
    const output = await cmd.output()
    const videos = JSON.parse(new TextDecoder().decode(output.stdout))
    */

    // 返回模拟数据用于开发
    return new Response(
      JSON.stringify({
        task_id: crypto.randomUUID(),
        status: 'downloading',
        videos: [],
        message: '视频下载服务开发中...'
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
