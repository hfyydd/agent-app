import { createClient } from "@/utils/supabase/client";
import { FeaturedWorkflow, Workflow } from "@/types";

export async function fetchFeaturedWorkflow(): Promise<FeaturedWorkflow | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('featured_workflow')
    .select(`
      workflow_id,
      workflows (
        id,
        name,
        description
      )
    `)
    .single<FeaturedWorkflow>();

  if (error) {
    console.error('Error fetching featured workflow:', error);
    return null;
  }

  return data;
}

export async function fetchWorkflows(): Promise<Workflow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('workflows')
    .select(`
      *,
      downloads:purchases(count)
    `)
    .eq('approved', 'approved')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching workflows:', error);
    return [];
  }

  return data.map(workflow => ({
    ...workflow,
    downloads: workflow.downloads[0]?.count || 0
  }));
}
