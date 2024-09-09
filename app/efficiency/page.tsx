'use client'
import Head from 'next/head';

interface Tool {
  id: string;
  name: string;
  description: string;
  url: string;
  icon_url: string;
}

const tools: Tool[] = [
  {
    id: '1',
    name: 'E2MUI',
    description: '强大的AI对话模型,可用于各种自然语言处理任务。',
    url: '/e2mui',
    icon_url: '/images/e2mui.png',
  },
  {
    id: '2',
    name: 'Dify Helper',
    description: 'AI图像生成工具,可根据文字描述创作高质量图片。',
    url: 'https://difyhelper.opacity.ink',
    icon_url: '/images/dify.png',
  },
  {
    id: '3',
    name: 'Dify',
    description: '开源LLM应用开发平台,用于构建复杂的AI工作流。',
    url: 'https://dify.ai/',
    icon_url: '/images/dify.png',
  },
  // 可以继续添加更多工具...
];

export default function ToolsPage() {
  return (
    <>
      <Head>
        <title>AI工具分享</title>
        <meta name="description" content="Dify相关的AI工具分享" />
      </Head>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-4 mb-6">
          <img src="/images/dify.png" alt="Dify Logo" className="w-12 h-12" />
          <h1 className="text-4xl font-bold">Dify</h1>
        </div>

        <h2 className="text-2xl font-semibold mb-6 dark:text-white">AI工具分享</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool) => (
            <div key={tool.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
              <div className="p-4">
                <div className="flex items-center mb-4">
                  <img src={tool.icon_url} alt={`${tool.name} icon`} className="w-8 h-8 mr-2" />
                  <h3 className="text-lg font-semibold dark:text-white">{tool.name}</h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{tool.description}</p>
                <a 
                  href={tool.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
                >
                  访问工具
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
      <footer className="w-full border-t border-t-foreground/10 p-4 text-center">
        <p className="text-xs">
          Powered by{" "}
          <a
            href=""
            target="_blank"
            className="font-bold hover:underline"
            rel="noreferrer"
          >
            找自己
          </a>
        </p>
      </footer>
    </>
  );
}