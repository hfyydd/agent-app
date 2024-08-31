import { createStore } from 'zustand'
import { createClient } from "@/utils/supabase/client";

interface Tag {
  id: string;
  name: string;
}

interface TagState {
  tags: Tag[];
  loading: boolean;
  fetchTags: () => Promise<void>;
}

export const useTagStore = createStore<TagState>()((set) => ({
  tags: [],
  loading: false,
  fetchTags: async () => {
    set({ loading: true });
    const supabase = createClient();
    try {
      const { data: tags, error } = await supabase
        .from('tags')
        .select('*');

      if (error) throw error;

      set({ tags: tags || [], loading: false });
    } catch (error) {
      //console.error('获取标签失败:', error);
      set({ tags: [], loading: false });
    }
  }
}));
