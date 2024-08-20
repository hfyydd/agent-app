import { createClient } from "@/utils/supabase/server";

import Link from "next/link";

export default async function AccountOverviewPage() {
  const supabase = createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError) {
    console.error("Error fetching user:", userError);
    return <div>Error authenticating user. Please log in and try again.</div>;
  }

  if (!user) {
    return <div>Please log in to view your account.</div>;
  }

  // 然后获取账户数据，使用用户ID来确保只获取当前用户的数据
  const { data: account, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    console.error("Error fetching account data:", error);
    return <div>Error loading account data. Please try again later.</div>;
  }

  if (!account) {
    return <div>No account data found. Please contact support.</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">账户总览</h1>
      <h2 className="text-2xl font-bold mb-6 dark:text-white">10 考拉币🐨 = 1 元</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2 dark:text-white">余额（考拉币）</h2>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{account.balance.toFixed(2)} 考拉币</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2 dark:text-white">累计充值（考拉币）</h2>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{account.cumulative_charge.toFixed(2)} 考拉币</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2 dark:text-white">赠送金额（考拉币）</h2>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{account.gift_amount.toFixed(2)} 考拉币</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
          <h2 className="text-lg font-semibold mb-2 dark:text-white">总消费（考拉币）</h2>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">{account.total_consumption.toFixed(2)} 考拉币</p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow mb-6">
        <h2 className="text-lg font-semibold mb-2 dark:text-white">消费明细</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">昨日消费（考拉币）</p>
            <p className="text-xl font-semibold dark:text-white">{account.yesterday_consumption.toFixed(2)} 考拉币</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">本月消费（考拉币）</p>
            <p className="text-xl font-semibold dark:text-white">{account.this_month_consumption.toFixed(2)} 考拉币</p>
          </div>
        </div>
      </div>
      
      <Link
        href="/dashboard/recharge"
        className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors"
      >
        去充值
      </Link>
    </div>
  );
}