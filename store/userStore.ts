import { createStore } from 'zustand/vanilla'
import { createClient } from "@/utils/supabase/client";
import { User } from '@supabase/supabase-js';

interface UserWithBalance extends User {
  balance: number;
}

interface UserState {
  user: UserWithBalance | null;
  loading: boolean;
  fetchUser: () => Promise<void>;
}

export const useUserStore = createStore<UserState>((set) => ({
  user: null,
  loading: true,
  fetchUser: async () => {
    const supabase = createClient();
    set({ loading: true });
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;

      if (user) {
        const { data: accountData, error: accountError } = await supabase
          .from('accounts')
          .select('balance')
          .eq('user_id', user.id)
          .single();

        if (accountError) throw accountError;

        set({
          user: {
            ...user,
            balance: accountData?.balance ?? 0
          },
          loading: false
        });
      } else {
        set({ user: null, loading: false });
      }
    } catch (error) {
      //console.error('获取用户信息失败:', error);
      set({ user: null, loading: false });
    }
  }
}));

// 初始化监听器
export const initializeAuthListener = () => {
  const supabase = createClient();
  const { fetchUser } = useUserStore.getState();

  fetchUser();

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (event, session) => {
      fetchUser();
    }
  );

  return () => subscription.unsubscribe();
};
