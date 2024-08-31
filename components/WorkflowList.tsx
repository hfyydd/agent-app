// components/WorkflowList.tsx
"use client"

import { useSearchParams } from "next/navigation";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import ToolCard from "@/components/ToolCard";
import { useUserStore } from "@/store/userStore";
import { useStore } from 'zustand'
import { Workflow } from "@/types";

interface WorkflowListProps {
  workflows: Workflow[];
}

type SortOption = 'price' | 'views' | 'updated_at' | 'downloads';

export default function WorkflowList({ workflows }: WorkflowListProps) {
  const [sortBy, setSortBy] = useState<SortOption>('updated_at');
  const [visibleWorkflows, setVisibleWorkflows] = useState<Workflow[]>([]);
  const [page, setPage] = useState(1);
  const loaderRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const tagId = searchParams.get('tag');
  const searchTerm = searchParams.get('search');
  const { user, loading, fetchUser } = useStore(useUserStore, (state) => ({
    user: state.user,
    loading: state.loading,
    fetchUser: state.fetchUser
  }));
  useEffect(() => {
    fetchUser();
  }, [fetchUser]); // 获取用户信息

  // useEffect(() => {
  //   console.log(`tagId: ${tagId}`);
  //   console.log(`workflows: ${workflows.length}`);
  // }, [tagId]);


  const filteredAndSortedWorkflows = useMemo(() => {
    return workflows
      .filter(workflow => {
        const matchesTag = !tagId || workflow.tags.includes(tagId);
        const matchesSearch = !searchTerm ||
          workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTag && matchesSearch;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price':
            return (a.price || 0) - (b.price || 0);
          case 'views':
            return b.views - a.views;
          case 'updated_at':
            return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
          case 'downloads':
            return b.downloads - a.downloads;
          default:
            return 0;
        }
      });
  }, [workflows, tagId, searchTerm, sortBy]);

  // useEffect(() => {
  //   const fetchUserBalance = async () => {
  //     if (user) {
  //       const { data, error } = await supabase
  //         .from('accounts')
  //         .select('balance')
  //         .eq('user_id', user.id)
  //         .single();
  //       if (data) {
  //         setUserBalance(data.balance);
  //       } else if (error) {
  //         console.error('Error fetching user balance:', error);
  //       }
  //     }
  //   };

  //   fetchUserBalance();
  // }, [user]);




  const loadMoreWorkflows = useCallback(() => {
    setVisibleWorkflows(prev => {
      const newWorkflows = filteredAndSortedWorkflows.slice(0, (page) * 20);
      return newWorkflows;
    });
    setPage(prev => prev + 1);
  }, [page, filteredAndSortedWorkflows]);

  useEffect(() => {
    setVisibleWorkflows([]);
    setPage(1);
  }, [sortBy, tagId, searchTerm]);

  useEffect(() => {
    if (page === 1) {
      loadMoreWorkflows();
    }
  }, [page, loadMoreWorkflows]);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "20px",
      threshold: 1.0
    };

    const observer = new IntersectionObserver((entities) => {
      const target = entities[0];
      if (target.isIntersecting && visibleWorkflows.length < filteredAndSortedWorkflows.length) {
        loadMoreWorkflows();
      }
    }, options);

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [loaderRef, visibleWorkflows.length, filteredAndSortedWorkflows.length, loadMoreWorkflows]);

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <label htmlFor="sort" className="mr-2">排序方式：</label>
        <select
          id="sort"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="border rounded p-1"
        >
          <option value="name">更新时间</option>
          <option value="downloads">下载量</option>
          <option value="views">浏览量</option>
          <option value="price">价格</option>

        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {visibleWorkflows.map((workflow) => (
          <ToolCard
            key={workflow.id}
            id={workflow.id}
            title={workflow.name}
            description={workflow.description}
            tagIds={workflow.tags}
            content={workflow.content}
            price={workflow.price}
            icon_url={workflow.icon_url}
            test_url={workflow.test_url}
            views={workflow.views}
            downloads={workflow.downloads}
            content_image_url={workflow.content_image_url}
            user={user}
          />
        ))}
      </div>
      <div ref={loaderRef} className="h-10 flex items-center justify-center">
        {visibleWorkflows.length < filteredAndSortedWorkflows.length && (
          <span className="text-gray-500">加载更多...</span>
        )}
      </div>
    </div>
  );
}