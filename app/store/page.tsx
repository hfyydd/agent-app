"use client"
import { useState, useEffect } from 'react';
import TagNav from "@/components/TagNav";
import WorkflowList from "@/components/WorkflowList";
import ReactMarkdown from "react-markdown";
import { fetchFeaturedWorkflow, fetchWorkflows } from "@/app/actions/storeActions";
import { FeaturedWorkflow, Workflow } from "@/types";

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
    </div>

  );
}