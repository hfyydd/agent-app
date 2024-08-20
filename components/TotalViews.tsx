"use client"
import { useEffect, useState } from 'react';

export default function TotalViews() {
  const [totalViews, setTotalViews] = useState<number | null>(null);

  useEffect(() => {
    async function fetchTotalViews() {
      try {
        const response = await fetch('/api/views');
        const data = await response.json();
        console.log(data);
        setTotalViews(data.totalViews);
      } catch (error) {
        console.error('获取总浏览量失败:', error);
      }
    }

    fetchTotalViews();
  }, []);

  return (
    <div className="text-sm text-gray-500">
      总浏览量: {totalViews !== null ? totalViews : '加载中...'}
    </div>
  );
}
