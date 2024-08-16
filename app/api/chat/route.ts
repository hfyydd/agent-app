import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic';
import { ToolInvocation, convertToCoreMessages, streamText } from 'ai'
import { codeBlock } from 'common-tags'

import { createVertex } from '@ai-sdk/google-vertex';
import { ollama } from 'ollama-ai-provider';
import { tools } from '@/lib/tools'
import { convertToCoreTools } from '@/lib/tools'

import { createAzure } from '@ai-sdk/azure';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

type Message = {
  role: 'user' | 'assistant'
  content: string
  toolInvocations?: (ToolInvocation & { result: any })[]
}





const zhipu = createOpenAI({
  baseURL: "https://open.bigmodel.cn/api/paas/v4/",
  //从环境变量中获取
  apiKey: process.env.ZHIPU_API_KEY,
});

const azure = createAzure({
  //baseURL: "https://agent-app.openai.azure.com",
  //从环境变量中获取
  resourceName: "agent-app",
  apiKey: process.env.AZURE_API_KEY,
});






export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json()
  console.log(messages)
  // 使用 map 和 join 来格式化所有消息
  //const formattedMessages = messages.map(formatMessage).join('\n---\n')

  //console.log(formattedMessages)

  //console.log(convertToCoreTools(tools))

  const result = await streamText({
    system: codeBlock`
      您是一个有帮助的数据库助手。在后台，您可以访问一个名为 PGlite 的浏览器内 Postgres 数据库（https://github.com/electric-sql/pglite）。
    关于这个数据库的一些特别说明：
    - 不支持外部数据包装器
    - 以下扩展可用：
      - plpgsql [预启用]
      - vector (https://github.com/pgvector/pgvector) [预启用]
        - 使用 <=> 表示余弦距离（默认使用这个）
        - 使用 <#> 表示负内积
        - 使用 <-> 表示 L2 距离
        - 使用 <+> 表示 L1 距离
        - 注意查询的向量会因其大小而被截断/编辑 - 如果需要完整向量，请导出为 CSV

    生成表时，请遵循以下规则：
    - 对于主键，始终使用 "id bigint primary key generated always as identity"（不使用 serial）
    - 优先使用 'text' 而不是 'varchar'
    - 保持解释简洁但有帮助

    创建示例数据时：
    - 使数据真实，包括关联数据
    - 检查表中是否存在现有记录/冲突

    查询数据时，默认限制为 5 条。

    执行全文搜索时，始终使用 'simple'（不支持其他语言）。

    导入 CSV 时，尽量自己解决问题（例如，使用通用文本列，然后再细化），
    而不是要求用户更改 CSV。

    您也懂数学。所有数学方程式和表达式必须用 KaTex 编写，并用双美元符号 \`$$\` 包裹：
      - 内联：$$\\sqrt{26}$$
      - 多行：
          $$
          \\sqrt{26}
          $$

    不允许使用图像。不要尝试生成或链接图像，包括 base64 数据 URL。
    请随意为可疑的拼写错误提出更正建议。


  `,
    model: zhipu("glm-4"),//azure("gpt-4o-mini"),//
    messages: convertToCoreMessages(messages),
    tools: convertToCoreTools(tools),
  })

  return result.toAIStreamResponse()
}
