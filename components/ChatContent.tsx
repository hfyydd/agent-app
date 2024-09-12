// components/ChatContent.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from "@/utils/supabase/client";

interface Workflow {
  id: string;
  name: string;
  test_url: string;
  // 添加其他必要的字段
}

export default function ChatContent() {
  const searchParams = useSearchParams();
  const workflowId = searchParams.get('workflow');
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);
  const [showHttpWarning, setShowHttpWarning] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchWorkflow = async () => {
      setIsLoading(true);
      setError(null);
      const supabase = createClient();
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', workflowId)
        .single();

      if (error) {
        console.error('Error fetching workflow:', error);
        setError('Failed to load workflow. Please try again.');
      } else {
        setWorkflow(data);
        if (data.test_url && data.test_url.startsWith('http://')) {
          setShowHttpWarning(true);
        } else if (!data.test_url) {
          // 如果没有测试链接，开始倒计时
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                router.push('/store');
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      }
      setIsLoading(false);
    };

    if (workflowId) {
      fetchWorkflow();
    } else {
      setError('No workflow specified');
      setIsLoading(false);
    }
  }, [workflowId, router]);

  const handleConfirmHttp = () => {
    setShowHttpWarning(false);
    if (workflow?.test_url) {
      window.open(workflow.test_url, '_blank', 'noopener,noreferrer');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  if (!workflow) {
    return <div className="flex justify-center items-center h-screen">No workflow found</div>;
  }

  return (
    <>
      <style jsx>{`
        @keyframes fadeNumber {
          0% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0; transform: scale(1); }
        }
        .countdown-number {
          animation: fadeNumber 1s ease-out;
        }
      `}</style>
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-7xl flex justify-between items-center px-4 sm:px-6 lg:px-8">
          <div className="text-2xl font-bold">{workflow.name}</div>
        </div>
      </nav>

      <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto w-full h-full">
          {showHttpWarning && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-xl">
                <h2 className="text-xl font-bold mb-4">警告：HTTP的连接</h2>
                <p className="mb-4">您即将访问一个 HTTP 网站。是否继续？</p>
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowHttpWarning(false)}
                    className="mr-2 px-4 py-2 bg-gray-200 rounded"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleConfirmHttp}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                  >
                    继续
                  </button>
                </div>
              </div>
            </div>
          )}
          {workflow.test_url && !showHttpWarning ? (
            <iframe
              src={workflow.test_url}
              style={{
                width: '100%',
                height: '80vh',
                minHeight: '700px',
                border: 'none',
              }}
              allow="microphone"
            />
          ) : (
            <div className="flex flex-col justify-center items-center h-[80vh] text-lg text-gray-500">
              {workflow.test_url ? (
                <p>点击"继续"按钮以在新标签页中打开测试链接</p>
              ) : (
                <>
                  <p>暂无测试连接</p>
                  <div className="mt-8 text-6xl font-bold">
                    <span className="countdown-number">{countdown}</span>
                  </div>
                  <p className="mt-4 text-sm">秒后自动返回商店页面...</p>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </>
  );
}