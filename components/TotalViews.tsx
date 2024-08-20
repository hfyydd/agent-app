"use client"
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';

export default function TotalViews() {
    const supabase = createClient();
    const [totalViews, setTotalViews] = useState<number | null>(null);

    useEffect(() => {
        fetchTotalViews();

        const channel = supabase
            .channel('table-db-changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'workflows' },
                (payload) => {
                    fetchTotalViews();
                }
            )
            .subscribe((status) => {
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    async function fetchTotalViews() {
        try {
            const response = await fetch('/api/views');
            const data = await response.json();
            setTotalViews(data.totalViews);
        } catch (error) {
            console.error('获取总浏览量失败:', error);
        }
    }

    return (
        <div className="text-sm text-gray-500">
            总浏览量: {totalViews !== null ? totalViews : '加载中...'}
        </div>
    );
}