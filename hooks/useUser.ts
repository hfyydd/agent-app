import { useState, useEffect } from 'react';
import { createClient } from "@/utils/supabase/client";
import { User } from '@supabase/supabase-js';

interface UserWithBalance extends User {
  balance: number;
}

export function useUser() {
  const [user, setUser] = useState<UserWithBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
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


          setUser({
            ...user,
            balance: accountData?.balance ?? 0
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      } finally {
        setLoading(false);
      }
    }

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        getUser();
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
}