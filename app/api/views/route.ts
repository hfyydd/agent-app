import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface Workflow {
  views: number;
}

export async function GET(req: NextRequest) {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('workflows')
      .select('views');

    if (error) throw error;

    const totalViews = (data as Workflow[]).reduce((sum, row) => sum + (row.views || 0), 0);

    return NextResponse.json({ totalViews });
  } catch (error) {
    console.error('获取总浏览量失败:', error);
    return NextResponse.json({ error: '获取总浏览量失败' }, { status: 500 });
  }
}