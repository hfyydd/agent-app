// app/basicinfo/page.tsx
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function BasicInfoPage() {
  const cookieStore = cookies();
  const supabase = createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return <div>Error loading user information</div>;
  }

  return (
    <div className="p-4 dark:bg-gray-800">
      <h1 className="text-2xl font-bold mb-4 dark:text-white">基本信息</h1>
      <div className="bg-white dark:bg-gray-700 shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="email">
            电子邮件
          </label>
          <p className="text-gray-900 dark:text-gray-100" id="email">{user.email}</p>
        </div>
        {/* <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="userId">
            用户 ID
          </label>
          <p className="text-gray-900 dark:text-gray-100" id="userId">{user.id}</p>
        </div> */}
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="phone">
            手机号
          </label>
          <p className="text-gray-900 dark:text-gray-100" id="phone">{user.phone || '未设置'}</p>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="lastSignIn">
            上次登录时间
          </label>
          <p className="text-gray-900 dark:text-gray-100" id="lastSignIn">
            {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : '未知'}
          </p>
        </div>
      </div>
    </div>
  );
}