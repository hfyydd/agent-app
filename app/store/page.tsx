"use client"
import { useState, useEffect } from 'react';
import TagNav from "@/components/TagNav";
import WorkflowList from "@/components/WorkflowList";
import ReactMarkdown from "react-markdown";
import { fetchFeaturedWorkflow, fetchWorkflows } from "@/app/actions/storeActions";
import { FeaturedWorkflow, Workflow } from "@/types";
import Link from "next/link";

export default function Index() {
  const [featuredWorkflow, setFeaturedWorkflow] = useState<FeaturedWorkflow | null>(null);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const featuredData = await fetchFeaturedWorkflow();
        if (featuredData) {
          setFeaturedWorkflow(featuredData);
        }

        const workflowsData = await fetchWorkflows();
        setWorkflows(workflowsData);
      } catch (error) {
        console.error('Unexpected error:', error);
        setError('发生了意外错误。请稍后再试。');
      }
    };

    fetchData();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="container mx-auto px-4 py-8 w-full">
        {featuredWorkflow && featuredWorkflow.workflows && (
          <header className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{featuredWorkflow.workflows.name}</h1>
            <ReactMarkdown>
              {featuredWorkflow.workflows.description.slice(0, 200) + (featuredWorkflow.workflows.description.length > 100 ? '...' : '')}
            </ReactMarkdown>
          
            <a
              href={`/chat?workflow=${featuredWorkflow.workflows.id}`}
              className="bg-black text-white px-4 py-2 rounded-full inline-block hover:bg-gray-800 transition-colors"
            >
              现在就试试吧
            </a>
          </header>
        )}
        <TagNav />
        <WorkflowList workflows={workflows} />
      </div>
      
      {/* 添加新的页脚 */}
      <footer className="mt-16 pt-8 border-t border-gray-200">
        <div className="text-center text-sm text-gray-500">
          <p>选择购买即表示您同意我们的服务条款和隐私政策。</p>
          <div className="mt-4 space-x-4">
            <Link href="/terms_store" className="text-blue-500 hover:underline">
              Terms of Service
            </Link>
            <Link href="/privacy_store" className="text-blue-500 hover:underline">
              Privacy Policy
            </Link>
            <Link href="/refund_store" className="text-blue-500 hover:underline">
              Refund Policy
            </Link>
          </div>
          <p className="mt-4">
            Powered by 找自己
          </p>
          {/* 添加ICP备案号 */}
          <p className="mt-4">
            <a href="https://beian.miit.gov.cn" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:underline">
              苏ICP备2024131857号-1
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}